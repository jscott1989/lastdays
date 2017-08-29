from django.shortcuts import render
from django.http import JsonResponse
import os
import yaml
from django.conf import settings


def index(request):
    return render(request, "index.html", {"debug": settings.DEBUG})


def configuration(request):
    configuration = {}

    for t in ["rooms", "characters", "hotspots", "inventoryitems", "items"]:
        configuration[t] = {}
        for r in os.listdir(os.path.join(settings.GAME_DIRECTORY, t)):
            with open(os.path.join(settings.GAME_DIRECTORY, "%s/%s/%s.yaml" % (t, r, r))) as o:
                configuration[t][r] = yaml.load(o.read())

    configuration["images"] = set()
    for room in configuration["rooms"].values():
        for image in room.get("default_state", {}).get("images", []):
            configuration["images"].add(image["image"])
    configuration["images"] = list(configuration["images"])

    configuration["dialogues"] = {}
    for r in os.listdir("game/dialogues"):
        with open("game/dialogues/%s/%s.yaml" % (r, r)) as o:
            configuration["dialogues"][r] = yaml.load(
                o.read().replace("type: talk", "type: localTalk"))

    # This only supports MP3 - the format will need to change to support more
    configuration["sounds"] = {os.path.splitext(r)[0]: r for r in os.listdir(
        os.path.join(settings.GAME_DIRECTORY, "sounds"))}
    return JsonResponse(configuration)
