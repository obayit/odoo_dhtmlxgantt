from odoo import models, fields


class IrActWindowView(models.Model):
    _inherit = 'ir.actions.act_window.view'

    view_mode = fields.Selection(selection_add=[('dhx_gantt', "DHX Gantt")], ondelete={'dhx_gantt': 'cascade'})
