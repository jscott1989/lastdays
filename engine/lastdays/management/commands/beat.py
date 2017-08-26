from django.core.management.base import BaseCommand
from lastdays.periodic import beat


class Command(BaseCommand):
    help = 'Perform periodic actions'

    def handle(self, *args, **options):
        beat()
