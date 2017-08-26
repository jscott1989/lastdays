from django.core.management.base import BaseCommand
from lastdays.utils import reset_game_state


class Command(BaseCommand):
    help = 'Reset game state'

    def handle(self, *args, **options):
        reset_game_state()
