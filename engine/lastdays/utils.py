from lastdays.models import Player
from lastdays.game import config
from django.utils import timezone


def extract_player_from_path(path):
    player_id = path[4:]

    player, created = Player.objects.get_or_create(
        id=player_id,
        defaults={
            "data": {
                "character": config["default_character"],
                "location": config["starting_location"]
            },
            "last_action": timezone.now()
        }
    )

    if created:
        # TODO: Initialise the player
        # player.save()
        pass

    return player
