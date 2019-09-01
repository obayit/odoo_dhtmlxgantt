# -*- coding: utf-8 -*-

from odoo import models, fields, api
import json

class DependingTasks(models.Model):
    _name = "project.depending.tasks"
    _description = "The many2many table that has extra info (relation_type)"

    task_id = fields.Many2one('project.task')
    depending_task_id = fields.Many2one('project.task')
    relation_type = fields.Selection([
        ("0", "Finish to Start"), 
        ("1", "Start to Start"), 
        ("2", "Finish to Finish"), 
        ("3", "Start to Finish")
    ], default="0", required=True)
    state = fields.Selection([('draft', 'Draft'), ('confirm', 'Confirm'), ('done', 'Done')], default='draft')


class Task(models.Model):
    _inherit = "project.task"

    planned_duration = fields.Integer("Planned Duration (in Days)")
    date_start = fields.Datetime('Start Date')
    date_end = fields.Datetime('End Date')
    progress = fields.Float('Progress')
    is_open = fields.Boolean('Open')
    depending_task_ids = fields.One2many('project.depending.tasks', 'task_id')
    dependency_task_ids = fields.One2many('project.depending.tasks', 'depending_task_id')
    links_serialized_json = fields.Char('Serialized Links JSON', compute="compute_links_json")

    @api.multi
    def compute_links_json(self):
        for r in self:
            links = []
            r.links_serialized_json = '['
            for link in r.dependency_task_ids:
                json_obj = {
                    'id': link.id,
                    'source': link.task_id.id,
                    'target': link.depending_task_id.id,
                    'type': link.relation_type
                }
                links.append(json_obj)
            r.links_serialized_json = json.dumps(links)
