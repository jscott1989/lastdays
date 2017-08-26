from lastdays.utils import extract_player_from_path
import json
from lastdays import responders


RESPONDERS = {
    "ping": responders.ping,
    "move": responders.move,
    "talk": responders.talk
}


def ws_connect(message):
    player = extract_player_from_path(message.content["path"])
    player.connect(message.reply_channel)
    message.reply_channel.send({"accept": True})


def ws_disconnect(message):
    print("DISCONNECTING")
    player = extract_player_from_path(message.content["path"])
    player.disconnect()


def ws_message(message):
    player = extract_player_from_path(message.content["path"])
    command = json.loads(message.content["text"])
    subject = command.get("subject")
    content = command.get("content")
    if subject in RESPONDERS:
        RESPONDERS[subject](player, subject, content)
    else:
        print("Unknown subject: %s" % subject)
