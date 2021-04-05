from . import controllers
from . import models

from odoo import api, SUPERUSER_ID


def dhx_uninstall_hook(cr, registry):
    """
    This uninstall-hook will remove dhx_gantt from the action.
    """
    env = api.Environment(cr, SUPERUSER_ID, dict())

    task_action_id = env.ref("project.act_project_project_2_project_task_all")
    task_action_id.view_mode = 'kanban,tree,form,calendar,pivot,graph,activity'