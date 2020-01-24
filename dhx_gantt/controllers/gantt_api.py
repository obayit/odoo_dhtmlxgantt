# -*- coding: utf-8 -*-

from odoo import http, _
from odoo.exceptions import AccessError, MissingError
from odoo.http import request
from odoo import http
from datetime import datetime, timedelta
import json
import pytz


class GanttController(http.Controller):

    @http.route('/gantt_api', type='http', auth="user")
    def gantt_api(self, model_name, timezone_offset, domain=None, **kw):
        # main GET method
        timezone_offset = int(timezone_offset)
        domain = json.loads(domain)
        tasks = request.env[model_name].search(domain).sorted('date_start')

        # current_user = request.env.user
        # tz = current_user.tz and pytz.timezone(current_user.tz) or pytz.utc
        # time = pytz.utc.localize(datetime.now()).astimezone(tz)

        res_tasks = []
        res_links = []
        for task in tasks:
            # {"id":22, "text":"Task #4.2", "start_date":"03-04-2018", "duration":"4", "parent":"15", "progress": 0.1, "open": true},
            # {"id":"1","source":"1","target":"2","type":"1"},
            # date_start = pytz.utc.localize(task.date_start).astimezone(tz)
            date_start = task.date_start + timedelta(minutes=timezone_offset)
            res_tasks.append({
                'id': task.id,
                'text': task.name,
                # yyyy-MM-dd HH:mm
                'start_date': date_start.strftime("%d/%m/%Y %H:%M:%S"),
                'duration': task.planned_duration,
                'progress': task.progress / 100.0,
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
    def gantt_api_task_update(self, task_id, model_name, open, text, duration, progress, start_date, end_date, timezone_offset, parent, **kw):
        # Request URL: http://localhost:8069/gantt_api/task/13
        # Form Data: open: true
        # text: Task 1
        # duration: 2
        # progress: 0.25
        # start_date: 31-08-2019 00:00
        # end_date: 02-09-2019 00:00
        # parent: 0
        timezone_offset = int(timezone_offset)
        start_date = datetime.strptime(start_date, '%d-%m-%Y %H:%M');
        start_date = start_date + timedelta(minutes=-timezone_offset);
        values = dict()
        values[request.params['map_date_start']] = start_date
        values[request.params['map_duration']] = duration
        request.env[model_name].browse([task_id]).write(values)
        return '{"action":"updated"}'

    @http.route('/gantt_api/link/<int:link_id>', type='http', auth="user", methods=['DELETE'])
    def gantt_api_link_delete(self, link_model, link_id, **kw):
        request.env[link_model].browse([link_id]).unlink()
        return '{"action":"updated"}'
