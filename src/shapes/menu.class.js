(function(global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        clone  = fabric.util.object.clone;

    /**
     * CustomBorderTable class, based on Table, provides support for rendering menus/schedules having custom borders
     * @class fabric.CustomBorderTable
     * @extends fabric.Table
     * @mixes fabric.Observable
     * @return {fabric.Table} thisArg
     */
    fabric.CustomBorderTable = fabric.util.createClass(fabric.Table, fabric.Observable, {
        hasMiddleButtons: true,
        /**
         * Renders vertical borders for table Style Menu Layouts
         * @param {CanvasRenderingContext2D} ctx context to render on
         */
        drawColumnBorders: function (ctx) {
            var groups = this.getObjects(),
                w, maxWidth = 0, left = 0;

            for (var i = 0; i < groups.length; i++) {
                var items = groups[i].getObjects();
                w = items[1].width;
                if (w > maxWidth) {
                    maxWidth = w;
                    left = this.width/2 - maxWidth;
                }
            }
            ctx.beginPath();
            ctx.moveTo(left - this.padding*2, -(this.height / 2));
            ctx.lineTo(left - this.padding*2, -(this.height / 2) + this.height);
            ctx.stroke();
        },
        /**
         * Returns true if design is simple table structure('layout-13'), false otherwise
         * @returns {boolean}
         */
        isTableLayout: function () {
            return this.layoutType == 'layout-13';
        }
    });
    fabric.CustomBorderTable.fromObject = fabric.Table.fromObject

})(typeof exports !== 'undefined' ? exports : this);
