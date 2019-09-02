# -*- coding: utf-8 -*-

from odoo import http, _
from odoo.exceptions import AccessError, MissingError
from odoo.http import request
from odoo import http
import json


class GanttController(http.Controller):

    @http.route('/gantt_api', type='http', auth="user")
    def gantt_api(self, page=1, date_begin=None, date_end=None, sortby=None, **kw):
        # main GET method
        tasks = request.env['project.task'].search([('project_id', 'in', [1,2,3,4,5,6,7,8,9])])
        res_tasks = []
        res_links = []
        print(tasks)
        for task in tasks:
		# {"id":22, "text":"Task #4.2", "start_date":"03-04-2018", "duration":"4", "parent":"15", "progress": 0.1, "open": true},
		# {"id":"1","source":"1","target":"2","type":"1"},
            res_tasks.append({
                'id': task.id,
                'text': task.name,
                # yyyy-MM-dd HH:mm
                'start_date': task.date_start.strftime("%d/%m/%Y %H:%M:%S"),
                'duration': task.planned_duration,
                'progress': task.progress,
                'open': task.is_open,
            })
            for link in task.depending_task_ids:
                res_links.append({
                    'id': link.id,
                    'source': link.task_id.id,
                    'target': link.depending_task_id.id,
                    'type': link.relation_type
                })
        return json.dumps({
            'data': res_tasks,
            'links': res_links
        })
