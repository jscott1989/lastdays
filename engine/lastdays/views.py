from django.shortcuts import render
from django.http import JsonResponse
import os
import yaml


def index(request):
    return render(request, "index.html")


def configuration(request):
    configuration = {}

    for t in ["rooms", "characters", "hotspots", "inventoryitems", "dialogues"]:
        configuration[t] = {}
        for r in os.listdir("game/%s" % t):
            with open("game/%s/%s/%s.yaml" % (t, r, r)) as o:
                configuration[t][r] = yaml.load(o.read())
    return JsonResponse(configuration)
