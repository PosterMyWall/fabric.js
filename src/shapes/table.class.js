(function(global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        clone  = fabric.util.object.clone;

    /**
     * Table class, based on Groups, allows the user to insert table on canvas
     * @class fabric.Table
     * @extends fabric.Group
     * @mixes fabric.Observable
     * @return {fabric.Table} thisArg
     */
    fabric.Table = fabric.util.createClass(fabric.Group, fabric.Observable, {
        /**
         * Type of an object
         * @type String
         * @default
         */
        type: 'table'
    });
    fabric.Table.fromObject = fabric.Group.fromObject

})(typeof exports !== 'undefined' ? exports : this);
