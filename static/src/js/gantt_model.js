odoo.define('dhx_gantt.GanttModel', function (require) {
    "use strict";

    var AbstractModel = require('web.AbstractModel');
    var GanttModel = AbstractModel.extend({
        get: function(){
            console.log('get()');
            return {
            };
        },
        load: function(params){
            console.log('load()');
            return this._load(params);
        },
        reload: function(id, params){
            console.log('reload()');
            return this._load(params);
        },
        _load: function(params){
            console.log('_load()');
            params.gantt_model = 'project.task';
            this.domain = params.domain || this.domain || [];
            var self = this;
            return this._rpc({
                model: params.gantt_model,
                method: 'search_read',
                fields: ['name', 'date_start'],
                domain: this.domain,
            })
            .then(function (records) {
            });
        },
    });
    return GanttModel;
});