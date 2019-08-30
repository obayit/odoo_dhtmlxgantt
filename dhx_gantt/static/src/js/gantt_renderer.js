odoo.define('dhx_gantt.GanttRenderer', function (require) {
    "use strict";

    var AbstractRenderer = require('web.AbstractRenderer');

    var GanttRenderer = AbstractRenderer.extend({
        template: "dhx_gantt.gantt_view",
        on_attach_callback: function () {
            var self = this;
            console.log(self.state);
            console.log(self.state.records);
            console.log(demo_tasks);
            this.$el.dhx_gantt({
                data: self.state.records,
                // scales:[
                //     { unit:"month"}
                // ]
            });
        },
    });
    return GanttRenderer;
});