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
        init: function (viewInfo, params) {
            console.log('init View');
            console.log(this.arch);
            this._super.apply(this, arguments);
            this.loadParams.id_field = this.arch.attrs.id_field;
            this.loadParams.date_start = this.arch.attrs.date_start;
            this.loadParams.duration = this.arch.attrs.duration;
            this.loadParams.open = this.arch.attrs.open;
            this.loadParams.progress = this.arch.attrs.progress;
            this.loadParams.text = this.arch.attrs.text;
            this.loadParams.links_serialized_json = this.arch.attrs.links_serialized_json;
        },
    })

    viewRegistry.add('dhx_gantt', GanttView);
    console.log('ADDED DHX_GANTT');
    return GanttView;
});