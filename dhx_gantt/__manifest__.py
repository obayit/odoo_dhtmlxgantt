# -*- coding: utf-8 -*-
{
    'name': "Mediocre DHX Gantt",

    'summary': """
        This module integrates project tasks with the interactive HTML5 Gantt chart 
        from DHX. Their website is https://dhtmlx.com""",

    'description': """
        
    """,

    'author': "Ubay Abdelgadir",
    'website': "http://www.yourcompany.com",
    'license': "GPL-2",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/12.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '1.0',

    # any module necessary for this one to work correctly
    'depends': [
        'base',
        'project'
    ],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'views/assets.xml',
        'views/task_views.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    'qweb': [
        "static/src/xml/gantt.xml",
    ],
}