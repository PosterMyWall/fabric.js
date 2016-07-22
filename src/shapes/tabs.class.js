
(function(global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        clone  = fabric.util.object.clone;

    /**
     * Tabs class, based on IText, allows the user to resize the text rectangle
     * and wraps lines automatically. Textboxes have their Y scaling locked, the
     * user can only change width. Height is adjusted automatically based on the
     * wrapping of lines.
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
