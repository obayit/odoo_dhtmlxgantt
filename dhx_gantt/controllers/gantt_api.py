# -*- coding: utf-8 -*-

from odoo import http, _
from odoo.exceptions import AccessError, MissingError
from odoo.http import request
from odoo import http
import json


class GanttController(http.Controller):

    @http.route('/gantt_api', type='http', auth="user")
    def gantt_api(self, domain=None, **kw):
        # main GET method
        print('DOMAIN')
        print(type(domain))
        print(domain)
        domain = json.loads(domain)
        print('deserialized DOMAIN')
        print(type(domain))
        print(domain)
        tasks = request.env['project.task'].search(domain).sorted('date_start')
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

    @http.route('/gantt_api/task/<int:task_id>', type='http', auth="user", methods=['PUT'])
    def gantt_api_task_update(self, task_id, open, text, duration, progress, start_date, end_date, parent, **kw):
        # Request URL: http://localhost:8069/gantt_api/task/13
        # Form Data: open: true
        # text: Task 1
        # duration: 2
        # progress: 0.25
        # start_date: 31-08-2019 00:00
        # end_date: 02-09-2019 00:00
        # parent: 0
        print('potis')
        print('start_date')
        print(start_date)
