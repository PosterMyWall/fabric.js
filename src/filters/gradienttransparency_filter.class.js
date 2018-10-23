(function (global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        filters = fabric.Image.filters,
        createClass = fabric.util.createClass;

    /**
     * Postermywall: This filter is not supported by fabricjs, any change any logic updates on how to apply
     * GradientTransparency filter class
     * @class fabric.Image.filters.GradientTransparency
     * @memberOf fabric.Image.filters
     * @extends fabric.Image.filters.BaseFilter
     * @see {@link fabric.Image.filters.GradientTransparency#initialize} for constructor definition
     * @example
     * var filter = new fabric.Image.filters.GradientTransparency({
   *   threshold: 200
   * });
     * object.filters.push(filter);
     * object.applyFilters();
     */
    filters.GradientTransparency = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Gamma.prototype */ {

        /**
         * Filter type
         * @param {String} type
         * @default
         */
        type: 'GradientTransparency',

        fragmentSource: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform vec3 uGamma;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'vec3 correction = (1.0 / uGamma);\n' +
        'color.r = pow(color.r, correction.r);\n' +
        'color.g = pow(color.g, correction.g);\n' +
        'color.b = pow(color.b, correction.b);\n' +
        'gl_FragColor = color;\n' +
        'gl_FragColor.rgb *= color.a;\n' +
        '}',

        /**
         * Gamma array value, from 0.01 to 2.2.
         * @param {Array} gamma
         * @default
         */
        gamma: [1, 1, 1],

        /**
         * Describe the property that is the filter parameter
         * @param {String} m
         * @default
         */
        mainParameter: 'gamma',

        /**
         * Apply the gradient transparency operation to a Uint8Array representing the pixels of an image.
         *
         * @param {Object} options
         * @param {ImageData} options.imageData The Uint8Array to be filtered.
         */
        applyTo2d: function (options) {
            var imageData = options.imageData,
                data = imageData.data,
                threshold = this.threshold,
                total = data.length;


            // This is an optimization - pre-compute a look-up table for each color channel
            // instead of performing these pow calls for each pixel in the image.
            for (var i = 0, len = data.length; i < len; i += 4) {
                data[i + 3] = threshold + 255 * (total - i) / total;
            }
        },

        /**
         * gradient filter isNeutralState implementation
         * The filter is never neutral
         * on the image
         **/
        isNeutralState: function () {
            return false;
        },

        /**
         * Return WebGL uniform locations for this filter's shader.
         *
         * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
         * @param {WebGLShaderProgram} program This filter's compiled shader program.
         */
        getUniformLocations: function (gl, program) {
            return {
                uGamma: gl.getUniformLocation(program, 'uGamma'),
            };
        },

        /**
         * Send data from this filter to its shader program's uniforms.
         *
         * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
         * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
         */
        sendUniformData: function (gl, uniformLocations) {
            gl.uniform3fv(uniformLocations.uGamma, this.gamma);
        },
    });

    /**
     * Returns filter instance from an object representation
     * @static
     * @param {Object} object Object to create an instance from
     * @param {function} [callback] to be invoked after filter creation
     * @return {fabric.Image.filters.Gamma} Instance of fabric.Image.filters.Gamma
     */
    fabric.Image.filters.GradientTransparency.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
