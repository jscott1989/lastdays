from lastdays.utils import extract_player_from_path
import json
from lastdays import responders
from django.db import transaction


RESPONDERS = {
    "ping": responders.ping,
    "move": responders.move,
    "talk": responders.talk,
    "setPlayerVariable": responders.setPlayerVariable,
    "setWorldVariable": responders.setWorldVariable,
    "removeFromInventory": responders.removeFromInventory,
    "addToInventory": responders.addToInventory,
    "setDirection": responders.setDirection,
    "playSound": responders.playSound,
    "pickDialogue": responders.pickDialogue
}


@transaction.atomic()
def ws_connect(message):
    message.reply_channel.send({"accept": True})
    player = extract_player_from_path(message.content["path"])
    player.connect(message.reply_channel)


@transaction.atomic()
def ws_disconnect(message):
    player = extract_player_from_path(message.content["path"])
    player.disconnect()


@transaction.atomic()
def ws_message(message):
    with transaction.atomic():
        player = extract_player_from_path(message.content["path"])
        command = json.loads(message.content["text"])
        subject = command.get("subject")
        content = command.get("content")
        if subject in RESPONDERS:
            RESPONDERS[subject](player, subject, content)
        else:
            print("Unknown subject: %s" % subject)
