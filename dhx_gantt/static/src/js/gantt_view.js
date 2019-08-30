odoo.define('dhx_gantt.GanttView', function (require) {
    "use strict";

    var AbstractView = require('web.AbstractView');
    var GanttController = require('dhx_gantt.GanttController');
    var GanttModel = require('dhx_gantt.GanttModel');
    var GanttRenderer = require('dhx_gantt.GanttRenderer');
    var viewRegistry = require('web.view_registry');

    var GanttView = AbstractView.extend({
        config: {
            Controller: GanttController,
            Model: GanttModel,
            Renderer: GanttRenderer,
        },
    })

    viewRegistry.add('dhx_gantt', GanttView);
    console.log('ADDED DHX_GANTT');
    return GanttView;
});