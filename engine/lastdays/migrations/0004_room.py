# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-08-26 15:54
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lastdays', '0003_player_connected'),
    ]

    operations = [
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.CharField(max_length=255, primary_key=True, serialize=False)),
                ('state', django.contrib.postgres.fields.jsonb.JSONField()),
            ],
        ),
    ]