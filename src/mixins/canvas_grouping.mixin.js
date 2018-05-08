(function() {

  var min = Math.min,
      max = Math.max;

  fabric.util.object.extend(fabric.Canvas.prototype, /** @lends fabric.Canvas.prototype */ {

    /**
     * @private
     * @param {Event} e Event object
     * @param {fabric.Object} target
     * @return {Boolean}
     */
    _shouldGroup: function(e, target) {
      var activeObject = this._activeObject;

      return activeObject && this._isSelectionKeyPressed(e) && target && target.selectable && this.selection &&
            (activeObject !== target || activeObject.type === 'activeSelection');
    },

    /**
     * @private
     * @param {Event} e Event object
     * @param {fabric.Object} target
     */
    _handleGrouping: function (e, target) {
      var activeObject = this._activeObject;
      if (activeObject.__corner) {
        return;
      }
      if (target === activeObject) {
        // if it's a group, find target again, using activeGroup objects
        target = this.findTarget(e, true);
        // if even object is not found or we are on activeObjectCorner, bail out
        if (!target) {
          return;
        }
      }
      if (activeObject && activeObject.type === 'activeSelection') {
        this._updateActiveSelection(target, e);
      }
      else {
        this._createActiveSelection(target, e);
      }
    },

    /**
     * @private
     */
    _updateActiveSelection: function(target, e) {
      var activeSelection = this._activeObject,
          currentActiveObjects = activeSelection._objects.slice(0);
      if (activeSelection.contains(target)) {
        activeSelection.removeWithUpdate(target);
        this._hoveredTarget = target;
        if (activeSelection.size() === 1) {
          // activate last remaining object
          this._setActiveObject(activeSelection.item(0), e);
        }
      }
      else {
        activeSelection.addWithUpdate(target);
        this._hoveredTarget = activeSelection;
      }
      this._fireSelectionEvents(currentActiveObjects, e);
    },

    /**
     * @private
     */
    _createActiveSelection: function(target, e) {
      var currentActives = this.getActiveObjects(), group = this._createGroup(target);
      this._hoveredTarget = group;
      this._setActiveObject(group, e);
      this._fireSelectionEvents(currentActives, e);
    },

    /**
     * @private
     * @param {Object} target
     */
    _createGroup: function(target) {
      var objects = this.getObjects(),
          isActiveLower = objects.indexOf(this._activeObject) < objects.indexOf(target),
          groupObjects = isActiveLower
            ? [this._activeObject, target]
            : [target, this._activeObject];
      this._activeObject.isEditing && this._activeObject.exitEditing();
      return new fabric.ActiveSelection(groupObjects, {
        canvas: this
      });
    },

    /**
     * @private
     * @param {Event} e mouse event
     */
    _groupSelectedObjects: function (e) {

      var group = this._collectObjects(),
          aGroup;

      // do not create group for 1 element only
      if (group.length === 1) {
        this.setActiveObject(group[0], e);
      }
      else if (group.length > 1) {
        aGroup = new fabric.ActiveSelection(group.reverse(), {
          canvas: this,
          snapAngle: 45,
          snapThreshold: 3
        });
        this.setActiveObject(aGroup, e);
      }
    },

    _groupObjects: function (e, objects) {
      var group = objects,
          aGroup;

      // do not create group for 1 element only
      if (group.length === 1) {
        this.setActiveObject(group[0], e);
      }
      else if (group.length > 1) {
        aGroup = new fabric.ActiveSelection(group.reverse(), {
          canvas: this,
          snapAngle: 45,
          snapThreshold: 3
        });
        this.setActiveObject(aGroup, e);
      }
    },


//     /**
//      * @private
//      * @param {Event} e mouse event
//      */
//     _groupObjects: function (e, objects) {
// // do not create group for 1 element only
// //       console.log(objects[0].left, objects[0].top);
// //       console.log(objects[1].left, objects[1].top);
//       console.log(objects);
//       if (objects.length === 1) {
//         this.setActiveObject(objects[0], e);
//       }
//       else if (objects.length > 1) {
//         var group = new fabric.Group(objects.reverse(), {canvas: this,
//           cornerStrokeColor: 'rgba(98,255,231,1)'
//         });
//         group.toActiveSelection();
//         group.addWithUpdate();
//         // this.setActiveObject(group, e);
//         // this.fire('selection:created', {target: group});
//         this.requestRenderAll();
//       }
//     },

    /**
     * @private
     */
    _collectObjects: function() {
      var group = [],
          currentObject,
          x1 = this._groupSelector.ex,
          y1 = this._groupSelector.ey,
          x2 = x1 + this._groupSelector.left,
          y2 = y1 + this._groupSelector.top,
          selectionX1Y1 = new fabric.Point(min(x1, x2), min(y1, y2)),
          selectionX2Y2 = new fabric.Point(max(x1, x2), max(y1, y2)),
          allowIntersect = !this.selectionFullyContained,
          isClick = x1 === x2 && y1 === y2;
      // we iterate reverse order to collect top first in case of click.
      for (var i = this._objects.length; i--; ) {
        currentObject = this._objects[i];

        if (!currentObject || !currentObject.selectable || !currentObject.visible) {
          continue;
        }

        if (((allowIntersect && currentObject.intersectsWithRect(selectionX1Y1, selectionX2Y2)) ||
                currentObject.isContainedWithinRect(selectionX1Y1, selectionX2Y2) ||
                (allowIntersect && currentObject.containsPoint(selectionX1Y1)) ||
                (allowIntersect && currentObject.containsPoint(selectionX2Y2))
            ) && !(currentObject.lockMovementX && currentObject.lockMovementY &&
            currentObject.lockScalingX && currentObject.lockScalingY &&
            currentObject.lockRotation)) {
          group.push(currentObject);

          // only add one object if it's a click
          if (isClick) {
            break;
          }
        }
      }

      return group;
    },

    /**
     * @private
     */
    _setCoordsOfActiveGroup: function () {
      var activeGroup = this.getActiveObject();
      if (activeGroup && activeGroup.type == 'group') {
        activeGroup.setObjectsCoords().setCoords();
        activeGroup.isMoving = false;
        this.setCursor(this.defaultCursor);
      }

      // clear selection and current transformation
      this._groupSelector = null;
      this._currentTransform = null;
    },
    /**
     * @private
     */
    // _maybeGroupObjects: function (e) {
    //   if (this.selection && this._groupSelector) {
    //     var objects = this._collectObjects();
    //     this._groupObjects(e, objects);
    //   }
    //   this._setCoordsOfActiveGroup();
    // }
    /**
     * @private
     */
    _maybeGroupObjects: function(e) {
      if (this.selection && this._groupSelector) {
        this._groupSelectedObjects(e);
      }
      this.setCursor(this.defaultCursor);
      // clear selection and current transformation
      this._groupSelector = null;
      this._currentTransform = null;
    }
  });

})();
