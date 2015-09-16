(function() {

  var degreesToRadians = fabric.util.degreesToRadians,
      //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      isVML = function() { return typeof G_vmlCanvasManager !== 'undefined'; };
  //jscs:enable requireCamelCaseOrUpperCaseIdentifiers

  fabric.util.object.extend(fabric.Object.prototype, /** @lends fabric.Object.prototype */ {

    /**
     * The object interactivity controls.
     * @private
     */
    _controlsVisibility: null,

    /**
     * Determines which corner has been clicked
     * @private
     * @param {Object} pointer The pointer indicating the mouse position
     * @return {String|Boolean} corner code (tl, tr, bl, br, etc.), or false if nothing is found
     */
    _findTargetCorner: function(pointer) {
      if (!this.hasControls || !this.active) {
        return false;
      }

      var ex = pointer.x,
          ey = pointer.y,
          xPoints,
          lines;

      for (var i in this.oCoords) {

        if (!this.isControlVisible(i)) {
          continue;
        }

        if (i === 'mtr' && !this.hasRotatingPoint) {
          continue;
        }

        if (this.get('lockUniScaling') &&
           (i === 'mt' || i === 'mr' || i === 'mb' || i === 'ml')) {
          continue;
        }

        lines = this._getImageLines(this.oCoords[i].corner);

        // debugging

        // canvas.contextTop.fillRect(lines.bottomline.d.x, lines.bottomline.d.y, 2, 2);
        // canvas.contextTop.fillRect(lines.bottomline.o.x, lines.bottomline.o.y, 2, 2);

        // canvas.contextTop.fillRect(lines.leftline.d.x, lines.leftline.d.y, 2, 2);
        // canvas.contextTop.fillRect(lines.leftline.o.x, lines.leftline.o.y, 2, 2);

        // canvas.contextTop.fillRect(lines.topline.d.x, lines.topline.d.y, 2, 2);
        // canvas.contextTop.fillRect(lines.topline.o.x, lines.topline.o.y, 2, 2);

        // canvas.contextTop.fillRect(lines.rightline.d.x, lines.rightline.d.y, 2, 2);
        // canvas.contextTop.fillRect(lines.rightline.o.x, lines.rightline.o.y, 2, 2);

        xPoints = this._findCrossPoints({ x: ex, y: ey }, lines);
        if (xPoints !== 0 && xPoints % 2 === 1) {
          this.__corner = i;
          return i;
        }
      }
      return false;
    },

    /**
     * Sets the coordinates of the draggable boxes in the corners of
     * the image used to scale/rotate it.
     * @private
     */
    _setCornerCoords: function() {
      var coords = this.oCoords,
          newTheta = degreesToRadians(45 - this.angle),
          /* Math.sqrt(2 * Math.pow(this.cornerSize, 2)) / 2, */
          /* 0.707106 stands for sqrt(2)/2 */
          cornerHypotenuse = this.cornerSize * 0.707106,
          cosHalfOffset = cornerHypotenuse * Math.cos(newTheta),
          sinHalfOffset = cornerHypotenuse * Math.sin(newTheta),
          x, y;

      for (var point in coords) {
        x = coords[point].x;
        y = coords[point].y;

        if(point === 'btn') {
          var btnCornerHypotenuse = Math.sqrt(Math.pow(this.cornerSize, 2) + Math.pow(this.buttonWidth, 2)),
              btnCosHalfOffset = btnCornerHypotenuse * Math.cos(newTheta),
              btnSinHalfOffset = btnCornerHypotenuse * Math.sin(newTheta);
          coords[point].corner = {
            tl: {
              x: x + 55 - btnSinHalfOffset,
              y: y - btnCosHalfOffset
            },
            tr: {
              x: x + 20 + btnCosHalfOffset,
              y: y - btnSinHalfOffset
            },
            bl: {
              x: x + 55 - btnCosHalfOffset,
              y: y + btnSinHalfOffset
            },
            br: {
              x: x + 20 + btnSinHalfOffset,
              y: y + btnCosHalfOffset
            }
          };
        }
        else {
          coords[point].corner = {
            tl: {
              x: x - sinHalfOffset,
              y: y - cosHalfOffset
            },
            tr: {
              x: x + cosHalfOffset,
              y: y - sinHalfOffset
            },
            bl: {
              x: x - cosHalfOffset,
              y: y + sinHalfOffset
            },
            br: {
              x: x + sinHalfOffset,
              y: y + cosHalfOffset
            }
          };
        }
      }
    },

    /*
     * Calculate object dimensions from its properties
     * @private
     */
    _getNonTransformedDimensions: function() {
      var strokeWidth = this.strokeWidth,
          w = this.width,
          h = this.height,
          addStrokeToW = true,
          addStrokeToH = true;

      if (this.type === 'line' && this.strokeLineCap === 'butt') {
        addStrokeToH = w;
        addStrokeToW = h;
      }

      if (addStrokeToH) {
        h += h < 0 ? -strokeWidth : strokeWidth;
      }

      if (addStrokeToW) {
        w += w < 0 ? -strokeWidth : strokeWidth;
      }

      return { x: w, y: h };
    },

    /*
     * @private
     */
    _getTransformedDimensions: function(dimensions) {
      if (!dimensions) {
        dimensions = this._getNonTransformedDimensions();
      }
      var transformMatrix = this._calcDimensionsTransformMatrix();
      return fabric.util.transformPoint(dimensions, transformMatrix, true);
    },

    /*
     * private
     */
    _calculateCurrentDimensions: function()  {
      var vpt = this.getViewportTransform(),
          dim = this._getTransformedDimensions(),
          w = dim.x, h = dim.y;

      w += 2 * this.padding;
      h += 2 * this.padding;

      return fabric.util.transformPoint(new fabric.Point(w, h), vpt, true);
    },

    /**
     * Draws borders of an object's bounding box.
     * Requires public properties: width, height
     * Requires public options: padding, borderColor
     * @param {CanvasRenderingContext2D} ctx Context to draw on
     * @return {fabric.Object} thisArg
     * @chainable
     */
    drawBorders: function(ctx) {
      if (!this.hasBorders) {
        return this;
      }

      ctx.save();

      ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = 2 / this.borderScaleFactor;

      var wh = this._calculateCurrentDimensions(),
          width = wh.x,
          height = wh.y;
      if (this.group) {
        width = width * this.group.scaleX;
        height = height * this.group.scaleY;
      }

      ctx.strokeRect(
        ~~(-(width / 2)) - 0.5, // offset needed to make lines look sharper
        ~~(-(height / 2)) - 0.5,
        ~~(width) + 1, // double offset needed to make lines look sharper
        ~~(height) + 1
      );

      if (this.hasRotatingPoint && this.isControlVisible('mtr') && !this.get('lockRotation') && this.hasControls) {

        var rotateHeight = -height / 2;

        ctx.beginPath();
        ctx.moveTo(0, rotateHeight);
        ctx.lineTo(0, rotateHeight - this.rotatingPointOffset);
        ctx.closePath();
        ctx.stroke();
      }

      ctx.restore();
      return this;
    },

    /**
     * Draws corners of an object's bounding box.
     * Requires public properties: width, height
     * Requires public options: cornerSize, padding
     * @param {CanvasRenderingContext2D} ctx Context to draw on
     * @return {fabric.Object} thisArg
     * @chainable
     */
    drawControls: function(ctx) {
      if (!this.hasControls) {
        return this;
      }

      var wh = this._calculateCurrentDimensions(),
          width = wh.x,
          height = wh.y,
          scaleOffset = this.cornerSize / 2,
          left = -(width / 2) - scaleOffset,
          top = -(height / 2) - scaleOffset,
          methodName = this.transparentCorners ? 'strokeRect' : 'fillRect';

      ctx.save();

      ctx.lineWidth = 2;

      ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
      ctx.strokeStyle = ctx.fillStyle = this.cornerColor;
      ctx.strokeStyle = this.borderColor;
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      if(this.hasButton) {
        this._drawControl('btn', ctx, methodName,
            left + width/2,
            top + height);
      }

      // top-left
      this._drawControl('tl', ctx, methodName,
        left,
        top);

      // top-right
      this._drawControl('tr', ctx, methodName,
        left + width,
        top);

      // bottom-left
      this._drawControl('bl', ctx, methodName,
        left,
        top + height);

      // bottom-right
      this._drawControl('br', ctx, methodName,
        left + width,
        top + height);

      if (!this.get('lockUniScaling')) {

        // middle-top
        this._drawControl('mt', ctx, methodName,
          left + width/2,
          top);

        // middle-bottom
        this._drawControl('mb', ctx, methodName,
          left + width/2,
          top + height);

        // middle-right
        this._drawControl('mr', ctx, methodName,
          left + width,
          top + height/2);

        // middle-left
        this._drawControl('ml', ctx, methodName,
          left,
          top + height/2);
      }

      // middle-top-rotate
      if (this.hasRotatingPoint) {
        this._drawControl('mtr', ctx, methodName,
          left + width/2 ,
          top - this.rotatingPointOffset);
      }

      ctx.restore();

      return this;
    },

    /**
     * @private
     */
    _drawControl: function(control, ctx, methodName, left, top) {
      if (!this.isControlVisible(control)) {
        return;
      }
      var size = this.cornerSize;
      
      /*
       * The rotation point looks different from other controls. It is a circle
       * with an arrow inside it.
       */
      if(control === 'mtr') {
        
        // first draw the circle
        ctx.beginPath();
        ctx.arc(left + 11, top + 11, (size/2)+5, 0, 2 * Math.PI);
        ctx.fill();
        
        /*
         * Save state since the arrow inside the circle will have a thinner lineWidth
         * and no shadow.
         */
        ctx.save();
        ctx.lineWidth = 1;
        ctx.shadowColor = "transparent";
        
        /*
         * Since the arrow is sourced from an SVG path, it needs to be translated
         * a bit to make it appear in the right place. The constants added to the
         * left and top values below are to center the arrow inside the circle.
         */
        ctx.translate(left + 1, top - (2 * this.rotatingPointOffset) + 2);
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 4;
        
        /*
         * Draw the circular arrow. The original SVG is at https://thenounproject.com/term/rotate/66368/
         * We're using a modified version that requires minimal translation and
         * no scaling.
         */
        ctx.beginPath();
        ctx.moveTo(10.5,79);
        ctx.bezierCurveTo(6.8935664,79,3.5763253,80.838639,1.6541928,83.84594);
        ctx.lineTo(1.0462049,80.85812);
        ctx.lineTo(0.30184339,81.010181);
        ctx.lineTo(1.2116748,85.477108);
        ctx.lineTo(5.6001688,84.245446);
        ctx.lineTo(5.395482,83.513735);
        ctx.lineTo(2.1941205,84.41294);
        ctx.bezierCurveTo(3.9611567,81.529362,7.0911688,79.759036,10.5,79.759036);
        ctx.bezierCurveTo(15.871193,79.759036,20.240963999999998,84.128807,20.240963999999998,89.5);
        ctx.bezierCurveTo(20.240963999999998,94.871193,15.871192999999998,99.240964,10.499999999999998,99.240964);
        ctx.bezierCurveTo(5.128807299999998,99.240964,0.7590361499999982,94.871193,0.7590361499999982,89.5);
        ctx.lineTo(0,89.5);
        ctx.bezierCurveTo(0,95.289675,4.7103253,100,10.5,100);
        ctx.bezierCurveTo(16.289674,100,21,95.289675,21,89.5);
        ctx.bezierCurveTo(21,83.710325,16.289674,79,10.5,79);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      else if(control === 'btn') {
        // 36px is related to the default width of the button
        var bLeft = left - 36, bTop = top;
        // If the object is small enough to result in overlapping of corners and the button, push the button down
        if((this.width * this.scaleX) < (this.buttonWidth + 2 * this.cornerSize)) {
          // extra 4px to add some empty space between corners and the button
          bTop += this.cornerSize + 4;
        }
        ctx[methodName](bLeft, bTop, this.buttonWidth, size);
        ctx['strokeRect'](bLeft, bTop, this.buttonWidth, size);

        ctx.save();
        ctx.font = '13px sans-serif';
        ctx.fillStyle = this.borderColor;
        // 5px padding of text from the left edge. 14px adjustment which depends on the font size and baseline of the text
        ctx.fillText(this.buttonText, bLeft + 5, bTop + 14);
        ctx.restore();
      }
      else {
        isVML() || this.transparentCorners || ctx.clearRect(left, top, size, size);
        ctx[methodName](left, top, size, size);
        ctx['strokeRect'](left, top, size, size);
      }
    },

    /**
     * Returns true if the specified control is visible, false otherwise.
     * @param {String} controlName The name of the control. Possible values are 'tl', 'tr', 'br', 'bl', 'ml', 'mt', 'mr', 'mb', 'mtr'.
     * @returns {Boolean} true if the specified control is visible, false otherwise
     */
    isControlVisible: function(controlName) {
      return this._getControlsVisibility()[controlName];
    },

    /**
     * Sets the visibility of the specified control.
     * @param {String} controlName The name of the control. Possible values are 'tl', 'tr', 'br', 'bl', 'ml', 'mt', 'mr', 'mb', 'mtr'.
     * @param {Boolean} visible true to set the specified control visible, false otherwise
     * @return {fabric.Object} thisArg
     * @chainable
     */
    setControlVisible: function(controlName, visible) {
      this._getControlsVisibility()[controlName] = visible;
      return this;
    },

    /**
     * Sets the visibility state of object controls.
     * @param {Object} [options] Options object
     * @param {Boolean} [options.bl] true to enable the bottom-left control, false to disable it
     * @param {Boolean} [options.br] true to enable the bottom-right control, false to disable it
     * @param {Boolean} [options.mb] true to enable the middle-bottom control, false to disable it
     * @param {Boolean} [options.ml] true to enable the middle-left control, false to disable it
     * @param {Boolean} [options.mr] true to enable the middle-right control, false to disable it
     * @param {Boolean} [options.mt] true to enable the middle-top control, false to disable it
     * @param {Boolean} [options.tl] true to enable the top-left control, false to disable it
     * @param {Boolean} [options.tr] true to enable the top-right control, false to disable it
     * @param {Boolean} [options.mtr] true to enable the middle-top-rotate control, false to disable it
     * @return {fabric.Object} thisArg
     * @chainable
     */
    setControlsVisibility: function(options) {
      options || (options = { });

      for (var p in options) {
        this.setControlVisible(p, options[p]);
      }
      return this;
    },

    /**
     * Returns the instance of the control visibility set for this object.
     * @private
     * @returns {Object}
     */
    _getControlsVisibility: function() {
      if (!this._controlsVisibility) {
        this._controlsVisibility = {
          tl: true,
          tr: true,
          br: true,
          bl: true,
          ml: true,
          mt: true,
          mr: true,
          mb: true,
          mtr: true,
          btn: true
        };
      }
      return this._controlsVisibility;
    }
  });
})();
