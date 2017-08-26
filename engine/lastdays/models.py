from django.db import models
from django.contrib.postgres.fields import JSONField
import json
import datetime

ALL = "__ALL__"


class World(models.Model):
    state = JSONField()

    @staticmethod
    def get():
        world, _ = World.objects.get_or_create(
            pk=1,
            defaults={
                "state": {}
            })
        return world


class Player(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    data = JSONField()
    last_action = models.DateTimeField()
    connected = models.BooleanField(default=False)

    @staticmethod
    def active():
        one_minute_ago = datetime.datetime.now() - datetime.timedelta(
            minutes=1)
        return Player.objects.filter(
            connected=True,
            last_action__gte=one_minute_ago
        )

    @staticmethod
    def get_in_room(room):
        return Player.active().filter(
            data__location__room=room)

    def connect(self, channel):
        from channels import Group
        self.touch()
        self.connected = True

        self.get_player_group().add(channel)
        self.get_room_group().add(channel)
        Group(ALL).add(channel)

        self.save()
        self.refresh(channel)
        self.send_to_room("add_player", {
            "player": self.player_data()
        })

    def refresh(self, channel=None):
        player_data = self.player_data()

        data = {
            "world": World.get().state,
            "player": player_data,
            "room": {
                "players": [p.player_data() for p in Player.get_in_room(
                    player_data["location"]["room"]) if not p == self]
            }
        }

        self.send("refresh", data, channel)

    def player_data(self):
        d = self.data.copy()
        d["id"] = self.id
        return d

    def disconnect(self):
        self.connected = False
        self.save()
        self.send_to_room("remove_player", {
            "player": self.id
        })

    def touch(self):
        self.last_action = datetime.datetime.now()

    def get_player_group(self):
        from channels import Group
        return Group(self.id)

    def get_room_group(self):
        from channels import Group
        return Group(self.data["location"]["room"])

    def send(self, subject, content, channel=None):
        if not channel:
            channel = self.get_player_group()
        channel.send({
            "text": json.dumps({
                "subject": subject,
                "content": content
            })
        })

    def send_to_room(self, subject, content):
        self.send(subject, content, self.get_room_group())
