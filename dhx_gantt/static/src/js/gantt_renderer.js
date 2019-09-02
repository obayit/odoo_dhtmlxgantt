odoo.define('dhx_gantt.GanttRenderer', function (require) {
    "use strict";

    var AbstractRenderer = require('web.AbstractRenderer');

    var GanttRenderer = AbstractRenderer.extend({
        template: "dhx_gantt.gantt_view",
        ganttApiUrl: "gantt_api",
        on_attach_callback: function () {
            var self = this;
            this.initGantt();
            // this.$el.dhx_gantt({
            //     data: self.state.records,
            // });
        },
        initGantt: function(){
            gantt.init(this.el);
            gantt.load(this.ganttApiUrl);
            
            // keep the order of the lines below
            var dp = new gantt.dataProcessor(this.ganttApiUrl);
            dp.init(gantt);
            dp.setTransactionMode("REST");
            var dp = gantt.createDataProcessor({
                url: this.ganttApiUrl,
                mode: "REST"
            });
        }
    });
    return GanttRenderer;
});