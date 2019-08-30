odoo.define('dhx_gantt.GanttRenderer', function (require) {
    "use strict";

    var AbstractRenderer = require('web.AbstractRenderer');

    var GanttRenderer = AbstractRenderer.extend({
        template: "dhx_gantt.gantt_view",
        on_attach_callback: function () {
            this.$el.dhx_gantt({
                data:demo_tasks,
                scales:[
                    { unit:"month",step:1,format:"%M"}
                ]
            });
        },
    });
    return GanttRenderer;
});