# -*- coding: utf-8 -*-
{
    'name': "Mediocre DHX Gantt",

    'summary': """
        This module integrates project tasks with the interactive HTML5 Gantt chart 
        from DHX. Their website is https://dhtmlx.com""",

    'description': """
        
    """,
    "category": "Project Management",

    'author': "Ubay Abdelgadir",
    'website': "https://github.com/obayit/odoo_dhtmlxgantt",
    'license': "GPL-3",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/12.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Project Management',
    'version': '1.1',

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
    'images': [
        'images/screenshot_1.png'
    ]
}