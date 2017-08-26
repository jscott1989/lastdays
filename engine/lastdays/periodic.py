from lastdays.models import Player
import datetime
from django.utils import timezone


def beat():
    check_timeouts()
    # TODO: Put the game timeout here too


def check_timeouts():
    one_minute_ago = timezone.now() - datetime.timedelta(
            minutes=1)
    for player in Player.objects.filter(
        connected=True,
        last_action__lte=one_minute_ago
    ):
        player.disconnect()
