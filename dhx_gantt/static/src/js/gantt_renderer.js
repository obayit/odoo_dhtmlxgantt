odoo.define('dhx_gantt.GanttRenderer', function (require) {
    "use strict";

    var AbstractRenderer = require('web.AbstractRenderer');
    var core = require('web.core');

    var GanttRenderer = AbstractRenderer.extend({
        template: "dhx_gantt.gantt_view",
        ganttApiUrl: "/gantt_api",
        init: function (parent, state, params) {
            this._super.apply(this, arguments);
            this.initDomain = params.initDomain;
        },
        on_attach_callback: function () {
            this.loadGantt();
            console.log('on_attach_callback');
            console.log(this.$el);
        },
        loadGantt: function(){
            console.log('loadGantt');

            // Approach 1: use dhx_gantt's dataProcessor to read from server api(controller)
            console.log('ganttApiUrl');
            console.log(this.ganttApiUrl);
            console.log('initDomain');
            console.log(JSON.stringify(this.initDomain));
            console.log('JSON.stringify(this.undefinedStuff)');
            console.log(JSON.stringify(this.undefinedStuff));
            console.log('1243');
            console.log(this.ganttApiUrl);
            console.log(this.ganttApiUrl + '?domain=');
            console.log(this.ganttApiUrl + '?domain=' + this.initDomain ? JSON.stringify(this.initDomain) : 'False');
            console.log(this.ganttApiUrl + '?domain=' + (this.initDomain ? JSON.stringify(this.initDomain) : 'False'));
            console.log(this.ganttApiUrl + '?domain=' + this.initDomain);
            var initUrl = this.ganttApiUrl + '?domain=' + (this.initDomain ? JSON.stringify(this.initDomain) : 'False');
            console.log('initUrl');
            console.log(initUrl);
            gantt.init(this.el);
            gantt.load(initUrl);
            // keep the order of the lines below
            var dp = new gantt.dataProcessor(initUrl);
            console.log('csrf_token');
            console.log(core.csrf_token);
            var dp = gantt.createDataProcessor({
                url: initUrl,
                mode:"REST",
            });
            dp.init(gantt);
            dp.setTransactionMode("REST");
            dp.attachEvent("onAfterUpdate", function(id, action, tid, response){
                if(action == "error"){
                    console.log('nice "an error occured :)"');
                }else{
                    return true;
                }
            });
            dp.attachEvent("onBeforeUpdate", function(id, state, data){
                console.log('BeforeUpdate. YAY!');
                data.csrf_token = core.csrf_token;
                return true;
            });
            // Approach 2: use odoo's mvc
            // console.log('SETTING TO ');
            // console.log(this.state.records);
            // gantt.init(this.$el.find('.o_dhx_gantt').get(0));
            // gantt.parse(this.state.records);
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