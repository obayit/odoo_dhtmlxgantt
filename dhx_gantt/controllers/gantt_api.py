from datetime import datetime, timedelta
import json

from odoo.http import request
from odoo import http


class GanttController(http.Controller):

    @http.route('/gantt_api', type='http', auth="user")
    def gantt_api(self, model_name, timezone_offset, domain=None, **kw):
        # main GET method
        timezone_offset = int(timezone_offset)
        domain = json.loads(domain)
        tasks = request.env[model_name].search(domain).sorted('date_start')

        res_tasks = []
        res_links = []
        for task in tasks:
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
        timezone_offset = int(timezone_offset)
        start_date = datetime.strptime(start_date, '%d-%m-%Y %H:%M')
        start_date = start_date + timedelta(minutes=-timezone_offset)
        values = dict()
        values[request.params['map_date_start']] = start_date
        values[request.params['map_duration']] = duration
        request.env[model_name].browse([task_id]).write(values)
        return '{"action":"updated"}'

    @http.route('/gantt_api/link/<int:link_id>', type='http', auth="user", methods=['DELETE'])
    def gantt_api_link_delete(self, link_model, link_id, **kw):
        request.env[link_model].browse([link_id]).unlink()
        return '{"action":"updated"}'
