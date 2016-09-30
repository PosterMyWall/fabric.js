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
        type: 'table',
        alternateBackgroundColor1: null,
        alternateBackgroundColor2: null,
        homeAwayColor: null,
        rowsWithHomeAwayColorEnabled: [],

        renderTableBorders: function (ctx) {
            if (!this.stroke || this.strokeWidth === 0) {
                return;
            }
            ctx.save();
            this._setStrokeStyles(ctx);
            ctx.strokeRect(
                ~~(-(this.width / 2)) - this._getPaddingX(),
                ~~(-(this.height / 2)) - this._getPaddingY(),
                ~~(this.width) + 2 * this._getPaddingX(),
                ~~(this.height) + 2 * this._getPaddingY()
            );

            if (this._isCustomTableLayout()) {
                this._drawColumnBorders(ctx);
                this._drawRowBorders(ctx);
            }
            ctx.restore();
        },

        /**
         * OLD CODE, saving for later
         */
        // renderTableAlternateBackground: function (ctx) {
        //     if(!(this.alternateBackgroundColor1 && this.alternateBackgroundColor2 && this._isCustomTableLayout())) {
        //         return
        //     }
        //     ctx.save();
        //     var objects = this.getObjects();
        //     for(var i = 0; i < this.__rows; i++) {
        //         var rowHeight = this.getHeightOfRow(i),
        //             top, height, applyFill = true, padding = 1;
        //
        //         // if(this.rowsWithHomeAwayColorEnabled.indexOf(i) != -1) {
        //         //     ctx.fillStyle = this.homeAwayColor;
        //         // }
        //         // else if(this.backgroundColor != null) {
        //         //     ctx.fillStyle = this.backgroundColor;
        //         // }
        //         // else if(this.alternateBackgroundColor1 && this.alternateBackgroundColor2) {
        //         //     if((i % 2) == 0) {
        //         //         ctx.fillStyle =  this.alternateBackgroundColor1;
        //         //     }
        //         //     else {
        //         //         ctx.fillStyle =  this.alternateBackgroundColor2;
        //         //     }
        //         // }
        //         // else {
        //         //     applyFill = false
        //         // }
        //
        //         if((i % 2) == 0) {
        //             ctx.fillStyle =  this.alternateBackgroundColor1;
        //         }
        //         else {
        //             ctx.fillStyle =  this.alternateBackgroundColor2;
        //         }
        //
        //         if(applyFill) {
        //             if (i == 0) {
        //                 top = -this.height / 2 - this._getPaddingY();
        //                 height = this._getPaddingY() + rowHeight + objects[i].fontSize / 4;
        //             }
        //             else if (i == (this.__rows - 1)) {
        //                 top = objects[i].top - objects[i].fontSize / 4;
        //                 height = rowHeight + objects[i].fontSize / 4 + this._getPaddingY();
        //             }
        //             else {
        //                 top = objects[i].top - objects[i].fontSize / 4;
        //                 height = rowHeight + objects[i].fontSize / 2;
        //             }
        //             ctx.fillRect(
        //                 -this.width / 2 - this._getPaddingX(),
        //                 top,
        //                 this.width + 2 * this._getPaddingX(),
        //                 height
        //             );
        //         }
        //     }
        //     ctx.restore();
        // },
        /**
         * This function is responsible for rendering the background of table.
         * It loops over all the rows in the table and draws the appropriate color rectangle for each row.
         * If more then one consecutive rows have background of same color then it draws a one big rectangle of that color.
         * @param ctx context to render on
         */
        renderTableCustomBackground: function (ctx) {
            if((this.rowsWithHomeAwayColorEnabled.length == 0 && !(this.alternateBackgroundColor1 && this.alternateBackgroundColor2)) || !this._isCustomTableLayout()) {
                this.renderGroupBackground(ctx);
                return
            }

            var backgroundData = this.getTableBackGroundData();
            ctx.save();
            var objects = this.getObjects(),
                top = null,
                height = null,
                renderBackground = false,
                rowSpacing = this.fontSize/2;

            for(var i = 0; i < backgroundData.length; i++) {
                renderBackground = false;
                if(backgroundData[i] != 'none') {
                    if (top == null) {
                        if (i == 0) {
                            top = -this.height / 2 - this._getPaddingY();
                        }
                        else {
                            top = objects[i].top - rowSpacing / 2;
                        }
                    }

                    if(backgroundData[i] != backgroundData[i+1]) {
                        // set height of rectangle to render
                        height = Math.abs(top - objects[i].top) + this.getHeightOfRow(i) + rowSpacing / 2;
                        if (i == this.__rows - 1) {
                            height = height + this._getPaddingY() - rowSpacing / 2;
                        }
                        renderBackground = true;

                        switch(backgroundData[i]) {
                            case 'selected':
                                ctx.fillStyle = this.homeAwayColor;
                                break;
                            case 'color':
                                ctx.fillStyle = this.backgroundColor;
                                break;
                            case 'alternate1':
                                ctx.fillStyle = this.alternateBackgroundColor1;
                                break;
                            case 'alternate2':
                                ctx.fillStyle = this.alternateBackgroundColor2;
                                break;
                        }
                    }
                    else {
                        renderBackground = false
                    }

                    if (renderBackground) {
                        ctx.fillRect(
                            -this.width / 2 - this._getPaddingX(),
                            top,
                            this.width + 2 * this._getPaddingX(),
                            height
                        );
                        top = null;
                        height = null;
                    }
                }
            }
            ctx.restore();
        },
        _getPaddingX: function () {
            return this.padding/this.scaleX
        },
        _getPaddingY: function () {
            return this.padding/this.scaleY
        },
        getTableBackGroundData: function () {
            var data = [];
            for(var i = 0; i < this.__rows; i++) {
                if(this.rowsWithHomeAwayColorEnabled.indexOf(i) != -1) {
                    data.push('selected');
                }
                else if (this.backgroundColor != null) {
                    data.push('color')
                }
                else if (this.alternateBackgroundColor1 && this.alternateBackgroundColor2) {
                    if((i % 2) == 0) {
                        data.push('alternate1')
                    }
                    else {
                        data.push('alternate2')
                    }
                }
                else {
                    data.push('none')

                }
            }

            return data;
        },
        /**
         * Returns the height of an item in a given row with max height,
         * this value is basically the minimum space in y-axis needed by this row in a table.
         * @param row
         * @returns {Number}
         */
        getHeightOfRow: function (row) {
            var height = 0, h;
            for (var i = 0; i < this.__columns; i++) {
                h = this.__tableArray[i][row]._getTextHeight();
                if (h > height) {
                    height = h
                }
            }
            return height;
        },
        getWidthOfColumn: function (column) {
            var width = 0, w;
            for (var i = 0; i < this.__rows; i++) {
                w = this.__tableArray[column][i]._getTextWidth();
                if (w > width) {
                    width = w
                }
            }
            return width;
        },
        _drawColumnBorders: function (ctx) {
            var objects = this.getObjects();
            var x = this.__rows, maxWidth, w, itemIndex;
            for (var i = 2; i <= this.__columns; i++) {
                maxWidth = 0;
                while (objects[x] && objects[x].column == i) {
                    w = objects[x].width;
                    if (w > maxWidth) {
                        maxWidth = w;
                        itemIndex = x;
                    }
                    x++;
                }
                ctx.beginPath();
                ctx.moveTo(objects[itemIndex].left - objects[i].fontSize / 2, -(this.height/2) - this._getPaddingY());
                ctx.lineTo(objects[itemIndex].left - objects[i].fontSize / 2, -(this.height/2) + this.height + this._getPaddingY());
                ctx.stroke();
            }
        },
        _drawRowBorders: function (ctx) {
            var objects = this.getObjects();
            for (var i = 1; i < this.__rows; i++) {
                var startX = -this.width/2 - this._getPaddingX(),
                    startY = objects[i].top - objects[i].fontSize / 4,
                    endX = startX + this.width + this._getPaddingX() * 2,
                    endY = startY;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        },
        _isCustomTableLayout: function () {
            return this.__layoutType == 'layout-1';
        }
    });
    fabric.Table.fromObject = fabric.Group.fromObject

})(typeof exports !== 'undefined' ? exports : this);
