odoo.define('dhx_gantt.GanttModel', function (require) {
    "use strict";

    var AbstractModel = require('web.AbstractModel');
    var GanttModel = AbstractModel.extend({
        get: function(){
            console.log('get()');
            console.log(this.records);
            var data = [];
            var links = [];
            var formatFunc = gantt.date.str_to_date("%Y-%m-%d %h:%i:%s");
            this.records.forEach(function(record){ 
                data.push({
                    "id": record.id,
                    "text": record.name,
                    "start_date": formatFunc(record.date_start),
                    "duration": record.planned_duration,
                    "progress": record.progress,
                    "open": record.is_open,
                });
                links.push.apply(links, JSON.parse(record.links_serialized_json))
            });
            console.log(data);
            console.log('links');
            console.log(links);
            var gantt_model = {
                data: data,
                links: links,
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
            this.domain = params.domain || this.domain || [];
            var self = this;
            return this._rpc({
                model: params.modelName,
                method: 'search_read',
                fields: ['name', 'date_start', 'planned_duration', 'progress', 'open', 'links_serialized_json'],
                domain: this.domain,
            })
            .then(function (records) {
                self.records = records;
            });
        },
    });
    return GanttModel;
});