odoo.define('dhx_gantt.GanttRenderer', function (require) {
    "use strict";

    var AbstractRenderer = require('web.AbstractRenderer');

    var GanttRenderer = AbstractRenderer.extend({
        template: "dhx_gantt.gantt_view",
        ganttApiUrl: "gantt_api",
        on_attach_callback: function () {
            this.loadGantt();
            console.log('on_attach_callback');
            console.log(this.$el);
        },
        loadGantt: function(){
            console.log('loadGantt');

            // Approach 1: use dhx_gantt's dataProcessor to read from server api(controller)
            // gantt.init(this.el);
            // gantt.load(this.ganttApiUrl);
            // keep the order of the lines below
            // var dp = new gantt.dataProcessor(this.ganttApiUrl);
            // dp.init(gantt);
            // dp.setTransactionMode("REST");

            // Approach 2: use odoo's mvc
            console.log('SETTING TO ');
            console.log(this.state.records);
            gantt.init(this.el);
            gantt.parse(this.state.records);
            // this.$el.dhx_gantt({
            //     data: this.state.records,
            // });
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