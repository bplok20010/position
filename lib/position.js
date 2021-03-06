
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-int"));

var _parseFloat2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-float"));

var _scrollbarSize = _interopRequireDefault(require("bplokjs-dom-utils/scrollbarSize"));

var _adapter = _interopRequireDefault(require("./adapter"));

/*!
 * jQuery UI Position @VERSION
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */
var max = Math.max,
    abs = Math.abs,
    rhorizontal = /left|center|right/,
    rvertical = /top|center|bottom/,
    roffset = /[\+\-]\d+(\.[\d]+)?%?/,
    rposition = /^\w+/,
    rpercent = /%$/;

function getOffsets(offsets, width, height) {
  return [(0, _parseFloat2.default)(offsets[0]) * (rpercent.test(offsets[0]) ? width / 100 : 1), (0, _parseFloat2.default)(offsets[1]) * (rpercent.test(offsets[1]) ? height / 100 : 1)];
}

function parseCss(element, property) {
  return (0, _parseInt2.default)(_adapter.default.css(element, property), 10) || 0;
}

function getDimensions(elem) {
  var raw = elem[0];

  if (raw.nodeType === 9) {
    return {
      width: elem.width(),
      height: elem.height(),
      offset: {
        top: 0,
        left: 0
      }
    };
  }

  if (_adapter.default.isWindow(raw)) {
    return {
      width: elem.width(),
      height: elem.height(),
      offset: {
        top: elem.scrollTop(),
        left: elem.scrollLeft()
      }
    };
  }

  if (raw.preventDefault) {
    return {
      width: 0,
      height: 0,
      offset: {
        top: raw.pageY,
        left: raw.pageX
      }
    };
  }

  return {
    width: elem.outerWidth(),
    height: elem.outerHeight(),
    offset: elem.offset()
  };
}

