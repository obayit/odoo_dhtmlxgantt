odoo.define('dhx_gantt.GanttView', function (require) {
    "use strict";

    var AbstractView = require('web.AbstractView');
    // var BasicView = require('web.BasicView');
    var GanttController = require('dhx_gantt.GanttController');
    var GanttModel = require('dhx_gantt.GanttModel');
    var GanttRenderer = require('dhx_gantt.GanttRenderer');
    var viewRegistry = require('web.view_registry');

    var GanttView = AbstractView.extend({
        viewType: 'dhx_gantt',
        icon: 'fa-tasks',
        config: _.extend({}, AbstractView.prototype.config, {
            Controller: GanttController,
            Model: GanttModel,
            Renderer: GanttRenderer,
        }),
        init: function (viewInfo, params) {
            // console.log('init View');
            // console.log(this.arch);
            // console.log({viewInfo});
            // console.log('params');
            // console.log(params);
            this._super.apply(this, arguments);
            // console.log('loadParams after apply super');
            // console.log(this.loadParams);
            this.loadParams.type = 'list';

            this.loadParams.id_field = this.arch.attrs.id_field;
            this.loadParams.date_start = this.arch.attrs.date_start;
            this.loadParams.duration = this.arch.attrs.duration;
            this.loadParams.open = this.arch.attrs.open;
            this.loadParams.progress = this.arch.attrs.progress;
            this.loadParams.text = this.arch.attrs.text;
            this.loadParams.links_serialized_json = this.arch.attrs.links_serialized_json;
            this.loadParams.total_float = this.arch.attrs.total_float;
            this.loadParams.modelName = params.modelName;
            this.loadParams.linkModel = this.arch.attrs.link_model;

            // this.loadParams.fields = 
            this.loadParams.fieldNames = [
                this.arch.attrs.id_field,
                this.arch.attrs.date_start,
                this.arch.attrs.duration,
                this.arch.attrs.open,
                this.arch.attrs.progress,
                this.arch.attrs.text,
                this.arch.attrs.links_serialized_json,
            ];
            // console.log('infamous');
            // console.log(this.loadParams.fields);
            // console.log(this.loadParams.fieldNames);

            this.rendererParams.initDomain = params.domain;
            this.rendererParams.modelName = params.modelName;
            this.rendererParams.map_id_field = this.arch.attrs.id_field;
            this.rendererParams.map_date_start = this.arch.attrs.date_start;
            this.rendererParams.map_duration = this.arch.attrs.duration;
            this.rendererParams.map_open = this.arch.attrs.open;
            this.rendererParams.map_progress = this.arch.attrs.progress;
            this.rendererParams.map_text = this.arch.attrs.text;
            this.rendererParams.map_links_serialized_json = this.arch.attrs.links_serialized_json;
            this.rendererParams.link_model = this.arch.attrs.link_model;
            this.rendererParams.link_model = this.arch.attrs.link_model;
            this.rendererParams.is_total_float = this.arch.attrs.total_float;

        },
        _processFieldsView: function (fieldsView, viewType) {
            // console.log('_processFieldsView');
            // console.log({fieldsView, viewType});
            var fv = this._super.apply(this, arguments);
            // console.log({fv});
            return fv;
        },
    })

    viewRegistry.add('dhx_gantt', GanttView);
    // console.log('ADDED DHX_GANTT');
    return GanttView;
});