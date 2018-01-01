(function (global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        extend = fabric.util.object.extend;

    /**
     * Remove white filter class
     * @class fabric.Image.filters.RemoveColor
     * @memberOf fabric.Image.filters
     * @extends fabric.Image.filters.BaseFilter
     * @see {@link fabric.Image.filters.RemoveColor#initialize} for constructor definition
     * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
     * @example
     * var filter = new fabric.Image.filters.RemoveColor({
   *   threshold: 0.2,
   * });
     * object.filters.push(filter);
     * object.applyFilters();
     * canvas.renderAll();
     */
    fabric.Image.filters.RemoveColor = fabric.util.createClass(fabric.Image.filters.BaseFilter, /** @lends fabric.Image.filters.RemoveColor.prototype */ {

        /**
         * Filter type
         * @param {String} type
         * @default
         */
        type: 'RemoveColor',

        /**
         * Constructor
         * @memberOf fabric.Image.filters.RemoveColor.prototype
         * @param {Object} [options] Options object
         */
        initialize: function (options) {
            options = options || {};

            this.color = options.color || '#ffffff';
            this.distance = options.distance || 0.02;
        },

        /**
         * Applies filter to canvas element
         * @param {Object} canvasEl Canvas element to apply filter to
         */
        applyTo: function (canvasEl) {
            var context = canvasEl.getContext('2d'),
                imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
                data = imageData.data, i,
                distance = this.distance * 255,
                r, g, b,
                source = new fabric.Color(this.color).getSource(),
                lowC = [
                    source[0] - distance,
                    source[1] - distance,
                    source[2] - distance,
                ],
                highC = [
                    source[0] + distance,
                    source[1] + distance,
                    source[2] + distance,
                ];


            for (i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                if (r > lowC[0] &&
                    g > lowC[1] &&
                    b > lowC[2] &&
                    r < highC[0] &&
                    g < highC[1] &&
                    b < highC[2]) {
                    data[i + 3] = 0;
                }
            }

            context.putImageData(imageData, 0, 0);
        },

        /**
         * Returns object representation of an instance
         * @return {Object} Object representation of an instance
         */
        toObject: function () {
            return extend(this.callSuper('toObject'), {
                color: this.color,
                distance: this.distance
            });
        }
    });

    /**
     * Returns filter instance from an object representation
     * @static
     * @param {Object} object Object to create an instance from
     * @return {fabric.Image.filters.RemoveColor} Instance of fabric.Image.filters.RemoveColor
     */
    fabric.Image.filters.RemoveColor.fromObject = function (object) {
        return new fabric.Image.filters.RemoveColor(object);
    };

})(typeof exports !== 'undefined' ? exports : this);