var utils = {
  getScrollInfo: function getScrollInfo(within) {
    var overflowX = within.isWindow || within.isDocument ? "" : within.element.css("overflow-x"),
        overflowY = within.isWindow || within.isDocument ? "" : within.element.css("overflow-y"),
        hasOverflowX = overflowX === "scroll" || overflowX === "auto" && within.width < within.element[0].scrollWidth,
        hasOverflowY = overflowY === "scroll" || overflowY === "auto" && within.height < within.element[0].scrollHeight;
    return {
      width: hasOverflowY ? (0, _scrollbarSize.default)() : 0,
      height: hasOverflowX ? (0, _scrollbarSize.default)() : 0
    };
  },
  getWithinInfo: function getWithinInfo(element) {
    var withinElement = (0, _adapter.default)(element || window),
        isWindow = _adapter.default.isWindow(withinElement[0]),
        isDocument = !!withinElement[0] && withinElement[0].nodeType === 9,
        hasOffset = !isWindow && !isDocument;

    return {
      element: withinElement,
      isWindow: isWindow,
      isDocument: isDocument,
      offset: hasOffset ? (0, _adapter.default)(element).offset() : {
        left: 0,
        top: 0
      },
      scrollLeft: withinElement.scrollLeft(),
      scrollTop: withinElement.scrollTop(),
      width: withinElement.outerWidth(),
      height: withinElement.outerHeight()
    };
  }
};
var positionCalc = {
  fit: {
    left: function left(position, data) {
      var within = data.within,
          withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
          outerWidth = within.width,
          collisionPosLeft = position.left - data.collisionPosition.marginLeft,
          overLeft = withinOffset - collisionPosLeft,
          overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
          newOverRight; // Element is wider than within

      if (data.collisionWidth > outerWidth) {
        // Element is initially over the left side of within
        if (overLeft > 0 && overRight <= 0) {
          newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
          position.left += overLeft - newOverRight; // Element is initially over right side of within
        } else if (overRight > 0 && overLeft <= 0) {
          position.left = withinOffset; // Element is initially over both left and right sides of within
        } else {
          if (overLeft > overRight) {
            position.left = withinOffset + outerWidth - data.collisionWidth;
          } else {
            position.left = withinOffset;
          }
        } // Too far left -> align with left edge

      } else if (overLeft > 0) {
        position.left += overLeft; // Too far right -> align with right edge
      } else if (overRight > 0) {
        position.left -= overRight; // Adjust based on position and margin
      } else {
        position.left = max(position.left - collisionPosLeft, position.left);
      }
    },
    top: function top(position, data) {
      var within = data.within,
          withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
          outerHeight = data.within.height,
          collisionPosTop = position.top - data.collisionPosition.marginTop,
          overTop = withinOffset - collisionPosTop,
          overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
          newOverBottom; // Element is taller than within

      if (data.collisionHeight > outerHeight) {
        // Element is initially over the top of within
        if (overTop > 0 && overBottom <= 0) {
          newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
          position.top += overTop - newOverBottom; // Element is initially over bottom of within
        } else if (overBottom > 0 && overTop <= 0) {
          position.top = withinOffset; // Element is initially over both top and bottom of within
        } else {
          if (overTop > overBottom) {
            position.top = withinOffset + outerHeight - data.collisionHeight;
          } else {
            position.top = withinOffset;
          }
        } // Too far up -> align with top

      } else if (overTop > 0) {
        position.top += overTop; // Too far down -> align with bottom edge
      } else if (overBottom > 0) {
        position.top -= overBottom; // Adjust based on position and margin
      } else {
        position.top = max(position.top - collisionPosTop, position.top);
      }
    }
  },
  flip: {
    left: function left(position, data) {
      var within = data.within,
          withinOffset = within.offset.left + within.scrollLeft,
          outerWidth = within.width,
          offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
          collisionPosLeft = position.left - data.collisionPosition.marginLeft,
          overLeft = collisionPosLeft - offsetLeft,
          overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
          myOffset = data.my[0] === "left" ? -data.elemWidth : data.my[0] === "right" ? data.elemWidth : 0,
          atOffset = data.at[0] === "left" ? data.targetWidth : data.at[0] === "right" ? -data.targetWidth : 0,
          offset = -2 * data.offset[0],
          newOverRight,
          newOverLeft;

      if (overLeft < 0) {
        newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;

        if (newOverRight < 0 || newOverRight < abs(overLeft)) {
          position.left += myOffset + atOffset + offset;
        }
      } else if (overRight > 0) {
        newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;

        if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
          position.left += myOffset + atOffset + offset;
        }
      }
    },
    top: function top(position, data) {
      var within = data.within,
          withinOffset = within.offset.top + within.scrollTop,
          outerHeight = within.height,
          offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
          collisionPosTop = position.top - data.collisionPosition.marginTop,
          overTop = collisionPosTop - offsetTop,
          overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
          top = data.my[1] === "top",
          myOffset = top ? -data.elemHeight : data.my[1] === "bottom" ? data.elemHeight : 0,
          atOffset = data.at[1] === "top" ? data.targetHeight : data.at[1] === "bottom" ? -data.targetHeight : 0,
          offset = -2 * data.offset[1],
          newOverTop,
          newOverBottom;

      if (overTop < 0) {
        newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;

        if (newOverBottom < 0 || newOverBottom < abs(overTop)) {
          position.top += myOffset + atOffset + offset;
        }
      } else if (overBottom > 0) {
        newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;

        if (newOverTop > 0 || abs(newOverTop) < overBottom) {
          position.top += myOffset + atOffset + offset;
        }
      }
    }
  },
  flipfit: {
    left: function left() {
      positionCalc.flip.left.apply(this, arguments);
      positionCalc.fit.left.apply(this, arguments);
    },
    top: function top() {
      positionCalc.flip.top.apply(this, arguments);
      positionCalc.fit.top.apply(this, arguments);
    }
  }
};

