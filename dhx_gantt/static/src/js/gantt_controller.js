odoo.define('dhx_gantt.GanttController', function (require) {
    "use strict";

    var AbstractController = require('web.AbstractController');
    // var BasicController = require('web.BasicController');
    var GanttController = AbstractController.extend({
        custom_events: _.extend({}, AbstractController.prototype.custom_events, {
            gantt_data_updated: '_onGanttUpdated',
        }),
        _onGanttUpdated: function(event){
            event.stopPropagation();
            console.log('_onGanttUpdated');
            console.log(event.data.entity);
            console.log(event.data.data);
            switch(event.data.entity){
                case "task":
                    this.model.updateTask(event.data.data);
                case "link":
            }
        }
    });
    return GanttController;
});