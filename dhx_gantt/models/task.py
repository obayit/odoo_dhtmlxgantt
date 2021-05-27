import json
from datetime import timedelta

from odoo import models, fields, api


class DependingTasks(models.Model):
    _name = "project.depending.tasks"
    _description = "Tasks Dependency (m2m)"

    task_id = fields.Many2one('project.task', required=True)
    project_id = fields.Many2one('project.project', compute='_compute_project_id', string='Project')
    depending_task_id = fields.Many2one('project.task', required=True)
    relation_type = fields.Selection([
        ("0", "Finish to Start"),
        ("1", "Start to Start"),
        ("2", "Finish to Finish"),
        ("3", "Start to Finish")
    ], default="0", required=True)
    state = fields.Selection([('draft', 'Draft'), ('confirm', 'Confirm'), ('done', 'Done')], default='draft')

    _sql_constraints = [
        ('task_relation_unique', 'unique(task_id, depending_task_id)', 'Two tasks can have only one relation!'),
    ]

    @api.onchange('task_id', 'depending_task_id')
    def _compute_project_id(self):
        for r in self:
            if r.task_id:
                r.project_id = r.task_id.project_id
            elif r.depending_task_id:
                r.project_id = r.depending_task_id.project_id


class Task(models.Model):
    _inherit = "project.task"

    planned_duration = fields.Float('Duration', default=7, compute='_compute_planned_duration', inverse='_inverse_planned_duration', store=True)
    lag_time = fields.Integer('Lag Time')
    depending_task_ids = fields.One2many('project.depending.tasks', 'task_id')
    dependency_task_ids = fields.One2many('project.depending.tasks', 'depending_task_id')
    links_serialized_json = fields.Char('Serialized Links JSON', compute="compute_links_json")
    date_start = fields.Datetime('Start Date')

    recursive_dependency_task_ids = fields.Many2many(
        string='Recursive Dependencies',
        comodel_name='project.task',
        compute='_compute_recursive_dependency_task_ids'
    )

    @api.depends('date_start', 'date_end')
    def _compute_planned_duration(self):
        for r in self:
            if r.date_start and r.date_end:
                elapsed_seconds = (r.date_end - r.date_start).total_seconds()
                seconds_in_day = 24 * 60 * 60
                r.planned_duration = elapsed_seconds / seconds_in_day
                r = r.with_context(ignore_onchange_planned_duration=True)

    @api.onchange('planned_duration', 'date_start')
    def _inverse_planned_duration(self):
        for r in self:
            if r.date_start and r.planned_duration and not r.env.context.get('ignore_onchange_planned_duration', False):
                r.date_end = r.date_start + timedelta(days=r.planned_duration)

    @api.depends('dependency_task_ids')
    def _compute_recursive_dependency_task_ids(self):
        for task in self:
            task.recursive_dependency_task_ids = task.get_dependency_tasks(
                task, True,
            )

    @api.model
    def get_dependency_tasks(self, task, recursive=False):
        dependency_tasks = task.with_context(
            prefetch_fields=False,
        ).dependency_task_ids
        if recursive:
            for t in dependency_tasks:
                dependency_tasks |= self.get_dependency_tasks(t, recursive)
        return dependency_tasks

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
