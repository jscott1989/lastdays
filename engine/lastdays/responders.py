
def ping(player, channel, subject, content):
    player.touch()
    player.save()


def move(player, channel, subject, content):
    player.data["location"]["x"] = content["x"]
    player.data["location"]["y"] = content["y"]
    player.save()

    move_command = {
        "player": player.id,
        "x": content["x"],
        "y": content["y"],
    }

    if "direction" in content:
        move_command["direction"] = content["direction"]

    player.send_to_room("move", move_command)


def setDirection(player, channel, subject, content):
    player.data["location"]["direction"] = content["direction"]
    player.save()

    player.send_to_room("setDirection", {
        "player": player.id,
        "direction": content["direction"]
    })


def talk(player, channel, subject, content):
    player.send_to_room("talk", {
        "player": player.id,
        "text": content["text"],
    })


def playSound(player, channel, subject, content):
    player.send_to_room("playSound", {
        "player": player.id,
        "sound": content["sound"],
    })


def pickDialogue(player, channel, subject, content):
    player.send_to_room("pickDialogue", {
        "player": player.id,
        "dialogueId": content["dialogueId"],
        "option": content["option"],
        "npc": content["npc"]
    })


def removeFromInventory(player, channel, subject, content):
    player.data["inventory"][content["item"]] -= 1
    if player.data["inventory"][content["item"]] <= 0:
        del player.data["inventory"][content["item"]]
    player.save()


def addToInventory(player, channel, subject, content):
    if content["item"] not in player.data["inventory"]:
        player.data["inventory"][content["item"]] = 0
    player.data["inventory"][content["item"]] += 1
    player.save()


def setPlayerVariable(player, channel, subject, content):
    parts = content["key"].split(".")

    data = player.data

    for part in parts[:-1]:
        if part not in data:
            data[part] = {}
        data = data[part]

    data[parts[-1]] = content["value"]
    player.save()


def setWorldVariable(player, channel, subject, content):
    from lastdays.utils import send_to_all
    send_to_all("setWorldVariable", {
        "key": content["key"],
        "value": content["value"]
    })
    from lastdays.models import World
    parts = content["key"].split(".")

    world = World.get()

    data = world.state

    for part in parts[:-1]:
        if part not in data:
            data[part] = {}
        data = data[part]

    data[parts[-1]] = content["value"]
    world.save()


def goToRoom(player, channel, subject, content):
    player.send_to_room("removePlayer", {
        "player": player.id
    })
    player.data["location"]["room"] = content["room"]
    player.data["location"]["x"] = content["x"]
    player.data["location"]["y"] = content["y"]
    if content.get("direction"):
        player.data["location"]["direction"] = content["direction"]
    player.save()
    player.refresh(channel)
    player.send_to_room("addPlayer", {
        "player": player.player_data()
    })
