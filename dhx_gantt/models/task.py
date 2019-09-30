# -*- coding: utf-8 -*-

from odoo import models, fields, api
from datetime import timedelta
import datetime
import json


def business_day_correction(target_date):  # , hour=None):
    target_date += datetime.timedelta(hours=2)
    weekday = target_date.weekday()
    if weekday in [4, 5]:
        target_date += datetime.timedelta(days=6-weekday)
    # if target_date.hour == 22:
    #     target_date = target_date.replace(hour=hour, minute=0, second=0, microsecond=0)
    return target_date


def subtract_business_days(from_date, days):
    business_days_to_sub = days - 1
    current_date = from_date
    while business_days_to_sub > 0:
        current_date -= datetime.timedelta(days=1)
        weekday = current_date.weekday()
        if weekday in [4, 5]:  # Monday is 0 and Sunday is 6.
            continue
        business_days_to_sub -= 1
    return current_date


def add_business_days(from_date, days):
    # source: https://stackoverflow.com/a/12691993/3557761
    # original author: omz --> https://stackoverflow.com/users/573626/omz
    # print('from_date = ')
    # print(from_date)
    business_days_to_add = days - 1
    # print('business_days_to_add = ')
    # print(business_days_to_add)
    current_date = from_date
    while business_days_to_add > 0:
        # print('current_date')
        # print(current_date)
        current_date += datetime.timedelta(days=1)
        # print('current_date ++')
        # print(current_date)
        weekday = current_date.weekday()
        if weekday in [4, 5]:  # Monday is 0 and Sunday is 6.
            # print('{0} is not a business day'.format(current_date))
            continue
        business_days_to_add -= 1
    #     print('business_days_to_add = ')
    #     print(business_days_to_add)
    # print('returning ===')
    # print(current_date)
    return current_date


class DependingTasks(models.Model):
    _name = "project.depending.tasks"
    _description = "The many2many table that has extra info (relation_type)"

    task_id = fields.Many2one('project.task', required=True)
    project_id = fields.Many2one(related='task_id.project_id')
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


