from lastdays.models import Player, Room, World
from lastdays.game import config
from django.utils import timezone
from lastdays import engine_settings
import os
import yaml
import json


def color_generator():
    while True:
        for color in engine_settings.PLAYER_COLORS:
            yield color


get_next_color = color_generator()


def extract_player_from_path(path):
    player_id = path[4:]

    player, created = Player.objects.select_for_update().get_or_create(
        id=player_id,
        defaults={
            "data": {
                "character": config["default_character"],
                "location": config["starting_location"],
                "inventory": config["starting_inventory"],
                "state": config["initial_player_state"]
            },
            "last_action": timezone.now()
        }
    )

    if created:
        player.data["color"] = get_next_color.__next__()
        player.save()
    return player


def reset_game_state():
    # For now we assume nobody is playing
    # load default items/npcs/etc. into rooms
    for room in Room.objects.all():
        room.delete()

    # This is only during test... in live we should kick everyone to the default place
    for player in Player.objects.all():
        player.delete()

    for world in World.objects.all():
        world.delete()

    for roomId in os.listdir("game/rooms"):
        with open("game/rooms/%s/%s.yaml" % (roomId, roomId)) as o:
            room_config = yaml.load(o.read())
            room = Room(id=roomId, state=room_config.get("default_state", {}))
            room.save()


def send_to_all(subject, content):
    from channels import Group
    Group("__ALL__").send({
        "text": json.dumps({
            "subject": subject,
            "content": content
        })
    })


def get_with_id(collection, id):
    for c in collection:
        if c["id"] == id:
            return c
    return None


def delete_with_id(collection, id):
    return list(filter(lambda i: i["id"] != id, collection))
