//*PMW* class addded for tabs
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
    /**
     * Returns {@link fabric.Rect} instance from an object representation
     * @static
     * @memberOf fabric.Rect
     * @param {Object} object Object to create an instance from
     * @param {Function} [callback] Callback to invoke when an fabric.Rect instance is created
     */
    fabric.Tabs.fromObject = function (object, callback) {
        return fabric.Object._fromObject('tabs', object, callback);
    };

})(typeof exports !== 'undefined' ? exports : this);