function setPosition($el, options) {
  // Make a copy, we don't want to modify arguments
  options = _adapter.default.extend({}, options);
  var atOffset,
      targetWidth,
      targetHeight,
      targetOffset,
      basePosition,
      dimensions,
      target = (0, _adapter.default)(options.of),
      within = utils.getWithinInfo(options.within),
      scrollInfo = utils.getScrollInfo(within),
      collision = (options.collision || "flip").split(" "),
      offsets = {};
  dimensions = getDimensions(target);

  if (target[0].preventDefault) {
    // Force left top to allow flipping
    options.at = "left top";
  }

  targetWidth = dimensions.width;
  targetHeight = dimensions.height;
  targetOffset = dimensions.offset; // Clone to reuse original targetOffset later

  basePosition = _adapter.default.extend({}, targetOffset); // Force my and at to have valid horizontal and vertical positions
  // if a value is missing or invalid, it will be converted to center

  _adapter.default.each(["my", "at"], function () {
    var pos = (options[this] || "").split(" "),
        horizontalOffset,
        verticalOffset;

    if (pos.length === 1) {
      pos = rhorizontal.test(pos[0]) ? pos.concat(["center"]) : rvertical.test(pos[0]) ? ["center"].concat(pos) : ["center", "center"];
    }

    pos[0] = rhorizontal.test(pos[0]) ? pos[0] : "center";
    pos[1] = rvertical.test(pos[1]) ? pos[1] : "center"; // Calculate offsets

    horizontalOffset = roffset.exec(pos[0]);
    verticalOffset = roffset.exec(pos[1]);
    offsets[this] = [horizontalOffset ? horizontalOffset[0] : 0, verticalOffset ? verticalOffset[0] : 0]; // Reduce to just the positions without the offsets

    options[this] = [rposition.exec(pos[0])[0], rposition.exec(pos[1])[0]];
  }); // Normalize collision option


  if (collision.length === 1) {
    collision[1] = collision[0];
  }

  if (options.at[0] === "right") {
    basePosition.left += targetWidth;
  } else if (options.at[0] === "center") {
    basePosition.left += targetWidth / 2;
  }

  if (options.at[1] === "bottom") {
    basePosition.top += targetHeight;
  } else if (options.at[1] === "center") {
    basePosition.top += targetHeight / 2;
  }

  atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
  basePosition.left += atOffset[0];
  basePosition.top += atOffset[1];
  return $el.each(function () {
    var collisionPosition,
        using,
        elem = (0, _adapter.default)(this),
        elemWidth = elem.outerWidth(),
        elemHeight = elem.outerHeight(),
        marginLeft = parseCss(this, "marginLeft"),
        marginTop = parseCss(this, "marginTop"),
        collisionWidth = elemWidth + marginLeft + parseCss(this, "marginRight") + scrollInfo.width,
        collisionHeight = elemHeight + marginTop + parseCss(this, "marginBottom") + scrollInfo.height,
        position = _adapter.default.extend({}, basePosition),
        myOffset = getOffsets(offsets.my, elem.outerWidth(), elem.outerHeight());

    if (options.my[0] === "right") {
      position.left -= elemWidth;
    } else if (options.my[0] === "center") {
      position.left -= elemWidth / 2;
    }

    if (options.my[1] === "bottom") {
      position.top -= elemHeight;
    } else if (options.my[1] === "center") {
      position.top -= elemHeight / 2;
    }

    position.left += myOffset[0];
    position.top += myOffset[1];
    collisionPosition = {
      marginLeft: marginLeft,
      marginTop: marginTop
    };

    _adapter.default.each(["left", "top"], function (i, dir) {
      if (positionCalc[collision[i]]) {
        positionCalc[collision[i]][dir](position, {
          targetWidth: targetWidth,
          targetHeight: targetHeight,
          elemWidth: elemWidth,
          elemHeight: elemHeight,
          collisionPosition: collisionPosition,
          collisionWidth: collisionWidth,
          collisionHeight: collisionHeight,
          offset: [atOffset[0] + myOffset[0], atOffset[1] + myOffset[1]],
          my: options.my,
          at: options.at,
          within: within,
          elem: elem
        });
      }
    });

    if (options.using) {
      // Adds feedback as second argument to using callback, if present
      using = function using(props) {
        var left = targetOffset.left - position.left,
            right = left + targetWidth - elemWidth,
            top = targetOffset.top - position.top,
            bottom = top + targetHeight - elemHeight,
            feedback = {
          target: {
            element: target,
            left: targetOffset.left,
            top: targetOffset.top,
            width: targetWidth,
            height: targetHeight
          },
          element: {
            element: elem,
            left: position.left,
            top: position.top,
            width: elemWidth,
            height: elemHeight
          },
          horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
          vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
        };

        if (targetWidth < elemWidth && abs(left + right) < targetWidth) {
          feedback.horizontal = "center";
        }

        if (targetHeight < elemHeight && abs(top + bottom) < targetHeight) {
          feedback.vertical = "middle";
        }

        if (max(abs(left), abs(right)) > max(abs(top), abs(bottom))) {
          feedback.important = "horizontal";
        } else {
          feedback.important = "vertical";
        }

        options.using.call(this, props, feedback);
      };
    }

    elem.offset(_adapter.default.extend(position, using ? {
      using: using
    } : {}));
  });
}

;
/**
 * @param {selector,string,array<dom>} 
 * @param {object}
 */

function _default(dom, options) {
  return setPosition((0, _adapter.default)(dom), options);
}