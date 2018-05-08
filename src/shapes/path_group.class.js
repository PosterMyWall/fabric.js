/**
 * Created by postermywall on 23/04/2018.
 */
(function (global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        extend = fabric.util.object.extend,
        invoke = fabric.util.array.invoke,
        parentToObject = fabric.Object.prototype.toObject;

    if (fabric.PathGroup) {
        fabric.warn('fabric.PathGroup is already defined');
        return;
    }

    /**
     * Path group class
     * @class fabric.PathGroup
     * @extends fabric.Path
     * @tutorial {@link http://fabricjs.com/fabric-intro-part-1/#path_and_pathgroup}
     * @see {@link fabric.PathGroup#initialize} for constructor definition
     */
    fabric.PathGroup = fabric.util.createClass(fabric.Path, /** @lends fabric.PathGroup.prototype */ {

        /**
         * Type of an object
         * @type String
         * @default
         */
        type: 'path-group',

        /**
         * Fill value
         * @type String
         * @default
         */
        fill: '',

        /**
         * Constructor
         * @param {Array} paths
         * @param {Object} [options] Options object
         * @return {fabric.PathGroup} thisArg
         */
        initialize: function (paths, options) {

            options = options || {};
            this.paths = paths || [];

            for (var i = this.paths.length; i--;) {
                this.paths[i].group = this;
            }

            if (options.toBeParsed) {
                this.parseDimensionsFromPaths(options);
                delete options.toBeParsed;
            }
            this.setOptions(options);
            this.setCoords();

            if (options.sourcePath) {
                this.setSourcePath(options.sourcePath);
            }
        },

        /**
         * Calculate width and height based on paths contained
         */
        parseDimensionsFromPaths: function (options) {
            var points, p, xC = [], yC = [], path, height, width,
                m;
            for (var j = this.paths.length; j--;) {
                path = this.paths[j];
                height = path.height + path.strokeWidth;
                width = path.width + path.strokeWidth;
                points = [
                    {x: path.left, y: path.top},
                    {x: path.left + width, y: path.top},
                    {x: path.left, y: path.top + height},
                    {x: path.left + width, y: path.top + height}
                ];
                m = this.paths[j].transformMatrix;
                for (var i = 0; i < points.length; i++) {
                    p = points[i];
                    if (m) {
                        p = fabric.util.transformPoint(p, m, false);
                    }
                    xC.push(p.x);
                    yC.push(p.y);
                }
            }
            options.width = Math.max.apply(null, xC);
            options.height = Math.max.apply(null, yC);
        },

        /**
         * Renders this group on a specified context
         * @param {CanvasRenderingContext2D} ctx Context to render this instance on
         */
        render: function (ctx) {
            // do not render if object is not visible
            if (!this.visible) {
                return;
            }

            ctx.save();

            this._setShadow(ctx);
            this.clipTo && fabric.util.clipContext(this, ctx);

            var center = this.getCenterPoint();
            var corner = this.getCornerPointsForTransform(center);
            var dx = corner.tl.x - (center.x),
                dy = corner.tl.y - (center.y);
            ctx.translate(dx, dy);

            for (var i = 0, l = this.paths.length; i < l; ++i) {
                this.paths[i].render(ctx, true);
            }
            this.clipTo && ctx.restore();
            ctx.restore();
        },

        /**
         * This function returns the 4 corner points of the path-group, taking care of the angle and flipping values
         * The corner points are with respect to the center point passed to this function.
         * @param {Object} center center of object
         * @returns {{tl: ({x: number, y: number}|*), tr: ({x: number, y: number}|*), bl: ({x: number, y: number}|*), br: ({x: number, y: *}|*)}}
         */
        getCornerPointsForTransform: function (center) {
            // do add the group angle if this shape is part of active group on canvas
            var angle = this.angle + (this.group ? this.group.angle : 0),
                width = (this.width + this.paths[0].strokeWidth) * this.scaleX,
                height = (this.height + this.paths[0].strokeWidth) * this.scaleY,

                tl, tr, bl, br,
            // coordinates of the center point
                x = center.x,
                y = center.y,
                theta = fabric.util.degreesToRadians(angle);

            if (width < 0) {
                width = Math.abs(width);
            }

            var sinTh = Math.sin(theta),
                cosTh = Math.cos(theta),
                _angle = width > 0 ? Math.atan(height / width) : 0,
                _hypotenuse = (width / Math.cos(_angle)) / 2,
                offsetX, offsetY;

            if (this.flipY != this.flipX) {
                offsetY = Math.cos(_angle + theta) * _hypotenuse;
                offsetX = Math.sin(_angle + theta) * _hypotenuse;
            }
            else {
                offsetX = Math.cos(_angle + theta) * _hypotenuse;
                offsetY = Math.sin(_angle + theta) * _hypotenuse;
            }

            offsetY *= (this.flipY ? -1 : 1);
            offsetX *= (this.flipX ? -1 : 1);


            tl = {
                x: x - offsetX,
                y: y - offsetY
            };

            tr = {
                x: (x - offsetX) + (width * cosTh),
                y: (y - offsetY) + (width * sinTh)
            };

            br = {
                x: x + offsetX,
                y: y + offsetY
            };

            bl = {
                x: (x - offsetX) - (height * sinTh),
                y: (y - offsetY) + (height * cosTh)
            };
            return {
                tl: tl,
                tr: tr,
                bl: bl,
                br: br
            };
        },

        /**
         * Sets certain property to a certain value
         * @param {String} prop
         * @param {Any} value
         * @return {fabric.PathGroup} thisArg
         */
        _set: function (prop, value) {

            if (prop === 'fill' && value && this.isSameColor()) {
                var i = this.paths.length;
                while (i--) {
                    this.paths[i]._set(prop, value);
                }
            }

            return this.callSuper('_set', prop, value);
        },

        /**
         * Returns object representation of this path group
         * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
         * @return {Object} object representation of an instance
         */
        toObject: function (propertiesToInclude) {
            var o = extend(parentToObject.call(this, propertiesToInclude), {
                paths: invoke(this.getObjects(), 'toObject', propertiesToInclude)
            });
            if (this.sourcePath) {
                o.sourcePath = this.sourcePath;
            }
            return o;
        },

        /**
         * Returns dataless object representation of this path group
         * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
         * @return {Object} dataless object representation of an instance
         */
        toDatalessObject: function (propertiesToInclude) {
            var o = this.toObject(propertiesToInclude);
            if (this.sourcePath) {
                o.paths = this.sourcePath;
            }
            return o;
        },

        /* _TO_SVG_START_ */
        /**
         * Returns svg representation of an instance
         * @param {Function} [reviver] Method for further parsing of svg representation.
         * @return {String} svg representation of an instance
         */
        toSVG: function (reviver) {
            var objects = this.getObjects(),
                p = this.getPointByOrigin('left', 'top'),
                translatePart = 'translate(' + p.x + ' ' + p.y + ')',
                markup = this._createBaseSVGMarkup();
            markup.push(
                '<g ',
                'style="', this.getSvgStyles(), '" ',
                'transform="', this.getSvgTransformMatrix(), translatePart, this.getSvgTransform(), '" ',
                '>\n'
            );

            for (var i = 0, len = objects.length; i < len; i++) {
                markup.push('\t', objects[i].toSVG(reviver));
            }
            markup.push('</g>\n');

            return reviver ? reviver(markup.join('')) : markup.join('');
        },
        /* _TO_SVG_END_ */

        /**
         * Returns a string representation of this path group
         * @return {String} string representation of an object
         */
        toString: function () {
            return '#<fabric.PathGroup (' + this.complexity() +
                '): { top: ' + this.top + ', left: ' + this.left + ' }>';
        },

        /**
         * Returns true if all paths in this group are of same color
         * @return {Boolean} true if all paths are of the same color (`fill`)
         */
        isSameColor: function () {
            var firstPathFill = this.getObjects()[0].get('fill') || '';
            if (typeof firstPathFill !== 'string') {
                return false;
            }
            firstPathFill = firstPathFill.toLowerCase();
            return this.getObjects().every(function (path) {
                var pathFill = path.get('fill') || '';
                return typeof pathFill === 'string' && (pathFill).toLowerCase() === firstPathFill;
            });
        },

        /**
         * Returns number representation of object's complexity
         * @return {Number} complexity
         */
        complexity: function () {
            return this.paths.reduce(function (total, path) {
                return total + ((path && path.complexity) ? path.complexity() : 0);
            }, 0);
        },

        /**
         * Returns all paths in this path group
         * @return {Array} array of path objects included in this path group
         */
        getObjects: function () {
            return this.paths;
        },
        /**
         * Check if this group or its parent group are caching, recursively up
         * @return {Boolean}
         */
        isOnACache: function () {
            return this.ownCaching || (this.group && this.group.isOnACache());
        }
    });

    /**
     * Creates fabric.PathGroup instance from an object representation
     * @static
     * @memberOf fabric.PathGroup
     * @param {Object} object Object to create an instance from
     * @param {Function} callback Callback to invoke when an fabric.PathGroup instance is created
     */
    fabric.PathGroup.fromObject = function (object, callback) {
        if (typeof object.paths === 'string') {
            fabric.loadSVGFromURL(object.paths, function (elements) {

                var pathUrl = object.paths;
                delete object.paths;

                var pathGroup = fabric.util.groupSVGElementsForPathGroup(elements, object, pathUrl);

                callback(pathGroup);
            });
        }
        else {
            fabric.util.enlivenObjects(object.paths, function (enlivenedObjects) {
                delete object.paths;
                callback(new fabric.PathGroup(enlivenedObjects, object));
            });
        }
    };

    /**
     * Indicates that instances of this type are async
     * @static
     * @memberOf fabric.PathGroup
     * @type Boolean
     * @default
     */
    fabric.PathGroup.async = true;

})(typeof exports !== 'undefined' ? exports : this);
