odoo.define('dhx_gantt.GanttModel', function (require) {
    "use strict";

    var AbstractModel = require('web.AbstractModel');
    var GanttModel = AbstractModel.extend({
        get: function(){
            console.log('get()');
            console.log(this.records);
            var data = [];
            var links = [];
            // var formatFunc = gantt.date.str_to_date("%Y-%m-%d %h:%i:%s");
            this.records.forEach(function(record){ 
                // data.push({
                //     "id": record.id,
                //     "text": record.name,
                //     "start_date": formatFunc(record.date_start),
                //     "duration": record.planned_duration,
                //     "progress": record.progress,
                //     "open": record.is_open,
                //     // "id": record[this.id_field],
                //     // "text": record[this.text],
                //     // "start_date": formatFunc(record[this.date_start]),
                //     // "duration": record[this.duration],
                //     // "progress": record[this.progress],
                //     // "open": record[this.open],
                // });
                console.log(record.links_serialized_json);
                links.push.apply(links, JSON.parse(record.links_serialized_json))
            });
            // console.log(data);
            console.log('links');
            console.log(links);
            var gantt_model = {
                data: this.records,
                links: links,
            }
            var res = {
                records: gantt_model,
            };
            console.log('get() RETURNING');
            console.log(res);
            return res;
        },
        load: function(params){
            console.log('load()');
            this.map_id = params.id_field;
            this.map_text = params.text;
            this.map_date_start = params.date_start;
            this.map_duration = params.duration;
            this.map_progress = params.progress;
            this.map_open = params.open;
            this.map_links_serialized_json = params.links_serialized_json;
            return this._load(params);
        },
        reload: function(id, params){
            console.log('reload()');
            return this._load(params);
        },
        _load: function(params){
            console.log('_load()');
            console.log(this);
            console.log(params);
            this.domain = params.domain || this.domain || [];
            var self = this;
            return this._rpc({
                model: params.modelName,
                method: 'search_read',
                fields: ['name', 'date_start', 'planned_duration', 'progress', 'open', 'links_serialized_json'],
                domain: this.domain,
            })
            .then(function (records) {
                self.records = self.convertData(records, params);
            });
        },
        convertData: function(records){
            console.log('convertData');
            console.log(records);
            var res = [];
            var formatFunc = gantt.date.str_to_date("%Y-%m-%d %h:%i:%s");
            var self = this;
            records.forEach(function(record){ 
                res.push({
                    id: record[self.map_id],
                    text: record[self.map_text],
                    start_date: formatFunc(record[self.map_date_start]),
                    duration: record[self.map_duration],
                    progress: record[self.map_progress],
                    open: record[self.map_open],
                    links_serialized_json: record[self.map_links_serialized_json]
                });
            });
            return res;
        }
    });
    return GanttModel;
});