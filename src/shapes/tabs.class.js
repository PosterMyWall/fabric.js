
(function(global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        clone  = fabric.util.object.clone;

    /**
     * Tabs class, based on Groups, allows the user to insert tear-off tabs on canvas
     * @class fabric.Tabs
     * @extends fabric.Group
     * @mixes fabric.Observable
     * @return {fabric.Tabs} thisArg
     */
    fabric.Tabs = fabric.util.createClass(fabric.Group, fabric.Observable, {
        /**
         * Type of an object
         * @type String
         * @default
         */
        type: 'tabs'
    });
    fabric.Tabs.fromObject = fabric.Group.fromObject
    
})(typeof exports !== 'undefined' ? exports : this);
