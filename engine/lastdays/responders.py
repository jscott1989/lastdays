
def ping(player, subject, content):
    player.touch()
    player.save()


def move(player, subject, content):
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


def setDirection(player, subject, content):
    player.data["location"]["direction"] = content["direction"]
    player.save()

    player.send_to_room("setDirection", {
        "player": player.id,
        "direction": content["direction"]
    })


def talk(player, subject, content):
    player.send_to_room("talk", {
        "player": player.id,
        "text": content["text"],
    })


def removeFromInventory(player, subject, content):
    player.data["inventory"][content["item"]] -= 1
    if player.data["inventory"][content["item"]] <= 0:
        del player.data["inventory"][content["item"]]
    player.save()


def addToInventory(player, subject, content):
    if content["item"] not in player.data["inventory"]:
        player.data["inventory"][content["item"]] = 0
    player.data["inventory"][content["item"]] += 1
    player.save()


def setPlayerVariable(player, subject, content):
    parts = content["key"].split(".")

    data = player.data

    for part in parts[:-1]:
        if part not in data:
            data[part] = {}
        data = data[part]

    data[parts[-1]] = content["value"]
    player.save()
