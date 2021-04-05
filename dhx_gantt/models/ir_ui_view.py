from odoo import models, fields, api


class IrUiView(models.Model):
    _inherit = 'ir.ui.view'

    type = fields.Selection(selection_add=[('dhx_gantt', "DHX Gantt")])
    # , ondelete={'dhx_gantt': 'cascade'})
