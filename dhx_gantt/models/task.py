# -*- coding: utf-8 -*-

from odoo import models, fields, api
from datetime import timedelta
import json

class DependingTasks(models.Model):
    _name = "project.depending.tasks"
    _description = "The many2many table that has extra info (relation_type)"

    task_id = fields.Many2one('project.task')
    project_id = fields.Many2one(related='task_id.project_id')
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

    def duration_between_dates(self, date_from, date_to):
        return (date_to - date_from).days

    def add_days(self, target_date, days):
        return target_date + timedelta(days=days)

    @api.multi
    def compute_critical_path(self):
        # evidently the critical path is the longest path on the network graph
        project = self.project_id
        tasks = project.task_ids.sorted('date_start')
        critical_path = []
        # last_end_date = False
        current_task = tasks and tasks[0] or False
        while current_task:
            critical_path.append(current_task)
            print(current_task.depending_task_ids)
            depending_tasks = current_task.depending_task_ids.mapped('depending_task_id')
            sorted_by_duration = depending_tasks.sorted('planned_duration', True)
            current_task = sorted_by_duration and sorted_by_duration[0] or False
        print('critical_path')
        txt = ''
        for path in critical_path:
            txt += str(path.date_start) + ' >> '
        print(txt)
