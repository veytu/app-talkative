var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var SOUP = "!#%()*+,-./:;=?@[]^_`{|}~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
var SOUP_LEN = 87;
var ID_LEN = 20;
var reusedIdCarrier = [];
var genUID = () => {
  for (let i = 0; i < ID_LEN; i++) {
    reusedIdCarrier[i] = SOUP.charAt(Math.random() * SOUP_LEN);
  }
  return reusedIdCarrier.join("");
};
function invoke(fn) {
  try {
    return fn();
  } catch (e) {
    console.error(e);
  }
}
var SideEffectManager = class {
  constructor() {
    this.push = this.addDisposer;
    this.disposers = /* @__PURE__ */ new Map();
  }
  addDisposer(disposer, disposerID = this.genUID()) {
    this.flush(disposerID);
    this.disposers.set(
      disposerID,
      Array.isArray(disposer) ? joinDisposers(disposer) : disposer
    );
    return disposerID;
  }
  add(executor, disposerID = this.genUID()) {
    const disposers = executor();
    return disposers ? this.addDisposer(disposers, disposerID) : disposerID;
  }
  addEventListener(el, type, listener, options, disposerID = this.genUID()) {
    el.addEventListener(type, listener, options);
    this.addDisposer(
      () => el.removeEventListener(type, listener, options),
      disposerID
    );
    return disposerID;
  }
  setTimeout(handler, timeout, disposerID = this.genUID()) {
    const ticket = window.setTimeout(() => {
      this.remove(disposerID);
      handler();
    }, timeout);
    return this.addDisposer(() => window.clearTimeout(ticket), disposerID);
  }
  setInterval(handler, timeout, disposerID = this.genUID()) {
    const ticket = window.setInterval(handler, timeout);
    return this.addDisposer(() => window.clearInterval(ticket), disposerID);
  }
  remove(disposerID) {
    const disposer = this.disposers.get(disposerID);
    this.disposers.delete(disposerID);
    return disposer;
  }
  flush(disposerID) {
    const disposer = this.remove(disposerID);
    if (disposer) {
      disposer();
    }
  }
  flushAll() {
    this.disposers.forEach(invoke);
    this.disposers.clear();
  }
  genUID() {
    let uid;
    do {
      uid = genUID();
    } while (this.disposers.has(uid));
    return uid;
  }
};
function joinDisposers(disposers) {
  return () => disposers.forEach(invoke);
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var randomColor$1 = { exports: {} };
(function(module, exports) {
  (function(root, factory) {
    {
      var randomColor2 = factory();
      if (module && module.exports) {
        exports = module.exports = randomColor2;
      }
      exports.randomColor = randomColor2;
    }
  })(commonjsGlobal, function() {
    var seed = null;
    var colorDictionary = {};
    loadColorBounds();
    var colorRanges = [];
    var randomColor2 = function(options) {
      options = options || {};
      if (options.seed !== void 0 && options.seed !== null && options.seed === parseInt(options.seed, 10)) {
        seed = options.seed;
      } else if (typeof options.seed === "string") {
        seed = stringToInteger(options.seed);
      } else if (options.seed !== void 0 && options.seed !== null) {
        throw new TypeError("The seed value must be an integer or string");
      } else {
        seed = null;
      }
      var H, S, B;
      if (options.count !== null && options.count !== void 0) {
        var totalColors = options.count, colors = [];
        for (var i = 0; i < options.count; i++) {
          colorRanges.push(false);
        }
        options.count = null;
        while (totalColors > colors.length) {
          var color = randomColor2(options);
          if (seed !== null) {
            options.seed = seed;
          }
          colors.push(color);
        }
        options.count = totalColors;
        return colors;
      }
      H = pickHue(options);
      S = pickSaturation(H, options);
      B = pickBrightness(H, S, options);
      return setFormat([H, S, B], options);
    };
    function pickHue(options) {
      if (colorRanges.length > 0) {
        var hueRange = getRealHueRange(options.hue);
        var hue = randomWithin(hueRange);
        var step = (hueRange[1] - hueRange[0]) / colorRanges.length;
        var j = parseInt((hue - hueRange[0]) / step);
        if (colorRanges[j] === true) {
          j = (j + 2) % colorRanges.length;
        } else {
          colorRanges[j] = true;
        }
        var min = (hueRange[0] + j * step) % 359, max = (hueRange[0] + (j + 1) * step) % 359;
        hueRange = [min, max];
        hue = randomWithin(hueRange);
        if (hue < 0) {
          hue = 360 + hue;
        }
        return hue;
      } else {
        var hueRange = getHueRange(options.hue);
        hue = randomWithin(hueRange);
        if (hue < 0) {
          hue = 360 + hue;
        }
        return hue;
      }
    }
    function pickSaturation(hue, options) {
      if (options.hue === "monochrome") {
        return 0;
      }
      if (options.luminosity === "random") {
        return randomWithin([0, 100]);
      }
      var saturationRange = getSaturationRange(hue);
      var sMin = saturationRange[0], sMax = saturationRange[1];
      switch (options.luminosity) {
        case "bright":
          sMin = 55;
          break;
        case "dark":
          sMin = sMax - 10;
          break;
        case "light":
          sMax = 55;
          break;
      }
      return randomWithin([sMin, sMax]);
    }
    function pickBrightness(H, S, options) {
      var bMin = getMinimumBrightness(H, S), bMax = 100;
      switch (options.luminosity) {
        case "dark":
          bMax = bMin + 20;
          break;
        case "light":
          bMin = (bMax + bMin) / 2;
          break;
        case "random":
          bMin = 0;
          bMax = 100;
          break;
      }
      return randomWithin([bMin, bMax]);
    }
    function setFormat(hsv, options) {
      switch (options.format) {
        case "hsvArray":
          return hsv;
        case "hslArray":
          return HSVtoHSL(hsv);
        case "hsl":
          var hsl = HSVtoHSL(hsv);
          return "hsl(" + hsl[0] + ", " + hsl[1] + "%, " + hsl[2] + "%)";
        case "hsla":
          var hslColor = HSVtoHSL(hsv);
          var alpha = options.alpha || Math.random();
          return "hsla(" + hslColor[0] + ", " + hslColor[1] + "%, " + hslColor[2] + "%, " + alpha + ")";
        case "rgbArray":
          return HSVtoRGB(hsv);
        case "rgb":
          var rgb = HSVtoRGB(hsv);
          return "rgb(" + rgb.join(", ") + ")";
        case "rgba":
          var rgbColor = HSVtoRGB(hsv);
          var alpha = options.alpha || Math.random();
          return "rgba(" + rgbColor.join(", ") + ", " + alpha + ")";
        default:
          return HSVtoHex(hsv);
      }
    }
    function getMinimumBrightness(H, S) {
      var lowerBounds = getColorInfo(H).lowerBounds;
      for (var i = 0; i < lowerBounds.length - 1; i++) {
        var s1 = lowerBounds[i][0], v1 = lowerBounds[i][1];
        var s2 = lowerBounds[i + 1][0], v2 = lowerBounds[i + 1][1];
        if (S >= s1 && S <= s2) {
          var m = (v2 - v1) / (s2 - s1), b = v1 - m * s1;
          return m * S + b;
        }
      }
      return 0;
    }
    function getHueRange(colorInput) {
      if (typeof parseInt(colorInput) === "number") {
        var number = parseInt(colorInput);
        if (number < 360 && number > 0) {
          return [number, number];
        }
      }
      if (typeof colorInput === "string") {
        if (colorDictionary[colorInput]) {
          var color = colorDictionary[colorInput];
          if (color.hueRange) {
            return color.hueRange;
          }
        } else if (colorInput.match(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i)) {
          var hue = HexToHSB(colorInput)[0];
          return [hue, hue];
        }
      }
      return [0, 360];
    }
    function getSaturationRange(hue) {
      return getColorInfo(hue).saturationRange;
    }
    function getColorInfo(hue) {
      if (hue >= 334 && hue <= 360) {
        hue -= 360;
      }
      for (var colorName in colorDictionary) {
        var color = colorDictionary[colorName];
        if (color.hueRange && hue >= color.hueRange[0] && hue <= color.hueRange[1]) {
          return colorDictionary[colorName];
        }
      }
      return "Color not found";
    }
    function randomWithin(range) {
      if (seed === null) {
        var golden_ratio = 0.618033988749895;
        var r = Math.random();
        r += golden_ratio;
        r %= 1;
        return Math.floor(range[0] + r * (range[1] + 1 - range[0]));
      } else {
        var max = range[1] || 1;
        var min = range[0] || 0;
        seed = (seed * 9301 + 49297) % 233280;
        var rnd = seed / 233280;
        return Math.floor(min + rnd * (max - min));
      }
    }
    function HSVtoHex(hsv) {
      var rgb = HSVtoRGB(hsv);
      function componentToHex(c) {
        var hex2 = c.toString(16);
        return hex2.length == 1 ? "0" + hex2 : hex2;
      }
      var hex = "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
      return hex;
    }
    function defineColor(name, hueRange, lowerBounds) {
      var sMin = lowerBounds[0][0], sMax = lowerBounds[lowerBounds.length - 1][0], bMin = lowerBounds[lowerBounds.length - 1][1], bMax = lowerBounds[0][1];
      colorDictionary[name] = {
        hueRange,
        lowerBounds,
        saturationRange: [sMin, sMax],
        brightnessRange: [bMin, bMax]
      };
    }
    function loadColorBounds() {
      defineColor(
        "monochrome",
        null,
        [[0, 0], [100, 0]]
      );
      defineColor(
        "red",
        [-26, 18],
        [[20, 100], [30, 92], [40, 89], [50, 85], [60, 78], [70, 70], [80, 60], [90, 55], [100, 50]]
      );
      defineColor(
        "orange",
        [18, 46],
        [[20, 100], [30, 93], [40, 88], [50, 86], [60, 85], [70, 70], [100, 70]]
      );
      defineColor(
        "yellow",
        [46, 62],
        [[25, 100], [40, 94], [50, 89], [60, 86], [70, 84], [80, 82], [90, 80], [100, 75]]
      );
      defineColor(
        "green",
        [62, 178],
        [[30, 100], [40, 90], [50, 85], [60, 81], [70, 74], [80, 64], [90, 50], [100, 40]]
      );
      defineColor(
        "blue",
        [178, 257],
        [[20, 100], [30, 86], [40, 80], [50, 74], [60, 60], [70, 52], [80, 44], [90, 39], [100, 35]]
      );
      defineColor(
        "purple",
        [257, 282],
        [[20, 100], [30, 87], [40, 79], [50, 70], [60, 65], [70, 59], [80, 52], [90, 45], [100, 42]]
      );
      defineColor(
        "pink",
        [282, 334],
        [[20, 100], [30, 90], [40, 86], [60, 84], [80, 80], [90, 75], [100, 73]]
      );
    }
    function HSVtoRGB(hsv) {
      var h = hsv[0];
      if (h === 0) {
        h = 1;
      }
      if (h === 360) {
        h = 359;
      }
      h = h / 360;
      var s = hsv[1] / 100, v = hsv[2] / 100;
      var h_i = Math.floor(h * 6), f = h * 6 - h_i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s), r = 256, g = 256, b = 256;
      switch (h_i) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
          break;
      }
      var result = [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
      return result;
    }
    function HexToHSB(hex) {
      hex = hex.replace(/^#/, "");
      hex = hex.length === 3 ? hex.replace(/(.)/g, "$1$1") : hex;
      var red = parseInt(hex.substr(0, 2), 16) / 255, green = parseInt(hex.substr(2, 2), 16) / 255, blue = parseInt(hex.substr(4, 2), 16) / 255;
      var cMax = Math.max(red, green, blue), delta = cMax - Math.min(red, green, blue), saturation = cMax ? delta / cMax : 0;
      switch (cMax) {
        case red:
          return [60 * ((green - blue) / delta % 6) || 0, saturation, cMax];
        case green:
          return [60 * ((blue - red) / delta + 2) || 0, saturation, cMax];
        case blue:
          return [60 * ((red - green) / delta + 4) || 0, saturation, cMax];
      }
    }
    function HSVtoHSL(hsv) {
      var h = hsv[0], s = hsv[1] / 100, v = hsv[2] / 100, k = (2 - s) * v;
      return [
        h,
        Math.round(s * v / (k < 1 ? k : 2 - k) * 1e4) / 100,
        k / 2 * 100
      ];
    }
    function stringToInteger(string) {
      var total = 0;
      for (var i = 0; i !== string.length; i++) {
        if (total >= Number.MAX_SAFE_INTEGER)
          break;
        total += string.charCodeAt(i);
      }
      return total;
    }
    function getRealHueRange(colorHue) {
      if (!isNaN(colorHue)) {
        var number = parseInt(colorHue);
        if (number < 360 && number > 0) {
          return getColorInfo(colorHue).hueRange;
        }
      } else if (typeof colorHue === "string") {
        if (colorDictionary[colorHue]) {
          var color = colorDictionary[colorHue];
          if (color.hueRange) {
            return color.hueRange;
          }
        } else if (colorHue.match(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i)) {
          var hue = HexToHSB(colorHue)[0];
          return getColorInfo(hue).hueRange;
        }
      }
      return [0, 360];
    }
    return randomColor2;
  });
})(randomColor$1, randomColor$1.exports);
var randomColor = randomColor$1.exports;
class Logger {
  constructor(kind = "NetlessApp", debug = "error") {
    __publicField(this, "kind");
    __publicField(this, "debug");
    __publicField(this, "color", randomColor({ luminosity: "dark" }));
    this.kind = kind;
    this.debug = debug;
  }
  log(...messages) {
    if (this.debug === true || this.debug === "log") {
      return this._log("log", messages);
    }
  }
  warn(...messages) {
    if (this.debug && this.debug !== "error") {
      return this._log("warn", messages);
    }
  }
  error(...messages) {
    if (this.debug) {
      return this._log("error", messages);
    }
  }
  _log(type, messages) {
    console[type](`%c[${this.kind}]:`, `color: ${this.color}; font-weight: bold;`, ...messages);
  }
}
function getUserPayload(context) {
  var _a;
  const room = context.getRoom();
  const displayer = context.getDisplayer();
  const memberId = displayer.observerId;
  const userPayload = (_a = displayer.state.roomMembers.find(
    (member) => member.memberId === memberId
  )) == null ? void 0 : _a.payload;
  const uid = (userPayload == null ? void 0 : userPayload.uid) || (room == null ? void 0 : room.uid) || "";
  const nickName = (userPayload == null ? void 0 : userPayload.nickName) || uid;
  const userId = (userPayload == null ? void 0 : userPayload.userId) || uid;
  const cursorName = (userPayload == null ? void 0 : userPayload.cursorName) || nickName || "";
  return { memberId, uid, userId, nickName, cursorName };
}
function parse(url) {
  const index = url.indexOf("?", 1);
  if (index !== -1) {
    return {
      search: url.slice(index),
      pathname: url.slice(0, index)
    };
  }
  return {
    search: "",
    pathname: url
  };
}
function appendQuery(url, query) {
  const { pathname, search } = parse(url);
  return pathname + (search ? `${search}&` : "?") + query;
}
function element(tag) {
  return document.createElement(tag);
}
function attr(el, key, value) {
  if (value == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
}
function append(el, node) {
  return el.appendChild(node);
}
function detach(el) {
  var _a;
  return (_a = el.parentNode) == null ? void 0 : _a.removeChild(el);
}
const nextTick = /* @__PURE__ */ Promise.resolve();
function writable(value) {
  const listeners = [];
  return {
    get value() {
      return value;
    },
    set(newValue) {
      value = newValue;
      listeners.forEach((listener) => listener(value));
    },
    subscribe(listener) {
      listeners.push(listener);
      nextTick.then(() => listener(value));
      return () => {
        listeners.splice(listeners.indexOf(listener), 1);
      };
    }
  };
}
var resizeObservers = [];
var hasActiveObservations = function() {
  return resizeObservers.some(function(ro) {
    return ro.activeTargets.length > 0;
  });
};
var hasSkippedObservations = function() {
  return resizeObservers.some(function(ro) {
    return ro.skippedTargets.length > 0;
  });
};
var msg = "ResizeObserver loop completed with undelivered notifications.";
var deliverResizeLoopError = function() {
  var event;
  if (typeof ErrorEvent === "function") {
    event = new ErrorEvent("error", {
      message: msg
    });
  } else {
    event = document.createEvent("Event");
    event.initEvent("error", false, false);
    event.message = msg;
  }
  window.dispatchEvent(event);
};
var ResizeObserverBoxOptions;
(function(ResizeObserverBoxOptions2) {
  ResizeObserverBoxOptions2["BORDER_BOX"] = "border-box";
  ResizeObserverBoxOptions2["CONTENT_BOX"] = "content-box";
  ResizeObserverBoxOptions2["DEVICE_PIXEL_CONTENT_BOX"] = "device-pixel-content-box";
})(ResizeObserverBoxOptions || (ResizeObserverBoxOptions = {}));
var freeze = function(obj) {
  return Object.freeze(obj);
};
var ResizeObserverSize = function() {
  function ResizeObserverSize2(inlineSize, blockSize) {
    this.inlineSize = inlineSize;
    this.blockSize = blockSize;
    freeze(this);
  }
  return ResizeObserverSize2;
}();
var DOMRectReadOnly = function() {
  function DOMRectReadOnly2(x, y, width, height2) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height2;
    this.top = this.y;
    this.left = this.x;
    this.bottom = this.top + this.height;
    this.right = this.left + this.width;
    return freeze(this);
  }
  DOMRectReadOnly2.prototype.toJSON = function() {
    var _a = this, x = _a.x, y = _a.y, top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left, width = _a.width, height2 = _a.height;
    return { x, y, top, right, bottom, left, width, height: height2 };
  };
  DOMRectReadOnly2.fromRect = function(rectangle) {
    return new DOMRectReadOnly2(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  };
  return DOMRectReadOnly2;
}();
var isSVG = function(target) {
  return target instanceof SVGElement && "getBBox" in target;
};
var isHidden = function(target) {
  if (isSVG(target)) {
    var _a = target.getBBox(), width = _a.width, height2 = _a.height;
    return !width && !height2;
  }
  var _b = target, offsetWidth = _b.offsetWidth, offsetHeight = _b.offsetHeight;
  return !(offsetWidth || offsetHeight || target.getClientRects().length);
};
var isElement = function(obj) {
  var _a;
  if (obj instanceof Element) {
    return true;
  }
  var scope = (_a = obj === null || obj === void 0 ? void 0 : obj.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView;
  return !!(scope && obj instanceof scope.Element);
};
var isReplacedElement = function(target) {
  switch (target.tagName) {
    case "INPUT":
      if (target.type !== "image") {
        break;
      }
    case "VIDEO":
    case "AUDIO":
    case "EMBED":
    case "OBJECT":
    case "CANVAS":
    case "IFRAME":
    case "IMG":
      return true;
  }
  return false;
};
var global$1 = typeof window !== "undefined" ? window : {};
var cache = /* @__PURE__ */ new WeakMap();
var scrollRegexp = /auto|scroll/;
var verticalRegexp = /^tb|vertical/;
var IE = /msie|trident/i.test(global$1.navigator && global$1.navigator.userAgent);
var parseDimension = function(pixel) {
  return parseFloat(pixel || "0");
};
var size = function(inlineSize, blockSize, switchSizes) {
  if (inlineSize === void 0) {
    inlineSize = 0;
  }
  if (blockSize === void 0) {
    blockSize = 0;
  }
  if (switchSizes === void 0) {
    switchSizes = false;
  }
  return new ResizeObserverSize((switchSizes ? blockSize : inlineSize) || 0, (switchSizes ? inlineSize : blockSize) || 0);
};
var zeroBoxes = freeze({
  devicePixelContentBoxSize: size(),
  borderBoxSize: size(),
  contentBoxSize: size(),
  contentRect: new DOMRectReadOnly(0, 0, 0, 0)
});
var calculateBoxSizes = function(target, forceRecalculation) {
  if (forceRecalculation === void 0) {
    forceRecalculation = false;
  }
  if (cache.has(target) && !forceRecalculation) {
    return cache.get(target);
  }
  if (isHidden(target)) {
    cache.set(target, zeroBoxes);
    return zeroBoxes;
  }
  var cs = getComputedStyle(target);
  var svg = isSVG(target) && target.ownerSVGElement && target.getBBox();
  var removePadding = !IE && cs.boxSizing === "border-box";
  var switchSizes = verticalRegexp.test(cs.writingMode || "");
  var canScrollVertically = !svg && scrollRegexp.test(cs.overflowY || "");
  var canScrollHorizontally = !svg && scrollRegexp.test(cs.overflowX || "");
  var paddingTop = svg ? 0 : parseDimension(cs.paddingTop);
  var paddingRight = svg ? 0 : parseDimension(cs.paddingRight);
  var paddingBottom = svg ? 0 : parseDimension(cs.paddingBottom);
  var paddingLeft = svg ? 0 : parseDimension(cs.paddingLeft);
  var borderTop = svg ? 0 : parseDimension(cs.borderTopWidth);
  var borderRight = svg ? 0 : parseDimension(cs.borderRightWidth);
  var borderBottom = svg ? 0 : parseDimension(cs.borderBottomWidth);
  var borderLeft = svg ? 0 : parseDimension(cs.borderLeftWidth);
  var horizontalPadding = paddingLeft + paddingRight;
  var verticalPadding = paddingTop + paddingBottom;
  var horizontalBorderArea = borderLeft + borderRight;
  var verticalBorderArea = borderTop + borderBottom;
  var horizontalScrollbarThickness = !canScrollHorizontally ? 0 : target.offsetHeight - verticalBorderArea - target.clientHeight;
  var verticalScrollbarThickness = !canScrollVertically ? 0 : target.offsetWidth - horizontalBorderArea - target.clientWidth;
  var widthReduction = removePadding ? horizontalPadding + horizontalBorderArea : 0;
  var heightReduction = removePadding ? verticalPadding + verticalBorderArea : 0;
  var contentWidth = svg ? svg.width : parseDimension(cs.width) - widthReduction - verticalScrollbarThickness;
  var contentHeight = svg ? svg.height : parseDimension(cs.height) - heightReduction - horizontalScrollbarThickness;
  var borderBoxWidth = contentWidth + horizontalPadding + verticalScrollbarThickness + horizontalBorderArea;
  var borderBoxHeight = contentHeight + verticalPadding + horizontalScrollbarThickness + verticalBorderArea;
  var boxes = freeze({
    devicePixelContentBoxSize: size(Math.round(contentWidth * devicePixelRatio), Math.round(contentHeight * devicePixelRatio), switchSizes),
    borderBoxSize: size(borderBoxWidth, borderBoxHeight, switchSizes),
    contentBoxSize: size(contentWidth, contentHeight, switchSizes),
    contentRect: new DOMRectReadOnly(paddingLeft, paddingTop, contentWidth, contentHeight)
  });
  cache.set(target, boxes);
  return boxes;
};
var calculateBoxSize = function(target, observedBox, forceRecalculation) {
  var _a = calculateBoxSizes(target, forceRecalculation), borderBoxSize = _a.borderBoxSize, contentBoxSize = _a.contentBoxSize, devicePixelContentBoxSize = _a.devicePixelContentBoxSize;
  switch (observedBox) {
    case ResizeObserverBoxOptions.DEVICE_PIXEL_CONTENT_BOX:
      return devicePixelContentBoxSize;
    case ResizeObserverBoxOptions.BORDER_BOX:
      return borderBoxSize;
    default:
      return contentBoxSize;
  }
};
var ResizeObserverEntry = function() {
  function ResizeObserverEntry2(target) {
    var boxes = calculateBoxSizes(target);
    this.target = target;
    this.contentRect = boxes.contentRect;
    this.borderBoxSize = freeze([boxes.borderBoxSize]);
    this.contentBoxSize = freeze([boxes.contentBoxSize]);
    this.devicePixelContentBoxSize = freeze([boxes.devicePixelContentBoxSize]);
  }
  return ResizeObserverEntry2;
}();
var calculateDepthForNode = function(node) {
  if (isHidden(node)) {
    return Infinity;
  }
  var depth = 0;
  var parent = node.parentNode;
  while (parent) {
    depth += 1;
    parent = parent.parentNode;
  }
  return depth;
};
var broadcastActiveObservations = function() {
  var shallowestDepth = Infinity;
  var callbacks2 = [];
  resizeObservers.forEach(function processObserver(ro) {
    if (ro.activeTargets.length === 0) {
      return;
    }
    var entries = [];
    ro.activeTargets.forEach(function processTarget(ot) {
      var entry = new ResizeObserverEntry(ot.target);
      var targetDepth = calculateDepthForNode(ot.target);
      entries.push(entry);
      ot.lastReportedSize = calculateBoxSize(ot.target, ot.observedBox);
      if (targetDepth < shallowestDepth) {
        shallowestDepth = targetDepth;
      }
    });
    callbacks2.push(function resizeObserverCallback() {
      ro.callback.call(ro.observer, entries, ro.observer);
    });
    ro.activeTargets.splice(0, ro.activeTargets.length);
  });
  for (var _i = 0, callbacks_1 = callbacks2; _i < callbacks_1.length; _i++) {
    var callback = callbacks_1[_i];
    callback();
  }
  return shallowestDepth;
};
var gatherActiveObservationsAtDepth = function(depth) {
  resizeObservers.forEach(function processObserver(ro) {
    ro.activeTargets.splice(0, ro.activeTargets.length);
    ro.skippedTargets.splice(0, ro.skippedTargets.length);
    ro.observationTargets.forEach(function processTarget(ot) {
      if (ot.isActive()) {
        if (calculateDepthForNode(ot.target) > depth) {
          ro.activeTargets.push(ot);
        } else {
          ro.skippedTargets.push(ot);
        }
      }
    });
  });
};
var process = function() {
  var depth = 0;
  gatherActiveObservationsAtDepth(depth);
  while (hasActiveObservations()) {
    depth = broadcastActiveObservations();
    gatherActiveObservationsAtDepth(depth);
  }
  if (hasSkippedObservations()) {
    deliverResizeLoopError();
  }
  return depth > 0;
};
var trigger;
var callbacks = [];
var notify = function() {
  return callbacks.splice(0).forEach(function(cb) {
    return cb();
  });
};
var queueMicroTask = function(callback) {
  if (!trigger) {
    var toggle_1 = 0;
    var el_1 = document.createTextNode("");
    var config = { characterData: true };
    new MutationObserver(function() {
      return notify();
    }).observe(el_1, config);
    trigger = function() {
      el_1.textContent = "".concat(toggle_1 ? toggle_1-- : toggle_1++);
    };
  }
  callbacks.push(callback);
  trigger();
};
var queueResizeObserver = function(cb) {
  queueMicroTask(function ResizeObserver2() {
    requestAnimationFrame(cb);
  });
};
var watching = 0;
var isWatching = function() {
  return !!watching;
};
var CATCH_PERIOD = 250;
var observerConfig = { attributes: true, characterData: true, childList: true, subtree: true };
var events = [
  "resize",
  "load",
  "transitionend",
  "animationend",
  "animationstart",
  "animationiteration",
  "keyup",
  "keydown",
  "mouseup",
  "mousedown",
  "mouseover",
  "mouseout",
  "blur",
  "focus"
];
var time = function(timeout) {
  if (timeout === void 0) {
    timeout = 0;
  }
  return Date.now() + timeout;
};
var scheduled = false;
var Scheduler = function() {
  function Scheduler2() {
    var _this = this;
    this.stopped = true;
    this.listener = function() {
      return _this.schedule();
    };
  }
  Scheduler2.prototype.run = function(timeout) {
    var _this = this;
    if (timeout === void 0) {
      timeout = CATCH_PERIOD;
    }
    if (scheduled) {
      return;
    }
    scheduled = true;
    var until = time(timeout);
    queueResizeObserver(function() {
      var elementsHaveResized = false;
      try {
        elementsHaveResized = process();
      } finally {
        scheduled = false;
        timeout = until - time();
        if (!isWatching()) {
          return;
        }
        if (elementsHaveResized) {
          _this.run(1e3);
        } else if (timeout > 0) {
          _this.run(timeout);
        } else {
          _this.start();
        }
      }
    });
  };
  Scheduler2.prototype.schedule = function() {
    this.stop();
    this.run();
  };
  Scheduler2.prototype.observe = function() {
    var _this = this;
    var cb = function() {
      return _this.observer && _this.observer.observe(document.body, observerConfig);
    };
    document.body ? cb() : global$1.addEventListener("DOMContentLoaded", cb);
  };
  Scheduler2.prototype.start = function() {
    var _this = this;
    if (this.stopped) {
      this.stopped = false;
      this.observer = new MutationObserver(this.listener);
      this.observe();
      events.forEach(function(name) {
        return global$1.addEventListener(name, _this.listener, true);
      });
    }
  };
  Scheduler2.prototype.stop = function() {
    var _this = this;
    if (!this.stopped) {
      this.observer && this.observer.disconnect();
      events.forEach(function(name) {
        return global$1.removeEventListener(name, _this.listener, true);
      });
      this.stopped = true;
    }
  };
  return Scheduler2;
}();
var scheduler = new Scheduler();
var updateCount = function(n) {
  !watching && n > 0 && scheduler.start();
  watching += n;
  !watching && scheduler.stop();
};
var skipNotifyOnElement = function(target) {
  return !isSVG(target) && !isReplacedElement(target) && getComputedStyle(target).display === "inline";
};
var ResizeObservation = function() {
  function ResizeObservation2(target, observedBox) {
    this.target = target;
    this.observedBox = observedBox || ResizeObserverBoxOptions.CONTENT_BOX;
    this.lastReportedSize = {
      inlineSize: 0,
      blockSize: 0
    };
  }
  ResizeObservation2.prototype.isActive = function() {
    var size2 = calculateBoxSize(this.target, this.observedBox, true);
    if (skipNotifyOnElement(this.target)) {
      this.lastReportedSize = size2;
    }
    if (this.lastReportedSize.inlineSize !== size2.inlineSize || this.lastReportedSize.blockSize !== size2.blockSize) {
      return true;
    }
    return false;
  };
  return ResizeObservation2;
}();
var ResizeObserverDetail = function() {
  function ResizeObserverDetail2(resizeObserver, callback) {
    this.activeTargets = [];
    this.skippedTargets = [];
    this.observationTargets = [];
    this.observer = resizeObserver;
    this.callback = callback;
  }
  return ResizeObserverDetail2;
}();
var observerMap = /* @__PURE__ */ new WeakMap();
var getObservationIndex = function(observationTargets, target) {
  for (var i = 0; i < observationTargets.length; i += 1) {
    if (observationTargets[i].target === target) {
      return i;
    }
  }
  return -1;
};
var ResizeObserverController = function() {
  function ResizeObserverController2() {
  }
  ResizeObserverController2.connect = function(resizeObserver, callback) {
    var detail = new ResizeObserverDetail(resizeObserver, callback);
    observerMap.set(resizeObserver, detail);
  };
  ResizeObserverController2.observe = function(resizeObserver, target, options) {
    var detail = observerMap.get(resizeObserver);
    var firstObservation = detail.observationTargets.length === 0;
    if (getObservationIndex(detail.observationTargets, target) < 0) {
      firstObservation && resizeObservers.push(detail);
      detail.observationTargets.push(new ResizeObservation(target, options && options.box));
      updateCount(1);
      scheduler.schedule();
    }
  };
  ResizeObserverController2.unobserve = function(resizeObserver, target) {
    var detail = observerMap.get(resizeObserver);
    var index = getObservationIndex(detail.observationTargets, target);
    var lastObservation = detail.observationTargets.length === 1;
    if (index >= 0) {
      lastObservation && resizeObservers.splice(resizeObservers.indexOf(detail), 1);
      detail.observationTargets.splice(index, 1);
      updateCount(-1);
    }
  };
  ResizeObserverController2.disconnect = function(resizeObserver) {
    var _this = this;
    var detail = observerMap.get(resizeObserver);
    detail.observationTargets.slice().forEach(function(ot) {
      return _this.unobserve(resizeObserver, ot.target);
    });
    detail.activeTargets.splice(0, detail.activeTargets.length);
  };
  return ResizeObserverController2;
}();
var ResizeObserver$2 = function() {
  function ResizeObserver2(callback) {
    if (arguments.length === 0) {
      throw new TypeError("Failed to construct 'ResizeObserver': 1 argument required, but only 0 present.");
    }
    if (typeof callback !== "function") {
      throw new TypeError("Failed to construct 'ResizeObserver': The callback provided as parameter 1 is not a function.");
    }
    ResizeObserverController.connect(this, callback);
  }
  ResizeObserver2.prototype.observe = function(target, options) {
    if (arguments.length === 0) {
      throw new TypeError("Failed to execute 'observe' on 'ResizeObserver': 1 argument required, but only 0 present.");
    }
    if (!isElement(target)) {
      throw new TypeError("Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element");
    }
    ResizeObserverController.observe(this, target, options);
  };
  ResizeObserver2.prototype.unobserve = function(target) {
    if (arguments.length === 0) {
      throw new TypeError("Failed to execute 'unobserve' on 'ResizeObserver': 1 argument required, but only 0 present.");
    }
    if (!isElement(target)) {
      throw new TypeError("Failed to execute 'unobserve' on 'ResizeObserver': parameter 1 is not of type 'Element");
    }
    ResizeObserverController.unobserve(this, target);
  };
  ResizeObserver2.prototype.disconnect = function() {
    ResizeObserverController.disconnect(this);
  };
  ResizeObserver2.toString = function() {
    return "function ResizeObserver () { [polyfill code] }";
  };
  return ResizeObserver2;
}();
var styles = ".app-talkative-container{width:100%;height:100%;overflow:hidden;display:flex;justify-content:center;align-items:center;flex-direction:column}.app-talkative-container iframe{width:100%;height:100%;border:none;display:block}.app-talkative-footer{box-sizing:border-box;height:40px;display:flex;align-items:center;padding:0 16px;color:#191919;background:#ebecfa;justify-content:center}.app-talkative-footer>span{font-size:14px;color:#8d8fa6;user-select:none;white-space:nowrap;word-break:keep-all}.app-talkative-page{font-variant-numeric:tabular-nums}.app-talkative-btn{box-sizing:border-box;width:26px;height:26px;font-size:0;margin:0;padding:3px;border:none;border-radius:4px;outline:none;color:currentColor;background:transparent;transition:background .4s;cursor:pointer;user-select:none;-webkit-tap-highlight-color:rgba(0,0,0,0);color:#8d8fa6}.app-talkative-btn:hover{background-color:#1b1f4d0a}@media (hover: none){.app-talkative-btn:hover{background:transparent!important}}.app-talkative-btn .arrow{fill:#8d8fa6}.app-talkative-btn>svg{width:100%;height:100%}.app-talkative-btn>svg:nth-of-type(2){display:none}.app-talkative-footer-btn-disable{color:#c6c7d2;cursor:not-allowed}.app-talkative-footer-btn-disable .arrow{fill:#c6c7d2}.telebox-color-scheme-dark .app-talkative-container{color:#eee}\n";
const ResizeObserver$1 = window.ResizeObserver || ResizeObserver$2;
class Renderer {
  constructor(context) {
    this.context = context;
    this.sideEffect = new SideEffectManager();
    this.role = writable(2);
    this.ratio = writable(16 / 9);
    this.$content = element("div");
    this.$iframe = element("iframe");
    this.box = context.getBox();
    attr(this.$content, "class", "app-talkative-container");
    append(this.$content, this.$iframe);
    this.$content.dataset.appKind = "Talkative";
  }
  _on_update_role(role) {
    this.$content.dataset.role = String(role);
    this.$content.classList.toggle("owner", role === 0);
  }
  _on_update_ratio(ratio, entry) {
    const { width, height: height2 } = entry ? entry.contentRect : this.$content.getBoundingClientRect();
    if (width / ratio > height2) {
      this.$iframe.style.height = "";
    } else if (width / ratio < height2) {
      this.$iframe.style.width = "";
    }
  }
  _observe_content_resize() {
    const observer = new ResizeObserver$1((entries) => {
      this._on_update_ratio(this.ratio.value, entries[0]);
    });
    observer.observe(this.$content);
    return observer.disconnect.bind(observer);
  }
  mount() {
    this.box.mountStyles(styles);
    this.box.mountContent(this.$content);
    this.sideEffect.addDisposer(this.role.subscribe(this._on_update_role.bind(this)));
    this.sideEffect.addDisposer(this.ratio.subscribe(this._on_update_ratio.bind(this)));
    this.sideEffect.addDisposer(this._observe_content_resize());
    return this.destroy.bind(this);
  }
  destroy() {
    this.sideEffect.flushAll();
    detach(this.$content);
  }
  postMessage(message) {
    var _a;
    console.log(message);
    (_a = this.$iframe.contentWindow) == null ? void 0 : _a.postMessage(message, "*");
  }
}
function arrowLeftSVG(namespace) {
  const NS = "http://www.w3.org/2000/svg";
  const $svg = document.createElementNS(NS, "svg");
  $svg.setAttribute("class", `${namespace}-footer-icon-arrow-left`);
  $svg.setAttribute("viewBox", "0 0 20 20");
  $svg.innerHTML = `<g clip-path="url(#clip0_11800_99864)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M11.5283 4.86182L12.4711 5.80463L8.22849 10.0473L12.4711 14.2899L11.5283 15.2327L6.34287 10.0473L11.5283 4.86182Z" class="arrow" />
</g>
<defs>
<clipPath id="clip0_11800_99864">
<rect width="16" height="16" fill="white" transform="translate(2 2)"/>
</clipPath>
</defs>`;
  return $svg;
}
function arrowRightSVG(namespace) {
  const NS = "http://www.w3.org/2000/svg";
  const $svg = document.createElementNS(NS, "svg");
  $svg.setAttribute("class", `${namespace}-footer-icon-arrow-right`);
  $svg.setAttribute("viewBox", "0 0 20 20");
  $svg.innerHTML = `<g clip-path="url(#clip0_11800_99870)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.1377 4.86182L7.19489 5.80463L11.4375 10.0473L7.19489 14.2899L8.1377 15.2327L13.3231 10.0473L8.1377 4.86182Z" class="arrow" />
</g>
<defs>
<clipPath id="clip0_11800_99870">
<rect width="16" height="16" fill="white" transform="translate(2 2)"/>
</clipPath>
</defs>`;
  return $svg;
}
class Footer {
  constructor(context, onPrev, onNext) {
    this.context = context;
    this.onPrev = onPrev;
    this.onNext = onNext;
    this.sideEffect = new SideEffectManager();
    this.role = writable(2);
    this.text = writable("...");
    this.$footer = element("div");
    this.$btnLeft = element("button");
    this.$btnRight = element("button");
    this.$span = element("span");
    this.box = context.getBox();
    append(this.$footer, this.$btnLeft);
    append(this.$footer, this.$span);
    append(this.$footer, this.$btnRight);
    attr(this.$footer, "class", "app-talkative-footer");
    attr(this.$btnLeft, "class", "app-talkative-btn app-talkative-btn-left");
    attr(this.$btnRight, "class", "app-talkative-btn app-talkative-btn-right");
    attr(this.$span, "class", "app-talkative-page");
    this.$btnLeft.appendChild(arrowLeftSVG("app-talkative"));
    this.$btnRight.appendChild(arrowRightSVG("app-talkative"));
    this.$btnLeft.addEventListener("click", this.onPrev);
    this.$btnRight.addEventListener("click", this.onNext);
  }
  _on_update_role(role) {
    this.$btnLeft.disabled = role === 2;
    this.$btnRight.disabled = role === 2;
    this.$footer.classList.toggle("owner", role === 0);
  }
  _on_update_text(text) {
    this.$span.textContent = text;
  }
  mount() {
    this.box.mountFooter(this.$footer);
    this.sideEffect.addDisposer(this.role.subscribe(this._on_update_role.bind(this)));
    this.sideEffect.addDisposer(this.text.subscribe(this._on_update_text.bind(this)));
    return this.destroy.bind(this);
  }
  destroy() {
    this.sideEffect.flushAll();
    detach(this.$footer);
  }
}
function connect({ context, logger, ...callbacks2 }) {
  const sideEffect = new SideEffectManager();
  const handlers = {
    onPagenum({ totalPages }) {
      if (context.getIsWritable() && totalPages) {
        context.storage.setState({ pageNum: totalPages });
      }
    },
    onLoadComplete(data) {
      callbacks2.onRatioChanged(data.coursewareRatio);
      if (context.getIsWritable() && data.totalPages) {
        context.storage.setState({ pageNum: data.totalPages });
      }
      const { page, lastMsg } = context.storage.state;
      lastMsg && callbacks2.postMessage(lastMsg);
      callbacks2.postMessage(JSON.stringify({ method: "onJumpPage", toPage: page }));
    },
    onLocalMessage(event) {
      if (context.getIsWritable()) {
        (callbacks2 == null ? void 0 : callbacks2.onLocalMessage) && callbacks2.onLocalMessage(context.appId, event);
      }
    },
    onFileMessage(event) {
      if (context.getIsWritable()) {
        context.dispatchMagixEvent("broadcast", JSON.stringify(event));
        const lastMsg = JSON.stringify({ ...event, isRestore: true });
        context.storage.setState({ lastMsg });
      }
    }
  };
  sideEffect.addDisposer(
    context.addMagixEventListener("broadcast", ({ payload }) => {
      console.log(payload);
      callbacks2.postMessage(payload);
    })
  );
  sideEffect.addEventListener(window, "message", (ev) => {
    if (!callbacks2.isSentBySelf(ev.source))
      return;
    if (typeof ev.data === "string") {
      try {
        const event = JSON.parse(ev.data);
        if (typeof event === "object" && event !== null) {
          const handler = handlers[event.method];
          if (handler) {
            handler(event);
          } else {
            logger.warn("unknown message", event);
          }
        }
      } catch (error) {
        logger.warn("error when parsing message", error);
      }
    } else if (typeof ev.data === "object" && ev.data !== null) {
      logger.log("unhandled permission command", ev.data);
    }
  });
  return sideEffect.flushAll.bind(sideEffect);
}
const height = 350;
const Talkative = {
  kind: "Talkative",
  setup(context) {
    context.storage.ensureState({
      src: "https://example.org",
      uid: "",
      page: 1,
      pageNum: 1,
      lastMsg: ""
    });
    const ClickThroughAppliances = /* @__PURE__ */ new Set(["clicker"]);
    const { onLocalMessage, debug, setReceivePostMessageFun } = context.getAppOptions() || {};
    const logger = new Logger("Talkative", debug);
    const { uid, userId, nickName, cursorName } = getUserPayload(context);
    const sideEffect = new SideEffectManager();
    const view = context.getView();
    const room = context.getRoom();
    logger.log("my uid", uid);
    let toggleClickThrough = () => {
    };
    const shouldClickThrough = (tool) => {
      return ClickThroughAppliances.has(tool);
    };
    const setPage = (page) => {
      if (!view) {
        logger.warn("SetPage: page api is only available with 'scenePath' options enabled.");
      } else {
        const scenePath = context.getInitScenePath();
        if (typeof page === "string" && context.getIsWritable() && scenePath && room) {
          const fullScenePath = [scenePath, page].join("/");
          if (room.scenePathType(fullScenePath) === "none") {
            room.putScenes(scenePath, [{ name: page }]);
          }
          context.setScenePath(fullScenePath);
          context.updateAttributes(["page"], page);
        }
      }
    };
    const onPrevPage = () => {
      const { page } = context.storage.state;
      if (context.getIsWritable() && page > 1) {
        context.storage.setState({ page: page - 1 });
      }
    };
    const onNextPage = () => {
      const { page, pageNum } = context.storage.state;
      if (context.getIsWritable() && page < pageNum) {
        context.storage.setState({ page: page + 1 });
      }
    };
    const renderer = new Renderer(context);
    const footer = new Footer(context, onPrevPage, onNextPage);
    const postMessage = renderer.postMessage.bind(renderer);
    setReceivePostMessageFun == null ? void 0 : setReceivePostMessageFun(postMessage);
    sideEffect.addDisposer(
      connect({
        context,
        logger,
        postMessage,
        onRatioChanged: renderer.ratio.set.bind(renderer.ratio),
        isSentBySelf: (source) => source === renderer.$iframe.contentWindow,
        onLocalMessage
      })
    );
    sideEffect.addDisposer(
      context.storage.addStateChangedListener(() => {
        const role = context.storage.state.uid === uid ? 0 : 2;
        renderer.role.set(role);
        footer.role.set(role);
        const { page, pageNum } = context.storage.state;
        postMessage(JSON.stringify({ method: "onJumpPage", toPage: page }));
        footer.text.set(`${page}/${pageNum}`);
      })
    );
    if (room) {
      sideEffect.add(() => {
        const onRoomStateChanged = (e) => {
          if (e.memberState) {
            toggleClickThrough(shouldClickThrough(e.memberState.currentApplianceName));
          }
        };
        room.callbacks.on("onRoomStateChanged", onRoomStateChanged);
        return () => room.callbacks.off("onRoomStateChanged", onRoomStateChanged);
      });
    }
    const on_ready = () => {
      sideEffect.addDisposer(renderer.mount());
      sideEffect.addDisposer(footer.mount());
      const role = context.storage.state.uid === uid ? 0 : 2;
      const query = `userid=${userId}&role=${role}&name=${(cursorName == null ? void 0 : cursorName.length) > 0 ? cursorName : nickName}`;
      renderer.$iframe.src = appendQuery(context.storage.state.src, query);
      renderer.role.set(role);
      footer.role.set(role);
      const { page, pageNum } = context.storage.state;
      footer.text.set(`${page}/${pageNum}`);
      setPage(`${page}`);
      if (view) {
        const viewBox = document.createElement("div");
        Object.assign(viewBox.style, {
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          overflow: "hidden"
        });
        renderer.$content.appendChild(viewBox);
        context.mountView(viewBox);
        view.disableCameraTransform = true;
        sideEffect.add(() => {
          const onResize = () => {
            const clientRect = renderer.$content.getBoundingClientRect();
            const scale = clientRect.height / height;
            view.moveCamera({ scale, animationMode: "immediately" });
          };
          const observer = new ResizeObserver(onResize);
          observer.observe(renderer.$content);
          return () => observer.disconnect();
        });
        toggleClickThrough = (enable) => {
          viewBox.style.pointerEvents = enable ? "none" : "auto";
        };
        if (room == null ? void 0 : room.state.memberState.currentApplianceName) {
          toggleClickThrough(shouldClickThrough(room == null ? void 0 : room.state.memberState.currentApplianceName));
        }
      }
    };
    if (!context.storage.state.uid) {
      const disposerID = sideEffect.addDisposer(
        context.storage.addStateChangedListener(() => {
          if (context.storage.state.uid) {
            sideEffect.flush(disposerID);
            on_ready();
          }
        })
      );
      if (context.isAddApp) {
        logger.log("no teacher's uid, setting myself...");
        context.storage.setState({ uid });
      }
    } else {
      nextTick.then(on_ready);
    }
    context.emitter.on("destroy", () => {
      logger.log("destroy");
      sideEffect.flushAll();
    });
  }
};
export { Talkative as default };
//# sourceMappingURL=main.es.js.map
