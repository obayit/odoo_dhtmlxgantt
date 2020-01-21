odoo.define('dhx_gantt.GanttAction', function (require) {
    "use strict";
    var core = require('web.core');
    var Widget = require('web.Widget');

    var GanttAction = Widget.extend({
        init: function (parent) {
            this._super.apply(this, arguments);
            console.log('meh tuf prep');
        },
    });
    core.action_registry.add("project_show_gantt", GanttAction);
    // console.log('gantt action loaded');
});