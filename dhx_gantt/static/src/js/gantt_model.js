odoo.define('dhx_gantt.GanttModel', function (require) {
    "use strict";

    var AbstractModel = require('web.AbstractModel');
    var time = require('web.time');
    // var BasicModel = require('web.BasicModel');
    var GanttModel = AbstractModel.extend({
        get: function(){
        // get: function(id, options){
            // console.log('get()');
            // console.log(this.records);
            // console.log('Basic.get()');
            // options = options ? options : {};
            // options.raw = false;  // prevent x2many field errors on BasicModel's get()
            // var upperRes = this._super.apply(this, arguments);
            // console.log(upperRes);
            // return upperRes;
            var data = [];
            var links = [];
            // var formatFunc = gantt.date.str_to_date("%Y-%m-%d %h:%i:%s");
            // this.records.forEach(function(record){ 
                // data.push({
                //     "id": record.id,
                //     "text": record.name,
                //     "start_date": formatFunc(record.date_start),
                //     "duration": record.planned_duration,
                //     "progress": record.progress,
                //     "open": record.is_open,
                // });
                // console.log(record.links_serialized_json);
            //     links.push.apply(links, JSON.parse(record.links_serialized_json))
            // });
            // console.log(data);
            // console.log('links');
            // console.log(links);
            var gantt_model = {
                data: this.records,
                links: this.links,
            }
            var res = {
                records: gantt_model,
            };
            // console.log('get() RETURNING');
            // console.log(res);
            return res;
        },
        load: function(params){
            // console.log('load()');
            // console.log({params});
            this.map_id = params.id_field;
            this.map_text = params.text;
            this.map_date_start = params.date_start;
            this.map_duration = params.duration;
            this.map_progress = params.progress;
            this.map_open = params.open;
            this.map_links_serialized_json = params.links_serialized_json;
            this.map_total_float = params.total_float;
            this.map_parent = 'project_id';
            this.modelName = params.modelName;
            this.linkModel = params.linkModel;
            return this._load(params);
        },
        reload: function(id, params){
            // console.log('reload()');
            return this._load(params);
        },
        _load: function(params){
            // console.log('_load()');
            // console.log(this);
            // console.log(params);
            params = params ? params : {};
            this.domain = params.domain || this.domain || [];
            this.modelName = params.modelName || this.modelName;
            var self = this;
            var fieldNames = [this.map_text, this.map_date_start, this.map_duration];
            this.map_open && fieldNames.push(this.map_open);
            this.map_links_serialized_json && fieldNames.push(this.map_links_serialized_json);
            this.map_total_float && fieldNames.push(this.map_total_float);
            this.map_parent && fieldNames.push(this.map_parent);
            return this._rpc({
                model: this.modelName,
                method: 'search_read',
                fields: fieldNames,
                domain: this.domain,
                orderBy: [{
                    name: this.map_date_start,
                    asc: true,
                }]
            })
            .then(function (records) {
                self.convertData(records);
            });
        },
        convertData: function(records){
            // console.log('convertData');
            // console.log(records);
            var data = [];
            var formatFunc = gantt.date.str_to_date("%Y-%m-%d %h:%i:%s", true);
            // todo: convert date from utc to mgt or wtever
            var self = this;
            this.res_ids = [];
            var links = [];
            records.forEach(function(record){ 
                self.res_ids.push(record[self.map_id]);
                // value.add(-self.getSession().getTZOffset(value), 'minutes')
                // data.timezone_offset = (-self.date_object.getTimezoneOffset());
                var datetime = formatFunc(record[self.map_date_start]);
                var task = {};
                if(self.map_parent){
                    var projectFound = data.find(function(element) {
                        return element.isProject && element.serverId == record[self.map_parent][0];
                    });
                    if(!projectFound){
                        // console.log('project not found');
                        var project = {
                            id: _.uniqueId('project-'),
                            serverId: record[self.map_parent][0],
                            text: record[self.map_parent][1],
                            isProject: true,
                            open: true,
                        }
                        task.parent = project.id;
                        data.push(project);
                    }else{
                        task.parent = projectFound.id;
                    }
                }
                task.id = record[self.map_id];
                task.text = record[self.map_text];
                task.start_date = datetime;
                task.duration = record[self.map_duration];
                task.progress = record[self.map_progress];
                task.open = record[self.map_open];
                task.links_serialized_json = record[self.map_links_serialized_json];
                task.total_float = record[self.map_total_float];

                data.push(task);
                links.push.apply(links, JSON.parse(record.links_serialized_json))
            });
            this.records = data;
            this.links = links;
        },
        updateTask: function(data){
            if(data.isProject){
                return $.when();
            }
            // console.log('updateTask');
            // console.log({data});
            var args = [];
            var values = {};

            var id = data.id;
            values[this.map_text] = data.text;
            values[this.map_duration] = data.duration;
            values[this.map_open] = data.open;
            values[this.map_progress] = data.progress;

            var formatFunc = gantt.date.str_to_date("%d-%m-%Y %h:%i");
            var date_start = formatFunc(data.start_date);
            values[this.map_date_start] = JSON.stringify(date_start);
            // console.log('time');
            // console.log(time.datetime_to_str(new Date("2019-09-07T20:00:00.000Z")));
            args.push(id);
            args.push(values)
            // console.log({values});
            // console.log({args});
            return this._rpc({
                model: this.modelName,
                method: 'write',
                args: args,
            });
        },
        createLink: function(data){
            // console.log('createLink');
            // console.log({data});
            var args = [];
            var values = {};

            values.id = data.id;
            values.task_id = data.source;
            values.depending_task_id = data.target;
            values.relation_type = data.type;

            args.push([values]);
            return this._rpc({
                model: this.linkModel,
                method: 'create',
                args: args,
            });
        },
        deleteLink: function(data){
            // console.log('deleteLink');
            // console.log({data});
            var args = [];

            args.push([data.id]);
            return this._rpc({
                model: this.linkModel,
                method: 'unlink',
                args: args,
            });
        },
        getCriticalPath: function(){
            return this._rpc({
                model: this.modelName,
                method: 'compute_critical_path',
                args:[this.res_ids],
            });
        },
        schedule: function(){
            var self = this;
            return this._rpc({
                model: this.modelName,
                method: 'bf_traversal_schedule',
                args:[this.res_ids],
            });
        },
    });
    return GanttModel;
});