odoo.define('dhx_gantt.GanttRenderer', function (require) {
    "use strict";

    // var AbstractRenderer = require('web.AbstractRenderer');
    var BasicRenderer = require('web.BasicRenderer');
    var core = require('web.core');

    var GanttRenderer = BasicRenderer.extend({
        template: "dhx_gantt.gantt_view",
        ganttApiUrl: "/gantt_api",
        date_object: new Date(),
        events: _.extend({}, BasicRenderer.prototype.events, {
            'click button': '_onClickCriticalPath',
        }),
        init: function (parent, state, params) {
            console.log('init GanttRenderer');
            this._super.apply(this, arguments);
            this.initDomain = params.initDomain;
            this.modelName = params.modelName;
            console.log('params');
            console.log(params);
        },
        _onClickCriticalPath: function(){
            console.log('mmmph');
        },
        on_attach_callback: function () {
            this.loadGantt();
            console.log('on_attach_callback');
            console.log(this.$el);
        },
        loadGantt: function(){
            console.log('loadGantt');
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
            gantt.config.columns =  [
                {name:"name",       label:"Task name",  tree:true, width:"*" },
                {name:"date_start", label:"Start time", align: "center" },
                {name:"planned_duration",      label:"Holder(s)" },
                {name:"mmmph",      label:"Holder(s)",
                template:function(obj){
                    return obj.name;} }
            ];
            gantt.init(this.$('.o_dhx_gantt').get(0));
            // gantt.load(initUrl);
            // var dp = new gantt.dataProcessor(initUrl);
            // keep the order of the next 3 lines below
            // var dp = gantt.createDataProcessor({
            //     url: initUrl,
            //     mode:"REST",
            // });
            // dp.init(gantt);
            // dp.setTransactionMode("REST");
            // keep the order of the previous 3 lines above
            var dp = gantt.createDataProcessor(function(entity, action, data, id){
                console.log('createDataProcessor');
                console.log('entity');
                console.log({entity});
                console.log({action});
                console.log({data});
                console.log({id});
                const services = {
                    "task": this.taskService,
                    "link": this.linkService
                };
                const service = services[entity];
                switch (action) {
                    case "update":
                        self.trigger_up('gantt_data_updated', {entity, data});
                        // return service.update(data);
                    case "create":
                        self.trigger_up('gantt_data_created', {entity, data});
                        // return service.insert(data);
                    case "delete":
                        self.trigger_up('gantt_data_deleted', {entity, data});
                        // return service.remove(id);
                }
            });
            dp.attachEvent("onAfterUpdate", function(id, action, tid, response){
                if(action == "error"){
                    console.log('nice "an error occured :)"');
                }else{
                    // self.loadGantt();
                    return true;
                }
            });
            dp.attachEvent("onBeforeUpdate", function(id, state, data){
                console.log('BeforeUpdate. YAY!');
                data.csrf_token = core.csrf_token;
                data.model_name = self.modelName;
                data.timezone_offset = (-self.date_object.getTimezoneOffset());
                console.log('data are ');
                console.log(data);
                return true;
            });
            // Approach 2: use odoo's mvc
            console.log('this.state');
            console.log(this.state);
            console.log('SETTING TO ');
            console.log(this.state.records);
            // gantt.init(this.$el.find('.o_dhx_gantt').get(0));
            gantt.parse(this.state.records);
        },
        _onUpdate: function () {
        },
        updateState: function (state, params) {
            // this method is called by the controller when the search view is changed. we should 
            // clear the gantt chart, and add the new tasks resulting from the search
            var res = this._super.apply(this, arguments);
            gantt.clearAll();
            this.loadGantt();
            return res;
        },
    });
    return GanttRenderer;
});