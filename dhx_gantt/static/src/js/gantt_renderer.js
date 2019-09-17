odoo.define('dhx_gantt.GanttRenderer', function (require) {
    "use strict";

    var AbstractRenderer = require('web.AbstractRenderer');
    // var BasicRenderer = require('web.BasicRenderer');
    var dialogs = require('web.view_dialogs');
    // var core = require('web.core');

    var GanttRenderer = AbstractRenderer.extend({
        template: "dhx_gantt.gantt_view",
        ganttApiUrl: "/gantt_api",
        date_object: new Date(),
        events: _.extend({}, AbstractRenderer.prototype.events, {
            'click button.o_dhx_critical_path': '_onClickCriticalPath',
            'click button.o_dhx_reschedule': '_onClickReschedule'
        }),
        init: function (parent, state, params) {
            console.log('init GanttRenderer');
            this._super.apply(this, arguments);
            this.initDomain = params.initDomain;
            this.modelName = params.modelName;
            this.map_text = params.map_text;
            this.map_id_field = params.map_id_field;
            this.map_date_start = params.map_date_start;
            this.map_duration = params.map_duration;
            this.map_open = params.map_open;
            this.map_progress = params.map_progress;
            this.map_links_serialized_json = params.map_links_serialized_json;
            this.link_model = params.link_model;
            console.log('params');
            console.log(params);
        },
        _onClickCriticalPath: function(){
            console.log('_onClickCriticalPath');
            this.trigger_up('gantt_show_critical_path');
        },
        _onClickReschedule: function(){
            console.log('_onClickReschedule');
            this.trigger_up('gantt_schedule');
        },
        on_attach_callback: function () {
            this.renderGantt();
            console.log('on_attach_callback');
            console.log(this.$el);
        },
        renderGantt: function(){
            console.log('renderGantt');
            // gantt.clearAll();
            var self = this;

            // Approach 1: use dhx_gantt's dataProcessor to read from server api(controller)
            // console.log('ganttApiUrl');
            // console.log(this.ganttApiUrl);
            // console.log('initDomain');
            // console.log(JSON.stringify(this.initDomain));
            // console.log('JSON.stringify(this.undefinedStuff)');
            // console.log(JSON.stringify(this.undefinedStuff));
            // console.log('1243');
            // console.log(this.ganttApiUrl);
            // console.log(this.ganttApiUrl + '?domain=');
            // console.log(this.ganttApiUrl + '?domain=' + this.initDomain ? JSON.stringify(this.initDomain) : 'False');
            // console.log(this.ganttApiUrl + '?domain=' + (this.initDomain ? JSON.stringify(this.initDomain) : 'False'));
            // console.log(this.ganttApiUrl + '?domain=' + this.initDomain);
            var domain_value = (this.initDomain ? JSON.stringify(this.initDomain) : 'False');
            var initUrl = this.ganttApiUrl +
            '?domain=' + domain_value +
            '&model_name=' + this.modelName +
            '&timezone_offset=' + (-this.date_object.getTimezoneOffset());
            console.log('initUrl');
            console.log(initUrl);
            gantt.templates.scale_cell_class = function(date){
                if(date.getDay()==5||date.getDay()==6){
                    return "o_dhx_gantt_weekend";
                }
            };

            gantt.config.work_time = true;
            gantt.config.skip_off_time = true;


            console.log('columns');
            console.log(gantt.config.columns);
            gantt.config.columns = [
                {name: "text", tree: true, resize: true},
                {name: "start_date", align: "center", resize: true},
                {name: "duration", align: "center"},
                {name: "total_float", label: "Total Float", align: "center"},
                // {name: "add", width: 44, min_width: 44, max_width: 44}
            ]
            // [
            //     {name:"add", label:"", width:50, align:"left" },

            //     {name:"text",       label:textFilter, width:250, tree:true },
            //     {name:"start_date", label:"Start time", width:80, align:"center" },
            //     {name:"duration",   label:"Duration",   width:60, align:"center" }
            // ]
 

            gantt.setWorkTime({day:5, hours: false });
            gantt.setWorkTime({day:0, hours: [8,16] });
            gantt.setWorkTime({hours: [8,16]});
            this.trigger_up('gantt_config');
            gantt.templates.timeline_cell_class = function(task,date){
                // if(date.getDay()==5||date.getDay()==6){ 
                if(!gantt.isWorkTime({task:task, date: date})){
                    return "o_dhx_gantt_weekend";
                }
            };
            gantt.init(this.$('.o_dhx_gantt').get(0));
            this.trigger_up('gantt_create_dp');
            // gantt.load(initUrl);
            // var dp = new gantt.dataProcessor(initUrl);
            // keep the order of the next 3 lines below
            // var dp = gantt.createDataProcessor({
            //     url: initUrl,
            //     mode:"REST",
            // });
            // // dp.init(gantt);
            // dp.setTransactionMode({
            //     mode: "REST",
            //     payload: {
            //         csrf_token: core.csrf_token,
            //         link_model: this.link_model,
            //         model_name: self.modelName
            //     },
            // });
            // var dp = gantt.createDataProcessor(function(entity, action, data, id){
            //     console.log('createDataProcessor');
            //     console.log('entity');
            //     console.log({entity});
            //     console.log({action});
            //     console.log({data});
            //     console.log({id});
            //     const services = {
            //         "task": this.taskService,
            //         "link": this.linkService
            //     };
            //     const service = services[entity];
            //     switch (action) {
            //         case "update":
            //             self.trigger_up('gantt_data_updated', {entity, data});
            //             return true;
            //             // return service.update(data);
            //         case "create":
            //             self.trigger_up('gantt_data_created', {entity, data});
            //             // return service.insert(data);
            //         case "delete":
            //             self.trigger_up('gantt_data_deleted', {entity, data});
            //             // return service.remove(id);
            //     }
            // });

            // dp.attachEvent("onAfterUpdate", function(id, action, tid, response){
            //     if(action == "error"){
            //         console.log('nice "an error occured :)"');
            //     }else{
            //         // self.renderGantt();
            //         return true;
            //     }
            // });
            // dp.attachEvent("onBeforeUpdate", function(id, state, data){
            //     console.log('BeforeUpdate. YAY!');
            //     data.csrf_token = core.csrf_token;
            //     data.model_name = self.modelName;
            //     data.timezone_offset = (-self.date_object.getTimezoneOffset());
            //     data.map_text = self.map_text;
            //     data.map_text = self.map_text;
            //     data.map_id_field = self.map_id_field;
            //     data.map_date_start = self.map_date_start;
            //     data.map_duration = self.map_duration;
            //     data.map_open = self.map_open;
            //     data.map_progress = self.map_progress;
            //     data.link_model = self.link_model;
            //     console.log('data are ');
            //     console.log(data);
            //     return true;
            // });

            // gantt.attachEvent("onBeforeLinkDelete", function(id, item){
            //     data.csrf_token = core.csrf_token;
            //     data.link_model = self.link_model;
            //     return true;
            // });
            // Approach 2: use odoo's mvc
            console.log('this.state');
            console.log(this.state);
            console.log('SETTING TO ');
            console.log(this.state.records);
            // gantt.init(this.$el.find('.o_dhx_gantt').get(0));
            gantt.clearAll();
            gantt.parse(this.state.records);
        },
        _onUpdate: function () {
        },
        updateState: function (state, params) {
            // this method is called by the controller when the search view is changed. we should 
            // clear the gantt chart, and add the new tasks resulting from the search
            var res = this._super.apply(this, arguments);
            gantt.clearAll();
            this.renderGantt();
            return res;
        },
        disableAllButtons: function(){
            console.log('disableAllButtons:: Renderer');
            this.$('.o_dhx_gantt_header').find('button').prop('disabled', true);
        },
        enableAllButtons: function(){
            console.log('enableAllButtons:: Renderer');
            this.$('.o_dhx_gantt_header').find('button').prop('disabled', false);
        },
        undoRenderCriticalTasks: function(data){
            gantt.eachTask(function(item){
                item.color = "";
            });
            gantt.getLinks().forEach(function(item){
                item.color = "";
            });
            gantt.render();
        },
        renderCriticalTasks: function(data){
            data.tasks.forEach(function(item){
                var task = gantt.getTask(item);
                if(task){
                    task.color = "red";
                }
            });
            data.links.forEach(function(item){
                var link = gantt.getLink(item);
                if(link){
                    link.color = "red";
                }
            });
            if(data.tasks.length > 0){
                gantt.render();
            }
        },
        destroy: function () {
            gantt.clearAll();
            this._super.apply(this, arguments);
        },
    });
    return GanttRenderer;
});