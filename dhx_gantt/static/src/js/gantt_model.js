odoo.define('dhx_gantt.GanttModel', function (require) {
    "use strict";

    var AbstractModel = require('web.AbstractModel');
    var GanttModel = AbstractModel.extend({
        get: function(){
            console.log('get()');
            console.log(this.records);
            var data = [];
            var formatFunc = gantt.date.str_to_date("%Y-%m-%d %h:%i:%s");
            this.records.forEach(function(record){ 
                console.log(record.date_start);
                console.log(formatFunc(record.date_start));
                data.push({
                    "id": record.id,
                    "text": record.name,
                    "start_date": formatFunc(record.date_start),
                    "duration": record.planned_duration,
                    "progress": record.progress,
                    "open": record.is_open,
                });
            });
            console.log(data);
            var gantt_model = {
                data: data,
                links: [],
            }
            return {
                records: gantt_model,
            };
        },
        load: function(params){
            console.log('load()');
            return this._load(params);
        },
        reload: function(id, params){
            console.log('reload()');
            return this._load(params);
        },
        _load: function(params){
            console.log('_load()');
            params.gantt_model = 'project.task';
            this.domain = params.domain || this.domain || [];
            var self = this;
            return this._rpc({
                model: params.gantt_model,
                method: 'search_read',
                fields: ['name', 'date_start', 'planned_duration', 'progress', 'open'],
                domain: this.domain,
            })
            .then(function (records) {
                self.records = records;
            });
        },
    });
    return GanttModel;
});