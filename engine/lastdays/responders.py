
def ping(player, subject, content):
    player.touch()
    player.save()


def move(player, subject, content):
    player.data["location"]["x"] = content["x"]
    player.data["location"]["y"] = content["y"]
    player.save()

    player.send_to_room("move", {
        "player": player.id,
        "x": content["x"],
        "y": content["y"]
    })