class Task(models.Model):
    _inherit = "project.task"

    planned_duration = fields.Integer('Duration', default=7)
    lag_time = fields.Integer('Lag Time')
    depending_task_ids = fields.One2many('project.depending.tasks', 'task_id')
    dependency_task_ids = fields.One2many('project.depending.tasks', 'depending_task_id')
    links_serialized_json = fields.Char('Serialized Links JSON', compute="compute_links_json")

    recursive_dependency_task_ids = fields.Many2many(
        string='Recursive Dependencies',
        comodel_name='project.task',
        compute='_compute_recursive_dependency_task_ids'
    )

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
        # evidently this algorithm does not work

        # project = self.project_id
        # tasks = project.task_ids.sorted('date_start')
        tasks = self

        critical_path = []
        critical_tasks = []
        critical_links = []
        # last_end_date = False
        current_task = tasks and tasks[0] or False
        while current_task:
            critical_path.append(current_task)
            critical_tasks.append(current_task.id)
            # print(current_task.depending_task_ids)
            # depending_tasks = current_task.depending_task_ids.mapped('depending_task_id')
            # sorted_by_duration = depending_tasks.sorted('planned_duration', True)
            sorted_by_duration = current_task.depending_task_ids.sorted(lambda dep: dep.depending_task_id.planned_duration, reverse=True)
            if sorted_by_duration:
                current_task = sorted_by_duration[0].depending_task_id
                critical_links.append(sorted_by_duration[0].id)
            else:
                current_task = False

        # print('critical_path')
        txt = ''
        for path in critical_path:
            txt += str(path.date_start) + ' >> '
        # print(txt)
        return {
            'tasks': critical_tasks,
            'links': critical_links
        }

    @api.multi
    def bf_traversal_schedule(self):
        projects = self.mapped('project_id')
        if len(projects) > 1:
            raise UserError("Can't auto schedule more than one project in the same time.")

        tasks = projects and projects.task_ids.sorted()
        leading_tasks = tasks.filtered(lambda t: not t.dependency_task_ids)

        # Mark all the vertices as not visited
        visited = []

        # print('LEADING TASKS')
        # print(leading_tasks.mapped('name'))
        # Breadth First Traversal for every task that have no dependency
        for task in leading_tasks:
            # Create a queue for BFS
            queue = []
            queue.append(task)
            traversal_counter = 0
            # visited.append(task.id)
            while queue:
                traversal_counter += 1
                if traversal_counter > 4069:
                    # break out of a possibly infinite loop
                    # print('# break out of a possibly infinite loop')
                    break
                # Dequeue a vertex from
                # queue and print it
                s = queue.pop(0)
                # print('JUST POPPED')
                # print(s.name)
                s.schedule(visited)
                visited.append(s.id)
                # Get all adjacent vertices of the
                # dequeued vertex s. If a adjacent
                # has not been visited, then mark it
                # visited and enqueue it
                for child in s.depending_task_ids:
                    if child.depending_task_id.id not in visited:
                        queue.append(child.depending_task_id)
                        # visited.append(child.depending_task_id.id)

    @api.multi
    def schedule(self, visited):
        for parent in self.dependency_task_ids:
            date_start = parent.task_id.date_start
            date_end = add_business_days(date_start, parent.task_id.planned_duration)
            # print('schedule task {0} based on parent {1}'.format(self.name, parent.task_id.name))
            # print('parnet starts at {0} and ends at {1}'.format(date_start, date_end))
            if parent.relation_type == "0":  # Finish to Start
                if date_end:
                    todo_date_start = date_end + datetime.timedelta(days=1 - self.lag_time)
                    todo_date_start = business_day_correction(todo_date_start)
                    # print('todo_date_start = {0}'.format(todo_date_start))
                    if self.id in visited:
                        self.date_start = max(todo_date_start, self.date_start)
                        set_date_end = getattr(self, "set_date_end", None)
                        if callable(set_date_end):
                            self.set_date_end()
                        # print('setting date_start to {0}'.format(self.date_start))
                    else:
                        self.date_start = todo_date_start
                        set_date_end = getattr(self, "set_date_end", None)
                        if callable(set_date_end):
                            self.set_date_end()
                        # print('setting date_start to {0}'.format(self.date_start))
            elif parent.relation_type == "1":  # Start to Start
                if date_start:
                    todo_date_start = add_business_days(date_start, self.lag_time)
                    todo_date_start = business_day_correction(todo_date_start)
                    # print('todo_date_start = {0}'.format(todo_date_start))
                    if self.id in visited:
                        self.date_start = max(todo_date_start, self.date_start)
                        set_date_end = getattr(self, "set_date_end", None)
                        if callable(set_date_end):
                            self.set_date_end()
                        # print('setting date_start to {0}'.format(self.date_start))
                    else:
                        self.date_start = todo_date_start
                        set_date_end = getattr(self, "set_date_end", None)
                        if callable(set_date_end):
                            self.set_date_end()
                        # print('setting date_start to {0}'.format(self.date_start))
            elif parent.relation_type == "2":  # Finish to Finish
                if date_end:
                    todo_date_start = subtract_business_days(date_end, self.planned_duration - self.lag_time)
                    todo_date_start = business_day_correction(todo_date_start)
                    # print('todo_date_start = {0}'.format(todo_date_start))
                    if self.id in visited:
                        self.date_start = max(todo_date_start, self.date_start)
                        set_date_end = getattr(self, "set_date_end", None)
                        if callable(set_date_end):
                            self.set_date_end()
                        print('setting date_start to {0}'.format(self.date_start))
                    else:
                        self.date_start = todo_date_start
                        set_date_end = getattr(self, "set_date_end", None)
                        if callable(set_date_end):
                            self.set_date_end()
                        print('setting date_start to {0}'.format(self.date_start))
            elif parent.relation_type == "3":  # Start to Finish
                if date_end:
                    todo_date_start = subtract_business_days(date_start, self.planned_duration - self.lag_time)
                    todo_date_start = business_day_correction(todo_date_start)
                    # print('todo_date_start = {0}'.format(todo_date_start))
                    if self.id in visited:
                        self.date_start = max(todo_date_start, self.date_start)
                        set_date_end = getattr(self, "set_date_end", None)
                        if callable(set_date_end):
                            self.set_date_end()
                        # print('setting date_start to {0}'.format(self.date_start))
                    else:
                        self.date_start = todo_date_start
                        set_date_end = getattr(self, "set_date_end", None)
                        if callable(set_date_end):
                            self.set_date_end()
                        # print('setting date_start to {0}'.format(self.date_start))
