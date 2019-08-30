# -*- coding: utf-8 -*-

from odoo import models, fields, api


class Task(models.Model):
    _inherit = "project.task"

    planned_duration = fields.Integer("Planned Duration (in Days)")
    date_start = fields.Datetime('Start Date')
    date_end = fields.Datetime('Start Date')
    progress = fields.Float('Progress')
    is_open = fields.Boolean('Open')
