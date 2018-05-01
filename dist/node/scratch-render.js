module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// object with all compiled WebAssembly.Modules
/******/ 	__webpack_require__.w = {};
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 26);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("twgl.js");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/** @module RenderConstants */

/**
 * Various constants meant for use throughout the renderer.
 * @enum
 */
module.exports = {
  /**
   * The ID value to use for "no item" or when an object has been disposed.
   * @const {int}
   */
  ID_NONE: -1,

  /**
   * Optimize for fewer than this number of Drawables sharing the same Skin.
   * Going above this may cause middleware warnings or a performance penalty but should otherwise behave correctly.
   * @const {int}
   */
  SKIN_SHARE_SOFT_LIMIT: 301,

  /**
   * @enum {string}
   */
  Events: {
    /**
     * NativeSizeChanged event
     *
     * @event RenderWebGL#event:NativeSizeChanged
     * @type {object}
     * @property {Array<int>} newSize - the new size of the renderer
     */
    NativeSizeChanged: 'NativeSizeChanged'
  }
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = __webpack_require__(8);

var twgl = __webpack_require__(0);

var RenderConstants = __webpack_require__(1);

/**
 * Truncate a number into what could be stored in a 32 bit floating point value.
 * @param {number} num Number to truncate.
 * @return {number} Truncated value.
 */
var toFloat32 = function () {
    var memory = new Float32Array(1);
    return function (num) {
        memory[0] = num;
        return memory[0];
    };
}();

var Skin = function (_EventEmitter) {
    _inherits(Skin, _EventEmitter);

    /**
     * Create a Skin, which stores and/or generates textures for use in rendering.
     * @param {int} id - The unique ID for this Skin.
     * @constructor
     */
    function Skin(id) {
        _classCallCheck(this, Skin);

        /** @type {int} */
        var _this = _possibleConstructorReturn(this, (Skin.__proto__ || Object.getPrototypeOf(Skin)).call(this));

        _this._id = id;

        /** @type {Vec3} */
        _this._rotationCenter = twgl.v3.create(0, 0);

        /**
         * The uniforms to be used by the vertex and pixel shaders.
         * Some of these are used by other parts of the renderer as well.
         * @type {Object.<string,*>}
         * @private
         */
        _this._uniforms = {
            /**
             * The nominal (not necessarily current) size of the current skin.
             * @type {Array<number>}
             */
            u_skinSize: [0, 0],

            /**
             * The actual WebGL texture object for the skin.
             * @type {WebGLTexture}
             */
            u_skin: null
        };

        _this.setMaxListeners(RenderConstants.SKIN_SHARE_SOFT_LIMIT);
        return _this;
    }

    /**
     * Dispose of this object. Do not use it after calling this method.
     */


    _createClass(Skin, [{
        key: 'dispose',
        value: function dispose() {
            this._id = RenderConstants.ID_NONE;
        }

        /**
         * @returns {boolean} true for a raster-style skin (like a BitmapSkin), false for vector-style (like SVGSkin).
         */

    }, {
        key: 'setRotationCenter',


        /**
         * Set the origin, in object space, about which this Skin should rotate.
         * @param {number} x - The x coordinate of the new rotation center.
         * @param {number} y - The y coordinate of the new rotation center.
         * @fires Skin.event:WasAltered
         */
        value: function setRotationCenter(x, y) {
            var emptySkin = this.size[0] === 0 && this.size[1] === 0;
            // Compare a 32 bit x and y value against the stored 32 bit center
            // values.
            var changed = toFloat32(x) !== this._rotationCenter[0] || toFloat32(y) !== this._rotationCenter[1];
            if (!emptySkin && changed) {
                this._rotationCenter[0] = x;
                this._rotationCenter[1] = y;
                this.emit(Skin.Events.WasAltered);
            }
        }

        /**
         * Get the center of the current bounding box
         * @return {Array<number>} the center of the current bounding box
         */

    }, {
        key: 'calculateRotationCenter',
        value: function calculateRotationCenter() {
            return [this.size[0] / 2, this.size[1] / 2];
        }

        /**
         * @abstract
         * @param {Array<number>} scale - The scaling factors to be used.
         * @return {WebGLTexture} The GL texture representation of this skin when drawing at the given size.
         */
        // eslint-disable-next-line no-unused-vars

    }, {
        key: 'getTexture',
        value: function getTexture(scale) {
            return null;
        }

        /**
         * Update and returns the uniforms for this skin.
         * @param {Array<number>} scale - The scaling factors to be used.
         * @returns {object.<string, *>} the shader uniforms to be used when rendering with this Skin.
         */

    }, {
        key: 'getUniforms',
        value: function getUniforms(scale) {
            this._uniforms.u_skin = this.getTexture(scale);
            this._uniforms.u_skinSize = this.size;
            return this._uniforms;
        }

        /**
         * Does this point touch an opaque or translucent point on this skin?
         * @param {twgl.v3} vec A texture coordinate.
         * @return {boolean} Did it touch?
         */

    }, {
        key: 'isTouching',
        value: function isTouching() {
            return false;
        }
    }, {
        key: 'isRaster',
        get: function get() {
            return false;
        }

        /**
         * @return {int} the unique ID for this Skin.
         */

    }, {
        key: 'id',
        get: function get() {
            return this._id;
        }

        /**
         * @returns {Vec3} the origin, in object space, about which this Skin should rotate.
         */

    }, {
        key: 'rotationCenter',
        get: function get() {
            return this._rotationCenter;
        }

        /**
         * @abstract
         * @return {Array<number>} the "native" size, in texels, of this skin.
         */

    }, {
        key: 'size',
        get: function get() {
            return [0, 0];
        }
    }]);

    return Skin;
}(EventEmitter);

/**
 * These are the events which can be emitted by instances of this class.
 * @enum {string}
 */


Skin.Events = {
    /**
     * Emitted when anything about the Skin has been altered, such as the appearance or rotation center.
     * @event Skin.event:WasAltered
     */
    WasAltered: 'WasAltered'
};

module.exports = Skin;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var twgl = __webpack_require__(0);

var ShaderManager = function () {
    /**
     * @param {WebGLRenderingContext} gl WebGL rendering context to create shaders for
     * @constructor
     */
    function ShaderManager(gl) {
        _classCallCheck(this, ShaderManager);

        this._gl = gl;

        /**
         * The cache of all shaders compiled so far, filled on demand.
         * @type {Object<ShaderManager.DRAW_MODE, Array<ProgramInfo>>}
         * @private
         */
        this._shaderCache = {};
        for (var modeName in ShaderManager.DRAW_MODE) {
            if (ShaderManager.DRAW_MODE.hasOwnProperty(modeName)) {
                this._shaderCache[modeName] = [];
            }
        }
    }

    /**
     * Fetch the shader for a particular set of active effects.
     * Build the shader if necessary.
     * @param {ShaderManager.DRAW_MODE} drawMode Draw normally, silhouette, etc.
     * @param {int} effectBits Bitmask representing the enabled effects.
     * @returns {ProgramInfo} The shader's program info.
     */


    _createClass(ShaderManager, [{
        key: 'getShader',
        value: function getShader(drawMode, effectBits) {
            var cache = this._shaderCache[drawMode];
            if (drawMode === ShaderManager.DRAW_MODE.silhouette) {
                // Silhouette mode isn't affected by these effects.
                effectBits &= ~(ShaderManager.EFFECT_INFO.color.mask | ShaderManager.EFFECT_INFO.brightness.mask);
            }
            var shader = cache[effectBits];
            if (!shader) {
                shader = cache[effectBits] = this._buildShader(drawMode, effectBits);
            }
            return shader;
        }

        /**
         * Build the shader for a particular set of active effects.
         * @param {ShaderManager.DRAW_MODE} drawMode Draw normally, silhouette, etc.
         * @param {int} effectBits Bitmask representing the enabled effects.
         * @returns {ProgramInfo} The new shader's program info.
         * @private
         */

    }, {
        key: '_buildShader',
        value: function _buildShader(drawMode, effectBits) {
            var numEffects = ShaderManager.EFFECTS.length;

            var defines = ['#define DRAW_MODE_' + drawMode];
            for (var index = 0; index < numEffects; ++index) {
                if ((effectBits & 1 << index) !== 0) {
                    defines.push('#define ENABLE_' + ShaderManager.EFFECTS[index]);
                }
            }

            var definesText = defines.join('\n') + '\n';

            /* eslint-disable global-require */
            var vsFullText = definesText + __webpack_require__(21);
            var fsFullText = definesText + __webpack_require__(20);
            /* eslint-enable global-require */

            return twgl.createProgramInfo(this._gl, [vsFullText, fsFullText]);
        }
    }]);

    return ShaderManager;
}();

/**
 * @typedef {object} ShaderManager.Effect
 * @prop {int} mask - The bit in 'effectBits' representing the effect.
 * @prop {function} converter - A conversion function which takes a Scratch value (generally in the range
 *   0..100 or -100..100) and maps it to a value useful to the shader. This
 *   mapping may not be reversible.
 * @prop {boolean} shapeChanges - Whether the effect could change the drawn shape.
 */

/**
 * Mapping of each effect name to info about that effect.
 * @enum {ShaderManager.Effect}
 */


ShaderManager.EFFECT_INFO = {
    /** Color effect */
    color: {
        mask: 1 << 0,
        converter: function converter(x) {
            return x / 200 % 1;
        },
        shapeChanges: false
    },
    /** Fisheye effect */
    fisheye: {
        mask: 1 << 1,
        converter: function converter(x) {
            return Math.max(0, (x + 100) / 100);
        },
        shapeChanges: true
    },
    /** Whirl effect */
    whirl: {
        mask: 1 << 2,
        converter: function converter(x) {
            return -x * Math.PI / 180;
        },
        shapeChanges: true
    },
    /** Pixelate effect */
    pixelate: {
        mask: 1 << 3,
        converter: function converter(x) {
            return Math.abs(x) / 10;
        },
        shapeChanges: true
    },
    /** Mosaic effect */
    mosaic: {
        mask: 1 << 4,
        converter: function converter(x) {
            x = Math.round((Math.abs(x) + 10) / 10);
            /** @todo cap by Math.min(srcWidth, srcHeight) */
            return Math.max(1, Math.min(x, 512));
        },
        shapeChanges: true
    },
    /** Brightness effect */
    brightness: {
        mask: 1 << 5,
        converter: function converter(x) {
            return Math.max(-100, Math.min(x, 100)) / 100;
        },
        shapeChanges: false
    },
    /** Ghost effect */
    ghost: {
        mask: 1 << 6,
        converter: function converter(x) {
            return 1 - Math.max(0, Math.min(x, 100)) / 100;
        },
        shapeChanges: false
    }
};

/**
 * The name of each supported effect.
 * @type {Array}
 */
ShaderManager.EFFECTS = Object.keys(ShaderManager.EFFECT_INFO);

/**
 * The available draw modes.
 * @readonly
 * @enum {string}
 */
ShaderManager.DRAW_MODE = {
    /**
     * Draw normally.
     */
    default: 'default',

    /**
     * Draw a silhouette using a solid color.
     */
    silhouette: 'silhouette',

    /**
     * Draw only the parts of the drawable which match a particular color.
     */
    colorMask: 'colorMask'
};

module.exports = ShaderManager;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileoverview
 * A representation of a Skin's silhouette that can test if a point on the skin
 * renders a pixel where it is drawn.
 */

/**
 * <canvas> element used to update Silhouette data from skin bitmap data.
 * @type {CanvasElement}
 */
var __SilhouetteUpdateCanvas = void 0;

var Silhouette = function () {
  function Silhouette() {
    _classCallCheck(this, Silhouette);

    /**
     * The width of the data representing the current skin data.
     * @type {number}
     */
    this._width = 0;

    /**
     * The height of the data representing the current skin date.
     * @type {number}
     */
    this._height = 0;

    /**
     * The data representing a skin's silhouette shape.
     * @type {Uint8ClampedArray}
     */
    this._data = null;
  }

  /**
   * Update this silhouette with the bitmapData for a skin.
   * @param {*} bitmapData An image, canvas or other element that the skin
   * rendering can be queried from.
   */


  _createClass(Silhouette, [{
    key: 'update',
    value: function update(bitmapData) {
      var canvas = Silhouette._updateCanvas();
      var width = this._width = canvas.width = bitmapData.width;
      var height = this._height = canvas.height = bitmapData.height;
      var ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(bitmapData, 0, 0, width, height);
      var imageData = ctx.getImageData(0, 0, width, height);

      this._data = new Uint8ClampedArray(imageData.data.length / 4);

      for (var i = 0; i < imageData.data.length; i += 4) {
        this._data[i / 4] = imageData.data[i + 3];
      }
    }

    /**
     * Does this point touch the silhouette?
     * @param {twgl.v3} vec A texture coordinate.
     * @return {boolean} Did the point touch?
     */

  }, {
    key: 'isTouching',
    value: function isTouching(vec) {
      var x = Math.floor(vec[0] * this._width);
      var y = Math.floor(vec[1] * this._height);
      return x < this._width && x >= 0 && y < this._height && y >= 0 && this._data[y * this._width + x] !== 0;
    }

    /**
     * Get the canvas element reused by Silhouettes to update their data with.
     * @private
     * @return {CanvasElement} A canvas to draw bitmap data to.
     */

  }], [{
    key: '_updateCanvas',
    value: function _updateCanvas() {
      if (typeof __SilhouetteUpdateCanvas === 'undefined') {
        __SilhouetteUpdateCanvas = document.createElement('canvas');
      }
      return __SilhouetteUpdateCanvas;
    }
  }]);

  return Silhouette;
}();

module.exports = Silhouette;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("scratch-svg-renderer");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileoverview
 * A utility to transform a texture coordinate to another texture coordinate
 * representing how the shaders apply effects.
 */

var twgl = __webpack_require__(0);

var ShaderManager = __webpack_require__(3);

/**
 * A texture coordinate is between 0 and 1. 0.5 is the center position.
 * @const {number}
 */
var CENTER_X = 0.5;

/**
 * A texture coordinate is between 0 and 1. 0.5 is the center position.
 * @const {number}
 */
var CENTER_Y = 0.5;

var EffectTransform = function () {
    function EffectTransform() {
        _classCallCheck(this, EffectTransform);
    }

    _createClass(EffectTransform, null, [{
        key: 'transformPoint',

        /**
         * Transform a texture coordinate to one that would be select after applying shader effects.
         * @param {Drawable} drawable The drawable whose effects to emulate.
         * @param {twgl.v3} vec The texture coordinate to transform.
         * @param {?twgl.v3} dst A place to store the output coordinate.
         * @return {twgl.v3} The coordinate after being transform by effects.
         */
        value: function transformPoint(drawable, vec, dst) {
            dst = dst || twgl.v3.create();
            twgl.v3.copy(vec, dst);

            var uniforms = drawable.getUniforms();
            var effects = drawable.getEnabledEffects();

            if ((effects & ShaderManager.EFFECT_INFO.mosaic.mask) !== 0) {
                // texcoord0 = fract(u_mosaic * texcoord0);
                dst[0] = uniforms.u_mosaic * dst[0] % 1;
                dst[1] = uniforms.u_mosaic * dst[1] % 1;
            }
            if ((effects & ShaderManager.EFFECT_INFO.pixelate.mask) !== 0) {
                var skinUniforms = drawable.skin.getUniforms();
                // vec2 pixelTexelSize = u_skinSize / u_pixelate;
                var texelX = skinUniforms.u_skinSize[0] * uniforms.u_pixelate;
                var texelY = skinUniforms.u_skinSize[1] * uniforms.u_pixelate;
                // texcoord0 = (floor(texcoord0 * pixelTexelSize) + kCenter) /
                //   pixelTexelSize;
                dst[0] = (Math.floor(dst[0] * texelX) + CENTER_X) / texelX;
                dst[1] = (Math.floor(dst[1] * texelY) + CENTER_Y) / texelY;
            }
            if ((effects & ShaderManager.EFFECT_INFO.whirl.mask) !== 0) {
                // const float kRadius = 0.5;
                var RADIUS = 0.5;
                // vec2 offset = texcoord0 - kCenter;
                var offsetX = dst[0] - CENTER_X;
                var offsetY = dst[1] - CENTER_Y;
                // float offsetMagnitude = length(offset);
                var offsetMagnitude = twgl.v3.length(dst);
                // float whirlFactor = max(1.0 - (offsetMagnitude / kRadius), 0.0);
                var whirlFactor = Math.max(1.0 - offsetMagnitude / RADIUS, 0.0);
                // float whirlActual = u_whirl * whirlFactor * whirlFactor;
                var whirlActual = uniforms.u_whirl * whirlFactor * whirlFactor;
                // float sinWhirl = sin(whirlActual);
                var sinWhirl = Math.sin(whirlActual);
                // float cosWhirl = cos(whirlActual);
                var cosWhirl = Math.cos(whirlActual);
                // mat2 rotationMatrix = mat2(
                //     cosWhirl, -sinWhirl,
                //     sinWhirl, cosWhirl
                // );
                var rot00 = cosWhirl;
                var rot10 = -sinWhirl;
                var rot01 = sinWhirl;
                var rot11 = cosWhirl;

                // texcoord0 = rotationMatrix * offset + kCenter;
                dst[0] = rot00 * offsetX + rot10 * offsetY + CENTER_X;
                dst[1] = rot01 * offsetX + rot11 * offsetY + CENTER_Y;
            }
            if ((effects & ShaderManager.EFFECT_INFO.fisheye.mask) !== 0) {
                // vec2 vec = (texcoord0 - kCenter) / kCenter;
                var vX = (dst[0] - CENTER_X) / CENTER_X;
                var vY = (dst[1] - CENTER_Y) / CENTER_Y;
                // float vecLength = length(vec);
                var vLength = Math.sqrt(vX * vX + vY * vY);
                // float r = pow(min(vecLength, 1.0), u_fisheye) * max(1.0, vecLength);
                var r = Math.pow(Math.min(vLength, 1), uniforms.u_fisheye) * Math.max(1, vLength);
                // vec2 unit = vec / vecLength;
                var unitX = vX / vLength;
                var unitY = vY / vLength;
                // texcoord0 = kCenter + r * unit * kCenter;
                dst[0] = CENTER_X + r * unitX * CENTER_X;
                dst[1] = CENTER_Y + r * unitY * CENTER_Y;
            }

            return dst;
        }
    }]);

    return EffectTransform;
}();

module.exports = EffectTransform;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rectangle = function () {
    /**
     * A utility for creating and comparing axis-aligned rectangles.
     * Rectangles are always initialized to the "largest possible rectangle";
     * use one of the init* methods below to set up a particular rectangle.
     * @constructor
     */
    function Rectangle() {
        _classCallCheck(this, Rectangle);

        this.left = -Infinity;
        this.right = Infinity;
        this.bottom = -Infinity;
        this.top = Infinity;
    }

    /**
     * Initialize a Rectangle from given Scratch-coordinate bounds.
     * @param {number} left Left bound of the rectangle.
     * @param {number} right Right bound of the rectangle.
     * @param {number} bottom Bottom bound of the rectangle.
     * @param {number} top Top bound of the rectangle.
     */


    _createClass(Rectangle, [{
        key: "initFromBounds",
        value: function initFromBounds(left, right, bottom, top) {
            this.left = left;
            this.right = right;
            this.bottom = bottom;
            this.top = top;
        }

        /**
         * Initialize a Rectangle to the minimum AABB around a set of points.
         * @param {Array<Array<number>>} points Array of [x, y] points.
         */

    }, {
        key: "initFromPointsAABB",
        value: function initFromPointsAABB(points) {
            this.left = Infinity;
            this.right = -Infinity;
            this.top = -Infinity;
            this.bottom = Infinity;
            for (var i = 0; i < points.length; i++) {
                var x = points[i][0];
                var y = points[i][1];
                if (x < this.left) {
                    this.left = x;
                }
                if (x > this.right) {
                    this.right = x;
                }
                if (y > this.top) {
                    this.top = y;
                }
                if (y < this.bottom) {
                    this.bottom = y;
                }
            }
        }

        /**
         * Determine if this Rectangle intersects some other.
         * Note that this is a comparison assuming the Rectangle was
         * initialized with Scratch-space bounds or points.
         * @param {!Rectangle} other Rectangle to check if intersecting.
         * @return {boolean} True if this Rectangle intersects other.
         */

    }, {
        key: "intersects",
        value: function intersects(other) {
            return this.left <= other.right && other.left <= this.right && this.top >= other.bottom && other.top >= this.bottom;
        }

        /**
         * Determine if this Rectangle fully contains some other.
         * Note that this is a comparison assuming the Rectangle was
         * initialized with Scratch-space bounds or points.
         * @param {!Rectangle} other Rectangle to check if fully contained.
         * @return {boolean} True if this Rectangle fully contains other.
         */

    }, {
        key: "contains",
        value: function contains(other) {
            return other.left > this.left && other.right < this.right && other.top < this.top && other.bottom > this.bottom;
        }

        /**
         * Clamp a Rectangle to bounds.
         * @param {number} left Left clamp.
         * @param {number} right Right clamp.
         * @param {number} bottom Bottom clamp.
         * @param {number} top Top clamp.
         */

    }, {
        key: "clamp",
        value: function clamp(left, right, bottom, top) {
            this.left = Math.max(this.left, left);
            this.right = Math.min(this.right, right);
            this.bottom = Math.max(this.bottom, bottom);
            this.top = Math.min(this.top, top);
            // Ensure rectangle coordinates in order.
            this.left = Math.min(this.left, this.right);
            this.right = Math.max(this.right, this.left);
            this.bottom = Math.min(this.bottom, this.top);
            this.top = Math.max(this.top, this.bottom);
        }

        /**
         * Push out the Rectangle to integer bounds.
         */

    }, {
        key: "snapToInt",
        value: function snapToInt() {
            this.left = Math.floor(this.left);
            this.right = Math.ceil(this.right);
            this.bottom = Math.floor(this.bottom);
            this.top = Math.ceil(this.top);
        }

        /**
         * Width of the Rectangle.
         * @return {number} Width of rectangle.
         */

    }, {
        key: "width",
        get: function get() {
            return Math.abs(this.left - this.right);
        }

        /**
         * Height of the Rectangle.
         * @return {number} Height of rectangle.
         */

    }, {
        key: "height",
        get: function get() {
            return Math.abs(this.top - this.bottom);
        }
    }]);

    return Rectangle;
}();

module.exports = Rectangle;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("xml-escape");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

var TINF_OK = 0;
var TINF_DATA_ERROR = -3;

function Tree() {
  this.table = new Uint16Array(16);   /* table of code length counts */
  this.trans = new Uint16Array(288);  /* code -> symbol translation table */
}

function Data(source, dest) {
  this.source = source;
  this.sourceIndex = 0;
  this.tag = 0;
  this.bitcount = 0;
  
  this.dest = dest;
  this.destLen = 0;
  
  this.ltree = new Tree();  /* dynamic length/symbol tree */
  this.dtree = new Tree();  /* dynamic distance tree */
}

/* --------------------------------------------------- *
 * -- uninitialized global data (static structures) -- *
 * --------------------------------------------------- */

var sltree = new Tree();
var sdtree = new Tree();

/* extra bits and base tables for length codes */
var length_bits = new Uint8Array(30);
var length_base = new Uint16Array(30);

/* extra bits and base tables for distance codes */
var dist_bits = new Uint8Array(30);
var dist_base = new Uint16Array(30);

/* special ordering of code length codes */
var clcidx = new Uint8Array([
  16, 17, 18, 0, 8, 7, 9, 6,
  10, 5, 11, 4, 12, 3, 13, 2,
  14, 1, 15
]);

/* used by tinf_decode_trees, avoids allocations every call */
var code_tree = new Tree();
var lengths = new Uint8Array(288 + 32);

/* ----------------------- *
 * -- utility functions -- *
 * ----------------------- */

/* build extra bits and base tables */
function tinf_build_bits_base(bits, base, delta, first) {
  var i, sum;

  /* build bits table */
  for (i = 0; i < delta; ++i) bits[i] = 0;
  for (i = 0; i < 30 - delta; ++i) bits[i + delta] = i / delta | 0;

  /* build base table */
  for (sum = first, i = 0; i < 30; ++i) {
    base[i] = sum;
    sum += 1 << bits[i];
  }
}

/* build the fixed huffman trees */
function tinf_build_fixed_trees(lt, dt) {
  var i;

  /* build fixed length tree */
  for (i = 0; i < 7; ++i) lt.table[i] = 0;

  lt.table[7] = 24;
  lt.table[8] = 152;
  lt.table[9] = 112;

  for (i = 0; i < 24; ++i) lt.trans[i] = 256 + i;
  for (i = 0; i < 144; ++i) lt.trans[24 + i] = i;
  for (i = 0; i < 8; ++i) lt.trans[24 + 144 + i] = 280 + i;
  for (i = 0; i < 112; ++i) lt.trans[24 + 144 + 8 + i] = 144 + i;

  /* build fixed distance tree */
  for (i = 0; i < 5; ++i) dt.table[i] = 0;

  dt.table[5] = 32;

  for (i = 0; i < 32; ++i) dt.trans[i] = i;
}

/* given an array of code lengths, build a tree */
var offs = new Uint16Array(16);

function tinf_build_tree(t, lengths, off, num) {
  var i, sum;

  /* clear code length count table */
  for (i = 0; i < 16; ++i) t.table[i] = 0;

  /* scan symbol lengths, and sum code length counts */
  for (i = 0; i < num; ++i) t.table[lengths[off + i]]++;

  t.table[0] = 0;

  /* compute offset table for distribution sort */
  for (sum = 0, i = 0; i < 16; ++i) {
    offs[i] = sum;
    sum += t.table[i];
  }

  /* create code->symbol translation table (symbols sorted by code) */
  for (i = 0; i < num; ++i) {
    if (lengths[off + i]) t.trans[offs[lengths[off + i]]++] = i;
  }
}

/* ---------------------- *
 * -- decode functions -- *
 * ---------------------- */

/* get one bit from source stream */
function tinf_getbit(d) {
  /* check if tag is empty */
  if (!d.bitcount--) {
    /* load next tag */
    d.tag = d.source[d.sourceIndex++];
    d.bitcount = 7;
  }

  /* shift bit out of tag */
  var bit = d.tag & 1;
  d.tag >>>= 1;

  return bit;
}

/* read a num bit value from a stream and add base */
function tinf_read_bits(d, num, base) {
  if (!num)
    return base;

  while (d.bitcount < 24) {
    d.tag |= d.source[d.sourceIndex++] << d.bitcount;
    d.bitcount += 8;
  }

  var val = d.tag & (0xffff >>> (16 - num));
  d.tag >>>= num;
  d.bitcount -= num;
  return val + base;
}

/* given a data stream and a tree, decode a symbol */
function tinf_decode_symbol(d, t) {
  while (d.bitcount < 24) {
    d.tag |= d.source[d.sourceIndex++] << d.bitcount;
    d.bitcount += 8;
  }
  
  var sum = 0, cur = 0, len = 0;
  var tag = d.tag;

  /* get more bits while code value is above sum */
  do {
    cur = 2 * cur + (tag & 1);
    tag >>>= 1;
    ++len;

    sum += t.table[len];
    cur -= t.table[len];
  } while (cur >= 0);
  
  d.tag = tag;
  d.bitcount -= len;

  return t.trans[sum + cur];
}

/* given a data stream, decode dynamic trees from it */
function tinf_decode_trees(d, lt, dt) {
  var hlit, hdist, hclen;
  var i, num, length;

  /* get 5 bits HLIT (257-286) */
  hlit = tinf_read_bits(d, 5, 257);

  /* get 5 bits HDIST (1-32) */
  hdist = tinf_read_bits(d, 5, 1);

  /* get 4 bits HCLEN (4-19) */
  hclen = tinf_read_bits(d, 4, 4);

  for (i = 0; i < 19; ++i) lengths[i] = 0;

  /* read code lengths for code length alphabet */
  for (i = 0; i < hclen; ++i) {
    /* get 3 bits code length (0-7) */
    var clen = tinf_read_bits(d, 3, 0);
    lengths[clcidx[i]] = clen;
  }

  /* build code length tree */
  tinf_build_tree(code_tree, lengths, 0, 19);

  /* decode code lengths for the dynamic trees */
  for (num = 0; num < hlit + hdist;) {
    var sym = tinf_decode_symbol(d, code_tree);

    switch (sym) {
      case 16:
        /* copy previous code length 3-6 times (read 2 bits) */
        var prev = lengths[num - 1];
        for (length = tinf_read_bits(d, 2, 3); length; --length) {
          lengths[num++] = prev;
        }
        break;
      case 17:
        /* repeat code length 0 for 3-10 times (read 3 bits) */
        for (length = tinf_read_bits(d, 3, 3); length; --length) {
          lengths[num++] = 0;
        }
        break;
      case 18:
        /* repeat code length 0 for 11-138 times (read 7 bits) */
        for (length = tinf_read_bits(d, 7, 11); length; --length) {
          lengths[num++] = 0;
        }
        break;
      default:
        /* values 0-15 represent the actual code lengths */
        lengths[num++] = sym;
        break;
    }
  }

  /* build dynamic trees */
  tinf_build_tree(lt, lengths, 0, hlit);
  tinf_build_tree(dt, lengths, hlit, hdist);
}

/* ----------------------------- *
 * -- block inflate functions -- *
 * ----------------------------- */

/* given a stream and two trees, inflate a block of data */
function tinf_inflate_block_data(d, lt, dt) {
  while (1) {
    var sym = tinf_decode_symbol(d, lt);

    /* check for end of block */
    if (sym === 256) {
      return TINF_OK;
    }

    if (sym < 256) {
      d.dest[d.destLen++] = sym;
    } else {
      var length, dist, offs;
      var i;

      sym -= 257;

      /* possibly get more bits from length code */
      length = tinf_read_bits(d, length_bits[sym], length_base[sym]);

      dist = tinf_decode_symbol(d, dt);

      /* possibly get more bits from distance code */
      offs = d.destLen - tinf_read_bits(d, dist_bits[dist], dist_base[dist]);

      /* copy match */
      for (i = offs; i < offs + length; ++i) {
        d.dest[d.destLen++] = d.dest[i];
      }
    }
  }
}

/* inflate an uncompressed block of data */
function tinf_inflate_uncompressed_block(d) {
  var length, invlength;
  var i;
  
  /* unread from bitbuffer */
  while (d.bitcount > 8) {
    d.sourceIndex--;
    d.bitcount -= 8;
  }

  /* get length */
  length = d.source[d.sourceIndex + 1];
  length = 256 * length + d.source[d.sourceIndex];

  /* get one's complement of length */
  invlength = d.source[d.sourceIndex + 3];
  invlength = 256 * invlength + d.source[d.sourceIndex + 2];

  /* check length */
  if (length !== (~invlength & 0x0000ffff))
    return TINF_DATA_ERROR;

  d.sourceIndex += 4;

  /* copy block */
  for (i = length; i; --i)
    d.dest[d.destLen++] = d.source[d.sourceIndex++];

  /* make sure we start next block on a byte boundary */
  d.bitcount = 0;

  return TINF_OK;
}

/* inflate stream from source to dest */
function tinf_uncompress(source, dest) {
  var d = new Data(source, dest);
  var bfinal, btype, res;

  do {
    /* read final block flag */
    bfinal = tinf_getbit(d);

    /* read block type (2 bits) */
    btype = tinf_read_bits(d, 2, 0);

    /* decompress block */
    switch (btype) {
      case 0:
        /* decompress uncompressed block */
        res = tinf_inflate_uncompressed_block(d);
        break;
      case 1:
        /* decompress block with fixed huffman trees */
        res = tinf_inflate_block_data(d, sltree, sdtree);
        break;
      case 2:
        /* decompress block with dynamic huffman trees */
        tinf_decode_trees(d, d.ltree, d.dtree);
        res = tinf_inflate_block_data(d, d.ltree, d.dtree);
        break;
      default:
        res = TINF_DATA_ERROR;
    }

    if (res !== TINF_OK)
      throw new Error('Data error');

  } while (!bfinal);

  if (d.destLen < d.dest.length) {
    if (typeof d.dest.slice === 'function')
      return d.dest.slice(0, d.destLen);
    else
      return d.dest.subarray(0, d.destLen);
  }
  
  return d.dest;
}

/* -------------------- *
 * -- initialization -- *
 * -------------------- */

/* build fixed huffman trees */
tinf_build_fixed_trees(sltree, sdtree);

/* build extra bits and base tables */
tinf_build_bits_base(length_bits, length_base, 4, 3);
tinf_build_bits_base(dist_bits, dist_base, 2, 1);

/* fix a special case */
length_bits[28] = 0;
length_base[28] = 258;

module.exports = tinf_uncompress;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by CoffeeScript 1.7.1
var UnicodeTrie, inflate;

inflate = __webpack_require__(10);

UnicodeTrie = (function() {
  var DATA_BLOCK_LENGTH, DATA_GRANULARITY, DATA_MASK, INDEX_1_OFFSET, INDEX_2_BLOCK_LENGTH, INDEX_2_BMP_LENGTH, INDEX_2_MASK, INDEX_SHIFT, LSCP_INDEX_2_LENGTH, LSCP_INDEX_2_OFFSET, OMITTED_BMP_INDEX_1_LENGTH, SHIFT_1, SHIFT_1_2, SHIFT_2, UTF8_2B_INDEX_2_LENGTH, UTF8_2B_INDEX_2_OFFSET;

  SHIFT_1 = 6 + 5;

  SHIFT_2 = 5;

  SHIFT_1_2 = SHIFT_1 - SHIFT_2;

  OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> SHIFT_1;

  INDEX_2_BLOCK_LENGTH = 1 << SHIFT_1_2;

  INDEX_2_MASK = INDEX_2_BLOCK_LENGTH - 1;

  INDEX_SHIFT = 2;

  DATA_BLOCK_LENGTH = 1 << SHIFT_2;

  DATA_MASK = DATA_BLOCK_LENGTH - 1;

  LSCP_INDEX_2_OFFSET = 0x10000 >> SHIFT_2;

  LSCP_INDEX_2_LENGTH = 0x400 >> SHIFT_2;

  INDEX_2_BMP_LENGTH = LSCP_INDEX_2_OFFSET + LSCP_INDEX_2_LENGTH;

  UTF8_2B_INDEX_2_OFFSET = INDEX_2_BMP_LENGTH;

  UTF8_2B_INDEX_2_LENGTH = 0x800 >> 6;

  INDEX_1_OFFSET = UTF8_2B_INDEX_2_OFFSET + UTF8_2B_INDEX_2_LENGTH;

  DATA_GRANULARITY = 1 << INDEX_SHIFT;

  function UnicodeTrie(data) {
    var isBuffer, uncompressedLength, view;
    isBuffer = typeof data.readUInt32BE === 'function' && typeof data.slice === 'function';
    if (isBuffer || data instanceof Uint8Array) {
      if (isBuffer) {
        this.highStart = data.readUInt32BE(0);
        this.errorValue = data.readUInt32BE(4);
        uncompressedLength = data.readUInt32BE(8);
        data = data.slice(12);
      } else {
        view = new DataView(data.buffer);
        this.highStart = view.getUint32(0);
        this.errorValue = view.getUint32(4);
        uncompressedLength = view.getUint32(8);
        data = data.subarray(12);
      }
      data = inflate(data, new Uint8Array(uncompressedLength));
      data = inflate(data, new Uint8Array(uncompressedLength));
      this.data = new Uint32Array(data.buffer);
    } else {
      this.data = data.data, this.highStart = data.highStart, this.errorValue = data.errorValue;
    }
  }

  UnicodeTrie.prototype.get = function(codePoint) {
    var index;
    if (codePoint < 0 || codePoint > 0x10ffff) {
      return this.errorValue;
    }
    if (codePoint < 0xd800 || (codePoint > 0xdbff && codePoint <= 0xffff)) {
      index = (this.data[codePoint >> SHIFT_2] << INDEX_SHIFT) + (codePoint & DATA_MASK);
      return this.data[index];
    }
    if (codePoint <= 0xffff) {
      index = (this.data[LSCP_INDEX_2_OFFSET + ((codePoint - 0xd800) >> SHIFT_2)] << INDEX_SHIFT) + (codePoint & DATA_MASK);
      return this.data[index];
    }
    if (codePoint < this.highStart) {
      index = this.data[(INDEX_1_OFFSET - OMITTED_BMP_INDEX_1_LENGTH) + (codePoint >> SHIFT_1)];
      index = this.data[index + ((codePoint >> SHIFT_2) & INDEX_2_MASK)];
      index = (index << INDEX_SHIFT) + (codePoint & DATA_MASK);
      return this.data[index];
    }
    return this.data[this.data.length - DATA_GRANULARITY];
  };

  return UnicodeTrie;

})();

module.exports = UnicodeTrie;


/***/ }),
/* 12 */
/***/ (function(module) {

module.exports = {"Other":0,"CR":1,"LF":2,"Control":3,"Extend":4,"Regional_Indicator":5,"SpacingMark":6,"L":7,"V":8,"T":9,"LV":10,"LVT":11};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by CoffeeScript 1.8.0
(function() {
  var CR, Control, Extend, L, LF, LV, LVT, Regional_Indicator, SpacingMark, T, UnicodeTrie, V, classTrie, codePointAt, fs, shouldBreak, _ref;

  _ref = __webpack_require__(12), CR = _ref.CR, LF = _ref.LF, Control = _ref.Control, Extend = _ref.Extend, Regional_Indicator = _ref.Regional_Indicator, SpacingMark = _ref.SpacingMark, L = _ref.L, V = _ref.V, T = _ref.T, LV = _ref.LV, LVT = _ref.LVT;

  UnicodeTrie = __webpack_require__(11);

  

  classTrie = new UnicodeTrie(Buffer("AA4QAAAAAAAAAHbgAQgG9/ntmkuIXjUUxzN+r3k4bUWQVotSHVCsoov6qIoiToWKFYvMuLHVtlaoLqQilLrwtakuxFYoLmQQYWalRYpUKYJV0am4mMUooojgSEG7EC2CdiHq/3rzMcc0yT333jyu0xz4kdwkN+ckOXncfN9QS4jzwCqwBqwHt5O0uuFGsBlsAhOM8lvATkv+LrAb7AXPgRfBAfAqeJ2UmwZvgcPgKDgGjoNZMAe+AN+C5W0hLgAXtvN3KZci7UpwFVgHbgHjYAPYJJ8nwCTYCnaQ58dI+cfBHvn8DFgL9kl9LyP8LLOflJ8CM+Q5K39IPo/28vfeyd6X8fcR/5jYP4v4nHyeR/iNjC8gPAl+BU+T8qcRFx0hBsGKzn/74LreIrdKxsGkRO0zE48wy7lmZSfnYkmWdhnCtTK+oHnnWqUPbuyY679N5t2J8B4ZnyTltyK+Dezq5P62G+Femf+sDPdp6n8JaQcterN5NWXJ5/Ij+FnGR0n6BvCbZk4kwjGjjO8rGh9woedNoudtBz6VSCQSiUQikUgkEomET97t5Hdp/ecvGfcXH+CdWfLNu6onxGowh7SvZPp3CE+A63v5feBJxMcQPyXz/0D4N2h18+cRhEcQnt+1674I+Q+inofANrAd7AAPg529lJfyUl7KS3mu8+4G94H7e/H3rPWRid3+RGIpc0nBGbAuE63F39VV1mjS6Pn4VCv++jN9bs4JMM5gbFSIdaNnpj+ppE3j+QQYWybEA8vytP0IPwF/gpXLsQ+AhWH0xYgQPwwJMTjA46YRXrnVw4vxzYjvke8dzvQx60gkEonE0uQA9oU3wB04J7yH/fDDVv4/j+x/QqfJXv0RuEueJe7t5vkTCLeQ88V2zVkjq+tRpD/Rzf+39hTC55lnkhdQbr+l7EHkTZH8GcTnSf4hkpf9/+uI57NQFT6HTSsC6hMYg3no/FrTF983sH84FJ3xNlroteOfQWNTp+8vL/CZeeX5mgb62A2w6WaDXa/9D/6DeFTafqwBfXtFT4irwacObMnm50/dPPwF4e/grwa0kUsTxiMEnQbcY9ZlsDXwL4iyOIfEB5jvcEgST1L/u/PjkP7vctzaZzkuJZSepknsMaw67jQ0xZe61F2XyvZ5k/ecJq4voXzQ1oZWQRm1Dl1ZH0LtiiVN8pUmy9nQD77bppuTLqWl1O9Ch+9vv9Dfm12COrZqOrXRJv13TX6i00XHyISLNamp3/e6eWWab9xyoYSr1+XeUoWug7ZWFTonhLDPO9M8pOX7cVHwbhn7Yu1VantC61ZtMPWhaiMtX0YXp1wsf7X5p65sW/OslnXpV3XrN803WneXlC0zvj5EZ5sP/6yyXsQQ01rRVdJV/+XWXUZ/rPmp7gf9dNuZoKjOmOOZibqv6fY43fi6bp9pfoXyL1tZ0x5Fy6u+UcVOrm1FZxdOPS7OLi7sFaKaXt+2c/X71qELqbhcD4v8wgRnb6+rr459rqgr3H5T21tmza0r3LOnj/6oWkcmnP6pa7OPvve9dvmqm+PD1HdteyP3e7xsX/mcK7Y26tJV0bXfVI/vOa9bZ3wIbS9nraehKHiH248cn/KxtpX1bV3bQoptnGx+S9ND2xujn6jo+ku3Jvic16oO3djo7CsrnHWdM1dd9UPR/OFQ9rtKl2ZaQ4vaWWe9KGOzSV8dcenPZdvhUny1QZdW1ce4fuhSdGuYb/F1h8IV3/PPlR0+pOya6dofdPuDbt8oug9uis+YvguqjiHnnVDz1KbfR30637f1Y5U+1o2VrVxZMX37qvfcof1XJzFtCKG76plJCJ7fhTq/FJ0hqI/FFtMaGWOv69vjUsrePZTZQ331h8lm07dj1fpCn2Fi3EX09atn2L6Ynsv4AFfUernj4HucbGc8dU0w+aDL+4M6YmtLX0z3I7Ha4Fpn1bufKucck2/YfIhrP3dfci0h5puv9TfUPs21g8bbmvzQZ4tQfhNSiuZ4HVzp4rShTHt9icl2l31YVTqB6Eus81pd/U2xuwyxpYrNPsik1wCoDEZmyDMjCmXFZVtV8d12DqoMizP7zCeh9anyDw==","base64"));

  codePointAt = function(str, idx) {
    var code, hi, low;
    idx = idx || 0;
    code = str.charCodeAt(idx);
    if ((0xD800 <= code && code <= 0xDBFF)) {
      hi = code;
      low = str.charCodeAt(idx + 1);
      if ((0xDC00 <= low && low <= 0xDFFF)) {
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
      }
      return hi;
    }
    if ((0xDC00 <= code && code <= 0xDFFF)) {
      hi = str.charCodeAt(idx - 1);
      low = code;
      if ((0xD800 <= hi && hi <= 0xDBFF)) {
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
      }
      return low;
    }
    return code;
  };

  shouldBreak = function(previous, current) {
    if (previous === CR && current === LF) {
      return false;
    } else if (previous === Control || previous === CR || previous === LF) {
      return true;
    } else if (current === Control || current === CR || current === LF) {
      return true;
    } else if (previous === L && (current === L || current === V || current === LV || current === LVT)) {
      return false;
    } else if ((previous === LV || previous === V) && (current === V || current === T)) {
      return false;
    } else if ((previous === LVT || previous === T) && current === T) {
      return false;
    } else if (previous === Regional_Indicator && current === Regional_Indicator) {
      return false;
    } else if (current === Extend) {
      return false;
    } else if (current === SpacingMark) {
      return false;
    }
    return true;
  };

  exports.nextBreak = function(string, index) {
    var i, next, prev, _i, _ref1, _ref2, _ref3, _ref4;
    if (index == null) {
      index = 0;
    }
    if (index < 0) {
      return 0;
    }
    if (index >= string.length - 1) {
      return string.length;
    }
    prev = classTrie.get(codePointAt(string, index));
    for (i = _i = _ref1 = index + 1, _ref2 = string.length; _i < _ref2; i = _i += 1) {
      if ((0xd800 <= (_ref3 = string.charCodeAt(i - 1)) && _ref3 <= 0xdbff) && (0xdc00 <= (_ref4 = string.charCodeAt(i)) && _ref4 <= 0xdfff)) {
        continue;
      }
      next = classTrie.get(codePointAt(string, i));
      if (shouldBreak(prev, next)) {
        return i;
      }
      prev = next;
    }
    return string.length;
  };

  exports.previousBreak = function(string, index) {
    var i, next, prev, _i, _ref1, _ref2, _ref3;
    if (index == null) {
      index = string.length;
    }
    if (index > string.length) {
      return string.length;
    }
    if (index <= 1) {
      return 0;
    }
    index--;
    next = classTrie.get(codePointAt(string, index));
    for (i = _i = _ref1 = index - 1; _i >= 0; i = _i += -1) {
      if ((0xd800 <= (_ref2 = string.charCodeAt(i)) && _ref2 <= 0xdbff) && (0xdc00 <= (_ref3 = string.charCodeAt(i + 1)) && _ref3 <= 0xdfff)) {
        continue;
      }
      prev = classTrie.get(codePointAt(string, i));
      if (shouldBreak(prev, next)) {
        return i + 1;
      }
      next = prev;
    }
    return 0;
  };

  exports["break"] = function(str) {
    var brk, index, res;
    res = [];
    index = 0;
    while ((brk = exports.nextBreak(str, index)) < str.length) {
      res.push(str.slice(index, brk));
      index = brk;
    }
    if (index < str.length) {
      res.push(str.slice(index));
    }
    return res;
  };

  exports.countBreaks = function(str) {
    var brk, count, index;
    count = 0;
    index = 0;
    while ((brk = exports.nextBreak(str, index)) < str.length) {
      index = brk;
      count++;
    }
    if (index < str.length) {
      count++;
    }
    return count;
  };

}).call(this);


/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("linebreak");

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LineBreaker = __webpack_require__(14);
var GraphemeBreaker = __webpack_require__(13);

/**
 * Tell this text wrapper to use a specific measurement provider.
 * @typedef {object} MeasurementProvider - the new measurement provider.
 * @property {Function} beginMeasurementSession - this will be called before a batch of measurements are made.
 *      Optionally, this function may return an object to be provided to the endMeasurementSession function.
 * @property {Function} measureText - this will be called each time a piece of text must be measured.
 * @property {Function} endMeasurementSession - this will be called after a batch of measurements is finished.
 *      It will be passed whatever value beginMeasurementSession returned, if any.
 */

/**
 * Utility to wrap text across several lines, respecting Unicode grapheme clusters and, when possible, Unicode line
 * break opportunities.
 * Reference material:
 * - Unicode Standard Annex #14: http://unicode.org/reports/tr14/
 * - Unicode Standard Annex #39: http://unicode.org/reports/tr29/
 * - "JavaScript has a Unicode problem" by Mathias Bynens: https://mathiasbynens.be/notes/javascript-unicode
 */

var TextWrapper = function () {
    /**
     * Construct a text wrapper which will measure text using the specified measurement provider.
     * @param {MeasurementProvider} measurementProvider - a helper object to provide text measurement services.
     */
    function TextWrapper(measurementProvider) {
        _classCallCheck(this, TextWrapper);

        this._measurementProvider = measurementProvider;
        this._cache = {};
    }

    /**
     * Wrap the provided text into lines restricted to a maximum width. See Unicode Standard Annex (UAX) #14.
     * @param {number} maxWidth - the maximum allowed width of a line.
     * @param {string} text - the text to be wrapped. Will be split on whitespace.
     * @returns {Array.<string>} an array containing the wrapped lines of text.
     */


    _createClass(TextWrapper, [{
        key: 'wrapText',
        value: function wrapText(maxWidth, text) {
            // Normalize to canonical composition (see Unicode Standard Annex (UAX) #15)
            text = text.normalize();

            var cacheKey = maxWidth + '-' + text;
            if (this._cache[cacheKey]) {
                return this._cache[cacheKey];
            }

            var measurementSession = this._measurementProvider.beginMeasurementSession();

            var breaker = new LineBreaker(text);
            var lastPosition = 0;
            var nextBreak = void 0;
            var currentLine = null;
            var lines = [];

            while (nextBreak = breaker.nextBreak()) {
                var word = text.slice(lastPosition, nextBreak.position).replace(/\n+$/, '');

                var proposedLine = (currentLine || '').concat(word);
                var proposedLineWidth = this._measurementProvider.measureText(proposedLine);

                if (proposedLineWidth > maxWidth) {
                    // The next word won't fit on this line. Will it fit on a line by itself?
                    var wordWidth = this._measurementProvider.measureText(word);
                    if (wordWidth > maxWidth) {
                        // The next word can't even fit on a line by itself. Consume it one grapheme cluster at a time.
                        var lastCluster = 0;
                        var nextCluster = void 0;
                        while (lastCluster !== (nextCluster = GraphemeBreaker.nextBreak(word, lastCluster))) {
                            var cluster = word.substring(lastCluster, nextCluster);
                            proposedLine = (currentLine || '').concat(cluster);
                            proposedLineWidth = this._measurementProvider.measureText(proposedLine);
                            if (currentLine === null || proposedLineWidth <= maxWidth) {
                                // first cluster of a new line or the cluster fits
                                currentLine = proposedLine;
                            } else {
                                // no more can fit
                                lines.push(currentLine);
                                currentLine = cluster;
                            }
                            lastCluster = nextCluster;
                        }
                    } else {
                        // The next word can fit on the next line. Finish the current line and move on.
                        if (currentLine !== null) lines.push(currentLine);
                        currentLine = word;
                    }
                } else {
                    // The next word fits on this line. Just keep going.
                    currentLine = proposedLine;
                }

                // Did we find a \n or similar?
                if (nextBreak.required) {
                    if (currentLine !== null) lines.push(currentLine);
                    currentLine = null;
                }

                lastPosition = nextBreak.position;
            }

            currentLine = currentLine || '';
            if (currentLine.length > 0 || lines.length === 0) {
                lines.push(currentLine);
            }

            this._cache[cacheKey] = lines;
            this._measurementProvider.endMeasurementSession(measurementSession);
            return lines;
        }
    }]);

    return TextWrapper;
}();

module.exports = TextWrapper;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextWrapper = __webpack_require__(15);

/**
 * Measure text by using a hidden SVG attached to the DOM.
 * For use with TextWrapper.
 */

var SVGMeasurementProvider = function () {
    function SVGMeasurementProvider() {
        _classCallCheck(this, SVGMeasurementProvider);

        this._svgRoot = null;
        this._cache = {};
    }

    /**
     * Detach the hidden SVG element from the DOM and forget all references to it and its children.
     */


    _createClass(SVGMeasurementProvider, [{
        key: 'dispose',
        value: function dispose() {
            if (this._svgRoot) {
                this._svgRoot.parentElement.removeChild(this._svgRoot);
                this._svgRoot = null;
                this._svgText = null;
            }
        }

        /**
         * Called by the TextWrapper before a batch of zero or more calls to measureText().
         */

    }, {
        key: 'beginMeasurementSession',
        value: function beginMeasurementSession() {
            if (!this._svgRoot) {
                this._init();
            }
        }

        /**
         * Called by the TextWrapper after a batch of zero or more calls to measureText().
         */

    }, {
        key: 'endMeasurementSession',
        value: function endMeasurementSession() {
            this._svgText.textContent = '';
            this.dispose();
        }

        /**
         * Measure a whole string as one unit.
         * @param {string} text - the text to measure.
         * @returns {number} - the length of the string.
         */

    }, {
        key: 'measureText',
        value: function measureText(text) {
            if (!this._cache[text]) {
                this._svgText.textContent = text;
                this._cache[text] = this._svgText.getComputedTextLength();
            }
            return this._cache[text];
        }

        /**
         * Create a simple SVG containing a text node, hide it, and attach it to the DOM. The text node will be used to
         * collect text measurements. The SVG must be attached to the DOM: otherwise measurements will generally be zero.
         * @private
         */

    }, {
        key: '_init',
        value: function _init() {
            var svgNamespace = 'http://www.w3.org/2000/svg';

            var svgRoot = document.createElementNS(svgNamespace, 'svg');
            var svgGroup = document.createElementNS(svgNamespace, 'g');
            var svgText = document.createElementNS(svgNamespace, 'text');

            // Normalize text attributes to match what the svg-renderer does.
            // @TODO This code should be shared with the svg-renderer.
            svgText.setAttribute('alignment-baseline', 'text-before-edge');
            svgText.setAttribute('font-size', '14');
            svgText.setAttribute('font-family', 'Helvetica');

            // hide from the user, including screen readers
            svgRoot.setAttribute('style', 'position:absolute;visibility:hidden');

            document.body.appendChild(svgRoot);
            svgRoot.appendChild(svgGroup);
            svgGroup.appendChild(svgText);

            /**
             * The root SVG element.
             * @type {SVGSVGElement}
             * @private
             */
            this._svgRoot = svgRoot;

            /**
             * The leaf SVG element used for text measurement.
             * @type {SVGTextElement}
             * @private
             */
            this._svgText = svgText;
        }
    }]);

    return SVGMeasurementProvider;
}();

/**
 * TextWrapper specialized for SVG text.
 */


var SVGTextWrapper = function (_TextWrapper) {
    _inherits(SVGTextWrapper, _TextWrapper);

    function SVGTextWrapper() {
        _classCallCheck(this, SVGTextWrapper);

        return _possibleConstructorReturn(this, (SVGTextWrapper.__proto__ || Object.getPrototypeOf(SVGTextWrapper)).call(this, new SVGMeasurementProvider()));
    }

    return SVGTextWrapper;
}(TextWrapper);

module.exports = SVGTextWrapper;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SVGTextWrapper = __webpack_require__(16);
var SvgRenderer = __webpack_require__(5).SVGRenderer;
var xmlescape = __webpack_require__(9);

var MAX_LINE_LENGTH = 170;
var MIN_WIDTH = 50;

var SVGTextBubble = function () {
    function SVGTextBubble() {
        _classCallCheck(this, SVGTextBubble);

        this.svgRenderer = new SvgRenderer();
        this.svgTextWrapper = new SVGTextWrapper();
        this._textSizeCache = {};
    }

    _createClass(SVGTextBubble, [{
        key: '_speechBubble',
        value: function _speechBubble(w, h, radius, pointsLeft) {
            var pathString = '\n            M 0 ' + radius + '\n            A ' + radius + ' ' + radius + ' 0 0 1 ' + radius + ' 0\n            L ' + (w - radius) + ' 0\n            A ' + radius + ' ' + radius + ' 0 0 1 ' + w + ' ' + radius + '\n            L ' + w + ' ' + (h - radius) + '\n            A ' + radius + ' ' + radius + ' 0 0 1 ' + (w - radius) + ' ' + h;

            if (pointsLeft) {
                pathString += '\n                L 32 ' + h + '\n                c -5 8 -15 12 -18 12\n                a 2 2 0 0 1 -2 -2\n                c 0 -2 4 -6 4 -10';
            } else {
                pathString += '\n                L ' + (w - 16) + ' ' + h + '\n                c 0 4 4 8 4 10\n                a 2 2 0 0 1 -2 2\n                c -3 0 -13 -4 -18 -12';
            }

            pathString += '\n            L ' + radius + ' ' + h + '\n            A ' + radius + ' ' + radius + ' 0 0 1 0 ' + (h - radius) + '\n            Z';

            return '\n            <g>\n                <path\n                  d="' + pathString + '"\n                  stroke="rgba(0, 0, 0, 0.15)"\n                  stroke-width="4"\n                  fill="rgba(0, 0, 0, 0.15)"\n                  stroke-line-join="round"\n              />\n              <path\n                d="' + pathString + '"\n                stroke="none"\n                fill="white" />\n            </g>';
        }
    }, {
        key: '_thinkBubble',
        value: function _thinkBubble(w, h, radius, pointsLeft) {
            var e1rx = 2.25;
            var e1ry = 2.25;
            var e2rx = 1.5;
            var e2ry = 1.5;
            var e1x = 16 + 7 + e1rx;
            var e1y = 5 + h + e1ry;
            var e2x = 16 + e2rx;
            var e2y = 8 + h + e2ry;
            var insetR = 4;
            var pInset1 = 12 + radius;
            var pInset2 = pInset1 + 2 * insetR;

            var pathString = '\n            M 0 ' + radius + '\n            A ' + radius + ' ' + radius + ' 0 0 1 ' + radius + ' 0\n            L ' + (w - radius) + ' 0\n            A ' + radius + ' ' + radius + ' 0 0 1 ' + w + ' ' + radius + '\n            L ' + w + ' ' + (h - radius) + '\n            A ' + radius + ' ' + radius + ' 0 0 1 ' + (w - radius) + ' ' + h;

            if (pointsLeft) {
                pathString += '\n                L ' + pInset2 + ' ' + h + '\n                A ' + insetR + ' ' + insetR + ' 0 0 1 ' + (pInset2 - insetR) + ' ' + (h + insetR) + '\n                A ' + insetR + ' ' + insetR + ' 0 0 1 ' + pInset1 + ' ' + h;
            } else {
                pathString += '\n                L ' + (w - pInset1) + ' ' + h + '\n                A ' + insetR + ' ' + insetR + ' 0 0 1 ' + (w - pInset1 - insetR) + ' ' + (h + insetR) + '\n                A ' + insetR + ' ' + insetR + ' 0 0 1 ' + (w - pInset2) + ' ' + h;
            }

            pathString += '\n            L ' + radius + ' ' + h + '\n            A ' + radius + ' ' + radius + ' 0 0 1 0 ' + (h - radius) + '\n            Z';

            var ellipseSvg = function ellipseSvg(cx, cy, rx, ry) {
                return '\n            <g>\n                <ellipse\n                    cx="' + cx + '" cy="' + cy + '"\n                    rx="' + rx + '" ry="' + ry + '"\n                    fill="rgba(0, 0, 0, 0.15)"\n                    stroke="rgba(0, 0, 0, 0.15)"\n                    stroke-width="4"\n                />\n                <ellipse\n                    cx="' + cx + '" cy="' + cy + '"\n                    rx="' + rx + '" ry="' + ry + '"\n                    fill="white"\n                    stroke="none"\n                />\n            </g>';
            };
            var ellipses = [];
            if (pointsLeft) {
                ellipses = [ellipseSvg(e1x, e1y, e1rx, e1ry), ellipseSvg(e2x, e2y, e2rx, e2ry)];
            } else {
                ellipses = [ellipseSvg(w - e1x, e1y, e1rx, e1ry), ellipseSvg(w - e2x, e2y, e2rx, e2ry)];
            }

            return '\n             <g>\n                <path d="' + pathString + '" stroke="rgba(0, 0, 0, 0.15)" stroke-width="4" fill="rgba(0, 0, 0, 0.15)" />\n                <path d="' + pathString + '" stroke="none" fill="white" />\n                ' + ellipses.join('\n') + '\n            </g>';
        }
    }, {
        key: '_getTextSize',
        value: function _getTextSize() {
            var svgString = this._wrapSvgFragment(this._textFragment());
            if (!this._textSizeCache[svgString]) {
                this._textSizeCache[svgString] = this.svgRenderer.measure(svgString);
            }
            return this._textSizeCache[svgString];
        }
    }, {
        key: '_wrapSvgFragment',
        value: function _wrapSvgFragment(fragment) {
            return '\n          <svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n              ' + fragment + '\n          </svg>\n        ';
        }
    }, {
        key: '_textFragment',
        value: function _textFragment() {
            return '<text fill="#575E75">' + xmlescape(this.lines.join('\n')) + '</text>';
        }
    }, {
        key: 'buildString',
        value: function buildString(type, text, pointsLeft) {
            this.type = type;
            this.pointsLeft = pointsLeft;
            this.lines = this.svgTextWrapper.wrapText(MAX_LINE_LENGTH, text);

            var fragment = '';

            var radius = 16;

            var _getTextSize2 = this._getTextSize(),
                x = _getTextSize2.x,
                y = _getTextSize2.y,
                width = _getTextSize2.width,
                height = _getTextSize2.height;

            var padding = 10;
            var fullWidth = Math.max(MIN_WIDTH, width) + 2 * padding;
            var fullHeight = height + 2 * padding;
            if (this.type === 'say') {
                fragment += this._speechBubble(fullWidth, fullHeight, radius, this.pointsLeft);
            } else {
                fragment += this._thinkBubble(fullWidth, fullHeight, radius, this.pointsLeft);
            }
            fragment += '<g transform="translate(' + (padding - x) + ', ' + (padding - y) + ')">' + this._textFragment() + '</g>';
            return this._wrapSvgFragment(fragment);
        }
    }]);

    return SVGTextBubble;
}();

module.exports = SVGTextBubble;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var twgl = __webpack_require__(0);

var Silhouette = __webpack_require__(4);
var Skin = __webpack_require__(2);
var SvgRenderer = __webpack_require__(5).SVGRenderer;

var MAX_TEXTURE_DIMENSION = 2048;

var SVGSkin = function (_Skin) {
    _inherits(SVGSkin, _Skin);

    /**
     * Create a new SVG skin.
     * @param {!int} id - The ID for this Skin.
     * @param {!RenderWebGL} renderer - The renderer which will use this skin.
     * @constructor
     * @extends Skin
     */
    function SVGSkin(id, renderer) {
        _classCallCheck(this, SVGSkin);

        /** @type {RenderWebGL} */
        var _this = _possibleConstructorReturn(this, (SVGSkin.__proto__ || Object.getPrototypeOf(SVGSkin)).call(this, id));

        _this._renderer = renderer;

        /** @type {SvgRenderer} */
        _this._svgRenderer = new SvgRenderer();

        /** @type {WebGLTexture} */
        _this._texture = null;

        /** @type {number} */
        _this._textureScale = 1;

        /** @type {Number} */
        _this._maxTextureScale = 0;

        _this._silhouette = new Silhouette();
        return _this;
    }

    /**
     * Dispose of this object. Do not use it after calling this method.
     */


    _createClass(SVGSkin, [{
        key: 'dispose',
        value: function dispose() {
            if (this._texture) {
                this._renderer.gl.deleteTexture(this._texture);
                this._texture = null;
            }
            _get(SVGSkin.prototype.__proto__ || Object.getPrototypeOf(SVGSkin.prototype), 'dispose', this).call(this);
        }

        /**
         * @return {Array<number>} the natural size, in Scratch units, of this skin.
         */

    }, {
        key: 'setRotationCenter',


        /**
         * Set the origin, in object space, about which this Skin should rotate.
         * @param {number} x - The x coordinate of the new rotation center.
         * @param {number} y - The y coordinate of the new rotation center.
         */
        value: function setRotationCenter(x, y) {
            var viewOffset = this._svgRenderer.viewOffset;
            _get(SVGSkin.prototype.__proto__ || Object.getPrototypeOf(SVGSkin.prototype), 'setRotationCenter', this).call(this, x - viewOffset[0], y - viewOffset[1]);
        }

        /**
         * @param {Array<number>} scale - The scaling factors to be used, each in the [0,100] range.
         * @return {WebGLTexture} The GL texture representation of this skin when drawing at the given scale.
         */
        // eslint-disable-next-line no-unused-vars

    }, {
        key: 'getTexture',
        value: function getTexture(scale) {
            var _this2 = this;

            // The texture only ever gets uniform scale. Take the larger of the two axes.
            var scaleMax = scale ? Math.max(Math.abs(scale[0]), Math.abs(scale[1])) : 100;
            var requestedScale = Math.min(scaleMax / 100, this._maxTextureScale);
            var newScale = this._textureScale;
            while (newScale < this._maxTextureScale && requestedScale >= 1.5 * newScale) {
                newScale *= 2;
            }
            if (this._textureScale !== newScale) {
                this._textureScale = newScale;
                this._svgRenderer._draw(this._textureScale, function () {
                    if (_this2._textureScale === newScale) {
                        var gl = _this2._renderer.gl;
                        gl.bindTexture(gl.TEXTURE_2D, _this2._texture);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _this2._svgRenderer.canvas);
                    }
                });
            }

            return this._texture;
        }

        /**
         * Set the contents of this skin to a snapshot of the provided SVG data.
         * @param {string} svgData - new SVG to use.
         * @param {Array<number>} [rotationCenter] - Optional rotation center for the SVG. If not supplied, it will be
         * calculated from the bounding box
         * @fires Skin.event:WasAltered
         */

    }, {
        key: 'setSVG',
        value: function setSVG(svgData, rotationCenter) {
            var _this3 = this;

            this._svgRenderer.fromString(svgData, 1, function () {
                var gl = _this3._renderer.gl;
                _this3._textureScale = _this3._maxTextureScale = 1;
                if (_this3._texture) {
                    gl.bindTexture(gl.TEXTURE_2D, _this3._texture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _this3._svgRenderer.canvas);
                    _this3._silhouette.update(_this3._svgRenderer.canvas);
                } else {
                    // TODO: mipmaps?
                    var textureOptions = {
                        auto: true,
                        wrap: gl.CLAMP_TO_EDGE,
                        src: _this3._svgRenderer.canvas
                    };

                    _this3._texture = twgl.createTexture(gl, textureOptions);
                    _this3._silhouette.update(_this3._svgRenderer.canvas);
                }

                var maxDimension = Math.max(_this3._svgRenderer.canvas.width, _this3._svgRenderer.canvas.height);
                var testScale = 2;
                for (testScale; maxDimension * testScale <= MAX_TEXTURE_DIMENSION; testScale *= 2) {
                    _this3._maxTextureScale = testScale;
                }

                if (typeof rotationCenter === 'undefined') rotationCenter = _this3.calculateRotationCenter();
                _this3.setRotationCenter.apply(_this3, rotationCenter);
                _this3.emit(Skin.Events.WasAltered);
            });
        }

        /**
         * Does this point touch an opaque or translucent point on this skin?
         * @param {twgl.v3} vec A texture coordinate.
         * @return {boolean} Did it touch?
         */

    }, {
        key: 'isTouching',
        value: function isTouching(vec) {
            return this._silhouette.isTouching(vec);
        }
    }, {
        key: 'size',
        get: function get() {
            return this._svgRenderer.size;
        }
    }]);

    return SVGSkin;
}(Skin);

module.exports = SVGSkin;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var twgl = __webpack_require__(0);

var RenderConstants = __webpack_require__(1);
var Skin = __webpack_require__(2);
var Silhouette = __webpack_require__(4);

/**
 * Attributes to use when drawing with the pen
 * @typedef {object} PenSkin#PenAttributes
 * @property {number} [diameter] - The size (diameter) of the pen.
 * @property {Array<number>} [color4f] - The pen color as an array of [r,g,b,a], each component in the range [0,1].
 */

/**
 * The pen attributes to use when unspecified.
 * @type {PenSkin#PenAttributes}
 * @memberof PenSkin
 * @private
 * @const
 */
var DefaultPenAttributes = {
    color4f: [0, 0, 1, 1],
    diameter: 1
};

var PenSkin = function (_Skin) {
    _inherits(PenSkin, _Skin);

    /**
     * Create a Skin which implements a Scratch pen layer.
     * @param {int} id - The unique ID for this Skin.
     * @param {RenderWebGL} renderer - The renderer which will use this Skin.
     * @extends Skin
     * @listens RenderWebGL#event:NativeSizeChanged
     */
    function PenSkin(id, renderer) {
        _classCallCheck(this, PenSkin);

        /**
         * @private
         * @type {RenderWebGL}
         */
        var _this = _possibleConstructorReturn(this, (PenSkin.__proto__ || Object.getPrototypeOf(PenSkin)).call(this, id));

        _this._renderer = renderer;

        /** @type {HTMLCanvasElement} */
        _this._canvas = document.createElement('canvas');

        /** @type {boolean} */
        _this._canvasDirty = false;

        /** @type {WebGLTexture} */
        _this._texture = null;

        /** @type {Silhouette} */
        _this._silhouette = new Silhouette();

        /** @type {boolean} */
        _this._silhouetteDirty = false;

        _this.onNativeSizeChanged = _this.onNativeSizeChanged.bind(_this);
        _this._renderer.on(RenderConstants.Events.NativeSizeChanged, _this.onNativeSizeChanged);

        _this._setCanvasSize(renderer.getNativeSize());
        return _this;
    }

    /**
     * Dispose of this object. Do not use it after calling this method.
     */


    _createClass(PenSkin, [{
        key: 'dispose',
        value: function dispose() {
            this._renderer.removeListener(RenderConstants.Events.NativeSizeChanged, this.onNativeSizeChanged);
            this._renderer.gl.deleteTexture(this._texture);
            this._texture = null;
            _get(PenSkin.prototype.__proto__ || Object.getPrototypeOf(PenSkin.prototype), 'dispose', this).call(this);
        }

        /**
         * @returns {boolean} true for a raster-style skin (like a BitmapSkin), false for vector-style (like SVGSkin).
         */

    }, {
        key: 'getTexture',


        /**
         * @return {WebGLTexture} The GL texture representation of this skin when drawing at the given size.
         * @param {int} pixelsWide - The width that the skin will be rendered at, in GPU pixels.
         * @param {int} pixelsTall - The height that the skin will be rendered at, in GPU pixels.
         */
        // eslint-disable-next-line no-unused-vars
        value: function getTexture(pixelsWide, pixelsTall) {
            if (this._canvasDirty) {
                this._canvasDirty = false;

                var gl = this._renderer.gl;
                gl.bindTexture(gl.TEXTURE_2D, this._texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._canvas);
            }

            return this._texture;
        }

        /**
         * Clear the pen layer.
         */

    }, {
        key: 'clear',
        value: function clear() {
            var ctx = this._canvas.getContext('2d');
            ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._canvasDirty = true;
            this._silhouetteDirty = true;
        }

        /**
         * Draw a point on the pen layer.
         * @param {PenAttributes} penAttributes - how the point should be drawn.
         * @param {number} x - the X coordinate of the point to draw.
         * @param {number} y - the Y coordinate of the point to draw.
         */

    }, {
        key: 'drawPoint',
        value: function drawPoint(penAttributes, x, y) {
            // Canvas renders a zero-length line as two end-caps back-to-back, which is what we want.
            this.drawLine(penAttributes, x, y, x, y);
        }

        /**
         * Draw a line on the pen layer.
         * @param {PenAttributes} penAttributes - how the line should be drawn.
         * @param {number} x0 - the X coordinate of the beginning of the line.
         * @param {number} y0 - the Y coordinate of the beginning of the line.
         * @param {number} x1 - the X coordinate of the end of the line.
         * @param {number} y1 - the Y coordinate of the end of the line.
         */

    }, {
        key: 'drawLine',
        value: function drawLine(penAttributes, x0, y0, x1, y1) {
            var ctx = this._canvas.getContext('2d');
            this._setAttributes(ctx, penAttributes);
            ctx.beginPath();
            ctx.moveTo(this._rotationCenter[0] + x0, this._rotationCenter[1] - y0);
            ctx.lineTo(this._rotationCenter[0] + x1, this._rotationCenter[1] - y1);
            ctx.stroke();
            this._canvasDirty = true;
            this._silhouetteDirty = true;
        }

        /**
         * Stamp an image onto the pen layer.
         * @param {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} stampElement - the element to use as the stamp.
         * @param {number} x - the X coordinate of the stamp to draw.
         * @param {number} y - the Y coordinate of the stamp to draw.
         */

    }, {
        key: 'drawStamp',
        value: function drawStamp(stampElement, x, y) {
            var ctx = this._canvas.getContext('2d');
            ctx.drawImage(stampElement, this._rotationCenter[0] + x, this._rotationCenter[1] - y);
            this._canvasDirty = true;
            this._silhouetteDirty = true;
        }

        /**
         * React to a change in the renderer's native size.
         * @param {object} event - The change event.
         */

    }, {
        key: 'onNativeSizeChanged',
        value: function onNativeSizeChanged(event) {
            this._setCanvasSize(event.newSize);
        }

        /**
         * Set the size of the pen canvas.
         * @param {Array<int>} canvasSize - the new width and height for the canvas.
         * @private
         */

    }, {
        key: '_setCanvasSize',
        value: function _setCanvasSize(canvasSize) {
            var _canvasSize = _slicedToArray(canvasSize, 2),
                width = _canvasSize[0],
                height = _canvasSize[1];

            var gl = this._renderer.gl;
            this._canvas.width = width;
            this._canvas.height = height;
            this._rotationCenter[0] = width / 2;
            this._rotationCenter[1] = height / 2;
            this._texture = twgl.createTexture(gl, {
                auto: true,
                mag: gl.NEAREST,
                min: gl.NEAREST,
                wrap: gl.CLAMP_TO_EDGE,
                src: this._canvas
            });
            this._canvasDirty = true;
            this._silhouetteDirty = true;
        }

        /**
         * Set context state to match provided pen attributes.
         * @param {CanvasRenderingContext2D} context - the canvas rendering context to be modified.
         * @param {PenAttributes} penAttributes - the pen attributes to be used.
         * @private
         */

    }, {
        key: '_setAttributes',
        value: function _setAttributes(context, penAttributes) {
            penAttributes = penAttributes || DefaultPenAttributes;
            var color4f = penAttributes.color4f || DefaultPenAttributes.color4f;
            var diameter = penAttributes.diameter || DefaultPenAttributes.diameter;

            var r = Math.round(color4f[0] * 255);
            var g = Math.round(color4f[1] * 255);
            var b = Math.round(color4f[2] * 255);
            var a = color4f[3]; // Alpha is 0 to 1 (not 0 to 255 like r,g,b)

            context.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
            context.lineCap = 'round';
            context.lineWidth = diameter;
        }

        /**
         * Does this point touch an opaque or translucent point on this skin?
         * @param {twgl.v3} vec A texture coordinate.
         * @return {boolean} Did it touch?
         */

    }, {
        key: 'isTouching',
        value: function isTouching(vec) {
            if (this._silhouetteDirty) {
                if (this._canvasDirty) {
                    this.getTexture();
                }
                this._silhouette.update(this._canvas);
            }
            return this._silhouette.isTouching(vec);
        }
    }, {
        key: 'isRaster',
        get: function get() {
            return true;
        }

        /**
         * @return {Array<number>} the "native" size, in texels, of this skin. [width, height]
         */

    }, {
        key: 'size',
        get: function get() {
            return [this._canvas.width, this._canvas.height];
        }
    }]);

    return PenSkin;
}(Skin);

module.exports = PenSkin;

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = "precision mediump float;\n\nuniform float u_fudge;\n\n#ifdef DRAW_MODE_silhouette\nuniform vec4 u_silhouetteColor;\n#else // DRAW_MODE_silhouette\n# ifdef ENABLE_color\nuniform float u_color;\n# endif // ENABLE_color\n# ifdef ENABLE_brightness\nuniform float u_brightness;\n# endif // ENABLE_brightness\n#endif // DRAW_MODE_silhouette\n\n#ifdef DRAW_MODE_colorMask\nuniform vec3 u_colorMask;\nuniform float u_colorMaskTolerance;\n#endif // DRAW_MODE_colorMask\n\n#ifdef ENABLE_fisheye\nuniform float u_fisheye;\n#endif // ENABLE_fisheye\n#ifdef ENABLE_whirl\nuniform float u_whirl;\n#endif // ENABLE_whirl\n#ifdef ENABLE_pixelate\nuniform float u_pixelate;\nuniform vec2 u_skinSize;\n#endif // ENABLE_pixelate\n#ifdef ENABLE_mosaic\nuniform float u_mosaic;\n#endif // ENABLE_mosaic\n#ifdef ENABLE_ghost\nuniform float u_ghost;\n#endif // ENABLE_ghost\n\nuniform sampler2D u_skin;\n\nvarying vec2 v_texCoord;\n\n#if !defined(DRAW_MODE_silhouette) && (defined(ENABLE_color) || defined(ENABLE_brightness))\n// Branchless color conversions based on code from:\n// http://www.chilliant.com/rgb2hsv.html by Ian Taylor\n// Based in part on work by Sam Hocevar and Emil Persson\n// See also: https://en.wikipedia.org/wiki/HSL_and_HSV#Formal_derivation\n\n// Smaller values can cause problems with \"color\" and \"brightness\" effects on some mobile devices\nconst float epsilon = 1e-4;\n\n// Convert an RGB color to Hue, Saturation, and Lightness.\n// All components of input and output are expected to be in the [0,1] range.\nvec3 convertRGB2HSL(vec3 rgb)\n{\n\t// Hue calculation has 3 cases, depending on which RGB component is largest, and one of those cases involves a \"mod\"\n\t// operation. In order to avoid that \"mod\" we split the M==R case in two: one for G<B and one for B>G. The B>G case\n\t// will be calculated in the negative and fed through abs() in the hue calculation at the end.\n\t// See also: https://en.wikipedia.org/wiki/HSL_and_HSV#Hue_and_chroma\n\tconst vec4 hueOffsets = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n\n\t// temp1.xy = sort B & G (largest first)\n\t// temp1.z = the hue offset we'll use if it turns out that R is the largest component (M==R)\n\t// temp1.w = the hue offset we'll use if it turns out that R is not the largest component (M==G or M==B)\n\tvec4 temp1 = rgb.b > rgb.g ? vec4(rgb.bg, hueOffsets.wz) : vec4(rgb.gb, hueOffsets.xy);\n\n\t// temp2.x = the largest component of RGB (\"M\" / \"Max\")\n\t// temp2.yw = the smaller components of RGB, ordered for the hue calculation (not necessarily sorted by magnitude!)\n\t// temp2.z = the hue offset we'll use in the hue calculation\n\tvec4 temp2 = rgb.r > temp1.x ? vec4(rgb.r, temp1.yzx) : vec4(temp1.xyw, rgb.r);\n\n\t// m = the smallest component of RGB (\"min\")\n\tfloat m = min(temp2.y, temp2.w);\n\n\t// Chroma = M - m\n\tfloat C = temp2.x - m;\n\n\t// Lightness = 1/2 * (M + m)\n\tfloat L = 0.5 * (temp2.x + m);\n\n\treturn vec3(\n\t\tabs(temp2.z + (temp2.w - temp2.y) / (6.0 * C + epsilon)), // Hue\n\t\tC / (1.0 - abs(2.0 * L - 1.0) + epsilon), // Saturation\n\t\tL); // Lightness\n}\n\nvec3 convertHue2RGB(float hue)\n{\n\tfloat r = abs(hue * 6.0 - 3.0) - 1.0;\n\tfloat g = 2.0 - abs(hue * 6.0 - 2.0);\n\tfloat b = 2.0 - abs(hue * 6.0 - 4.0);\n\treturn clamp(vec3(r, g, b), 0.0, 1.0);\n}\n\nvec3 convertHSL2RGB(vec3 hsl)\n{\n\tvec3 rgb = convertHue2RGB(hsl.x);\n\tfloat c = (1.0 - abs(2.0 * hsl.z - 1.0)) * hsl.y;\n\treturn (rgb - 0.5) * c + hsl.z;\n}\n#endif // !defined(DRAW_MODE_silhouette) && (defined(ENABLE_color) || defined(ENABLE_brightness))\n\nconst vec2 kCenter = vec2(0.5, 0.5);\n\nvoid main()\n{\n\tvec2 texcoord0 = v_texCoord;\n\n\t#ifdef ENABLE_mosaic\n\ttexcoord0 = fract(u_mosaic * texcoord0);\n\t#endif // ENABLE_mosaic\n\n\t#ifdef ENABLE_pixelate\n\t{\n\t\t// TODO: clean up \"pixel\" edges\n\t\tvec2 pixelTexelSize = u_skinSize / u_pixelate;\n\t\ttexcoord0 = (floor(texcoord0 * pixelTexelSize) + kCenter) / pixelTexelSize;\n\t}\n\t#endif // ENABLE_pixelate\n\n\t#ifdef ENABLE_whirl\n\t{\n\t\tconst float kRadius = 0.5;\n\t\tvec2 offset = texcoord0 - kCenter;\n\t\tfloat offsetMagnitude = length(offset);\n\t\tfloat whirlFactor = max(1.0 - (offsetMagnitude / kRadius), 0.0);\n\t\tfloat whirlActual = u_whirl * whirlFactor * whirlFactor;\n\t\tfloat sinWhirl = sin(whirlActual);\n\t\tfloat cosWhirl = cos(whirlActual);\n\t\tmat2 rotationMatrix = mat2(\n\t\t\tcosWhirl, -sinWhirl,\n\t\t\tsinWhirl, cosWhirl\n\t\t);\n\n\t\ttexcoord0 = rotationMatrix * offset + kCenter;\n\t}\n\t#endif // ENABLE_whirl\n\n\t#ifdef ENABLE_fisheye\n\t{\n\t\tvec2 vec = (texcoord0 - kCenter) / kCenter;\n\t\tfloat vecLength = length(vec);\n\t\tfloat r = pow(min(vecLength, 1.0), u_fisheye) * max(1.0, vecLength);\n\t\tvec2 unit = vec / vecLength;\n\n\t\ttexcoord0 = kCenter + r * unit * kCenter;\n\t}\n\t#endif // ENABLE_fisheye\n\n\tgl_FragColor = texture2D(u_skin, texcoord0);\n\n\n\tif (gl_FragColor.a == 0.0)\n\t{\n\t\tdiscard;\n\t}\n\n    #ifdef ENABLE_ghost\n    gl_FragColor.a *= u_ghost;\n    #endif // ENABLE_ghost\n\n\t#ifdef DRAW_MODE_silhouette\n\t// switch to u_silhouetteColor only AFTER the alpha test\n\tgl_FragColor = u_silhouetteColor;\n\t#else // DRAW_MODE_silhouette\n\n\t#if defined(ENABLE_color) || defined(ENABLE_brightness)\n\t{\n\t\tvec3 hsl = convertRGB2HSL(gl_FragColor.xyz);\n\n\t\t#ifdef ENABLE_color\n\t\t{\n\t\t\t// this code forces grayscale values to be slightly saturated\n\t\t\t// so that some slight change of hue will be visible\n\t\t\tconst float minLightness = 0.11 / 2.0;\n\t\t\tconst float minSaturation = 0.09;\n\t\t\tif (hsl.z < minLightness) hsl = vec3(0.0, 1.0, minLightness);\n\t\t\telse if (hsl.y < minSaturation) hsl = vec3(0.0, minSaturation, hsl.z);\n\n\t\t\thsl.x = mod(hsl.x + u_color, 1.0);\n\t\t\tif (hsl.x < 0.0) hsl.x += 1.0;\n\t\t}\n\t\t#endif // ENABLE_color\n\n\t\t#ifdef ENABLE_brightness\n\t\thsl.z = clamp(hsl.z + u_brightness, 0.0, 1.0);\n\t\t#endif // ENABLE_brightness\n\n\t\tgl_FragColor.rgb = convertHSL2RGB(hsl);\n\t}\n\t#endif // defined(ENABLE_color) || defined(ENABLE_brightness)\n\n\t#ifdef DRAW_MODE_colorMask\n\tvec3 maskDistance = abs(gl_FragColor.rgb - u_colorMask);\n\tvec3 colorMaskTolerance = vec3(u_colorMaskTolerance, u_colorMaskTolerance, u_colorMaskTolerance);\n\tif (any(greaterThan(maskDistance, colorMaskTolerance)))\n\t{\n\t\tdiscard;\n\t}\n\t#endif // DRAW_MODE_colorMask\n\n\t// WebGL defaults to premultiplied alpha\n\tgl_FragColor.rgb *= gl_FragColor.a;\n\n\t#endif // DRAW_MODE_silhouette\n}\n"

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = "uniform mat4 u_projectionMatrix;\nuniform mat4 u_modelMatrix;\n\nattribute vec2 a_position;\nattribute vec2 a_texCoord;\n\nvarying vec2 v_texCoord;\n\nvoid main() {\n    gl_Position = u_projectionMatrix * u_modelMatrix * vec4(a_position, 0, 1);\n    v_texCoord = a_texCoord;\n}\n"

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var twgl = __webpack_require__(0);

var Rectangle = __webpack_require__(7);
var RenderConstants = __webpack_require__(1);
var ShaderManager = __webpack_require__(3);
var Skin = __webpack_require__(2);
var EffectTransform = __webpack_require__(6);

var __isTouchingPosition = twgl.v3.create();

var Drawable = function () {
    /**
     * An object which can be drawn by the renderer.
     * @todo double-buffer all rendering state (position, skin, effects, etc.)
     * @param {!int} id - This Drawable's unique ID.
     * @constructor
     */
    function Drawable(id) {
        _classCallCheck(this, Drawable);

        /** @type {!int} */
        this._id = id;

        /**
         * The uniforms to be used by the vertex and pixel shaders.
         * Some of these are used by other parts of the renderer as well.
         * @type {Object.<string,*>}
         * @private
         */
        this._uniforms = {
            /**
             * The model matrix, to concat with projection at draw time.
             * @type {module:twgl/m4.Mat4}
             */
            u_modelMatrix: twgl.m4.identity(),

            /**
             * The color to use in the silhouette draw mode.
             * @type {Array<number>}
             */
            u_silhouetteColor: Drawable.color4fFromID(this._id)
        };

        // Effect values are uniforms too
        var numEffects = ShaderManager.EFFECTS.length;
        for (var index = 0; index < numEffects; ++index) {
            var effectName = ShaderManager.EFFECTS[index];
            var converter = ShaderManager.EFFECT_INFO[effectName].converter;
            this._uniforms['u_' + effectName] = converter(0);
        }

        this._position = twgl.v3.create(0, 0);
        this._scale = twgl.v3.create(100, 100);
        this._direction = 90;
        this._transformDirty = true;
        this._rotationMatrix = twgl.m4.identity();
        this._rotationTransformDirty = true;
        this._rotationAdjusted = twgl.v3.create();
        this._rotationCenterDirty = true;
        this._skinScale = twgl.v3.create(0, 0, 0);
        this._skinScaleDirty = true;
        this._inverseMatrix = twgl.m4.identity();
        this._inverseTransformDirty = true;
        this._visible = true;
        this._effectBits = 0;

        /** @todo move convex hull functionality, maybe bounds functionality overall, to Skin classes */
        this._convexHullPoints = null;
        this._convexHullDirty = true;

        this._skinWasAltered = this._skinWasAltered.bind(this);
    }

    /**
     * Dispose of this Drawable. Do not use it after calling this method.
     */


    _createClass(Drawable, [{
        key: 'dispose',
        value: function dispose() {
            // Use the setter: disconnect events
            this.skin = null;
        }

        /**
         * Mark this Drawable's transform as dirty.
         * It will be recalculated next time it's needed.
         */

    }, {
        key: 'setTransformDirty',
        value: function setTransformDirty() {
            this._transformDirty = true;
            this._inverseTransformDirty = true;
        }

        /**
         * @returns {number} The ID for this Drawable.
         */

    }, {
        key: 'getEnabledEffects',


        /**
         * @returns {int} A bitmask identifying which effects are currently in use.
         */
        value: function getEnabledEffects() {
            return this._effectBits;
        }

        /**
         * @returns {object.<string, *>} the shader uniforms to be used when rendering this Drawable.
         */

    }, {
        key: 'getUniforms',
        value: function getUniforms() {
            if (this._transformDirty) {
                this._calculateTransform();
            }
            return this._uniforms;
        }

        /**
         * @returns {boolean} whether this Drawable is visible.
         */

    }, {
        key: 'getVisible',
        value: function getVisible() {
            return this._visible;
        }

        /**
         * Update the position, direction, scale, or effect properties of this Drawable.
         * @param {object.<string,*>} properties The new property values to set.
         */

    }, {
        key: 'updateProperties',
        value: function updateProperties(properties) {
            var dirty = false;
            if ('position' in properties && (this._position[0] !== properties.position[0] || this._position[1] !== properties.position[1])) {
                this._position[0] = properties.position[0];
                this._position[1] = properties.position[1];
                dirty = true;
            }
            if ('direction' in properties && this._direction !== properties.direction) {
                this._direction = properties.direction;
                this._rotationTransformDirty = true;
                dirty = true;
            }
            if ('scale' in properties && (this._scale[0] !== properties.scale[0] || this._scale[1] !== properties.scale[1])) {
                this._scale[0] = properties.scale[0];
                this._scale[1] = properties.scale[1];
                this._rotationCenterDirty = true;
                this._skinScaleDirty = true;
                dirty = true;
            }
            if ('visible' in properties) {
                this._visible = properties.visible;
                this.setConvexHullDirty();
            }
            if (dirty) {
                this.setTransformDirty();
            }
            var numEffects = ShaderManager.EFFECTS.length;
            for (var index = 0; index < numEffects; ++index) {
                var effectName = ShaderManager.EFFECTS[index];
                if (effectName in properties) {
                    var rawValue = properties[effectName];
                    var effectInfo = ShaderManager.EFFECT_INFO[effectName];
                    if (rawValue) {
                        this._effectBits |= effectInfo.mask;
                    } else {
                        this._effectBits &= ~effectInfo.mask;
                    }
                    var converter = effectInfo.converter;
                    this._uniforms['u_' + effectName] = converter(rawValue);
                    if (effectInfo.shapeChanges) {
                        this.setConvexHullDirty();
                    }
                }
            }
        }

        /**
         * Calculate the transform to use when rendering this Drawable.
         * @private
         */

    }, {
        key: '_calculateTransform',
        value: function _calculateTransform() {
            if (this._rotationTransformDirty) {
                var rotation = (270 - this._direction) * Math.PI / 180;

                // Calling rotationZ sets the destination matrix to a rotation
                // around the Z axis setting matrix components 0, 1, 4 and 5 with
                // cosine and sine values of the rotation.
                // twgl.m4.rotationZ(rotation, this._rotationMatrix);

                // twgl assumes the last value set to the matrix was anything.
                // Drawable knows, it was another rotationZ matrix, so we can skip
                // assigning the values that will never change.
                var c = Math.cos(rotation);
                var s = Math.sin(rotation);
                this._rotationMatrix[0] = c;
                this._rotationMatrix[1] = s;
                // this._rotationMatrix[2] = 0;
                // this._rotationMatrix[3] = 0;
                this._rotationMatrix[4] = -s;
                this._rotationMatrix[5] = c;
                // this._rotationMatrix[6] = 0;
                // this._rotationMatrix[7] = 0;
                // this._rotationMatrix[8] = 0;
                // this._rotationMatrix[9] = 0;
                // this._rotationMatrix[10] = 1;
                // this._rotationMatrix[11] = 0;
                // this._rotationMatrix[12] = 0;
                // this._rotationMatrix[13] = 0;
                // this._rotationMatrix[14] = 0;
                // this._rotationMatrix[15] = 1;

                this._rotationTransformDirty = false;
            }

            // Adjust rotation center relative to the skin.
            if (this._rotationCenterDirty && this.skin !== null) {
                // twgl version of the following in function work.
                // let rotationAdjusted = twgl.v3.subtract(
                //     this.skin.rotationCenter,
                //     twgl.v3.divScalar(this.skin.size, 2, this._rotationAdjusted),
                //     this._rotationAdjusted
                // );
                // rotationAdjusted = twgl.v3.multiply(
                //     rotationAdjusted, this._scale, rotationAdjusted
                // );
                // rotationAdjusted = twgl.v3.divScalar(
                //     rotationAdjusted, 100, rotationAdjusted
                // );
                // rotationAdjusted[1] *= -1; // Y flipped to Scratch coordinate.
                // rotationAdjusted[2] = 0; // Z coordinate is 0.

                // Locally assign rotationCenter and skinSize to keep from having
                // the Skin getter properties called twice while locally assigning
                // their components for readability.
                var rotationCenter = this.skin.rotationCenter;
                var skinSize = this.skin.size;
                var center0 = rotationCenter[0];
                var center1 = rotationCenter[1];
                var skinSize0 = skinSize[0];
                var skinSize1 = skinSize[1];
                var _scale = this._scale[0];
                var _scale2 = this._scale[1];

                var rotationAdjusted = this._rotationAdjusted;
                rotationAdjusted[0] = (center0 - skinSize0 / 2) * _scale / 100;
                rotationAdjusted[1] = (center1 - skinSize1 / 2) * _scale2 / 100 * -1;
                // rotationAdjusted[2] = 0;

                this._rotationCenterDirty = false;
            }

            if (this._skinScaleDirty && this.skin !== null) {
                // twgl version of the following in function work.
                // const scaledSize = twgl.v3.divScalar(
                //     twgl.v3.multiply(this.skin.size, this._scale),
                //     100
                // );
                // // was NaN because the vectors have only 2 components.
                // scaledSize[2] = 0;

                // Locally assign skinSize to keep from having the Skin getter
                // properties called twice.
                var _skinSize = this.skin.size;
                var scaledSize = this._skinScale;
                scaledSize[0] = _skinSize[0] * this._scale[0] / 100;
                scaledSize[1] = _skinSize[1] * this._scale[1] / 100;
                // scaledSize[2] = 0;

                this._skinScaleDirty = false;
            }

            var modelMatrix = this._uniforms.u_modelMatrix;

            // twgl version of the following in function work.
            // twgl.m4.identity(modelMatrix);
            // twgl.m4.translate(modelMatrix, this._position, modelMatrix);
            // twgl.m4.multiply(modelMatrix, this._rotationMatrix, modelMatrix);
            // twgl.m4.translate(modelMatrix, this._rotationAdjusted, modelMatrix);
            // twgl.m4.scale(modelMatrix, scaledSize, modelMatrix);

            // Drawable configures a 3D matrix for drawing in WebGL, but most values
            // will never be set because the inputs are on the X and Y position axis
            // and the Z rotation axis. Drawable can bring the work inside
            // _calculateTransform and greatly reduce the ammount of math and array
            // assignments needed.

            var scale0 = this._skinScale[0];
            var scale1 = this._skinScale[1];
            var rotation00 = this._rotationMatrix[0];
            var rotation01 = this._rotationMatrix[1];
            var rotation10 = this._rotationMatrix[4];
            var rotation11 = this._rotationMatrix[5];
            var adjusted0 = this._rotationAdjusted[0];
            var adjusted1 = this._rotationAdjusted[1];
            var position0 = this._position[0];
            var position1 = this._position[1];

            // Commented assignments show what the values are when the matrix was
            // instantiated. Those values will never change so they do not need to
            // be reassigned.
            modelMatrix[0] = scale0 * rotation00;
            modelMatrix[1] = scale0 * rotation01;
            // modelMatrix[2] = 0;
            // modelMatrix[3] = 0;
            modelMatrix[4] = scale1 * rotation10;
            modelMatrix[5] = scale1 * rotation11;
            // modelMatrix[6] = 0;
            // modelMatrix[7] = 0;
            // modelMatrix[8] = 0;
            // modelMatrix[9] = 0;
            // modelMatrix[10] = 1;
            // modelMatrix[11] = 0;
            modelMatrix[12] = rotation00 * adjusted0 + rotation10 * adjusted1 + position0;
            modelMatrix[13] = rotation01 * adjusted0 + rotation11 * adjusted1 + position1;
            // modelMatrix[14] = 0;
            // modelMatrix[15] = 1;

            this._transformDirty = false;
        }

        /**
         * Whether the Drawable needs convex hull points provided by the renderer.
         * @return {boolean} True when no convex hull known, or it's dirty.
         */

    }, {
        key: 'needsConvexHullPoints',
        value: function needsConvexHullPoints() {
            return !this._convexHullPoints || this._convexHullDirty || this._convexHullPoints.length === 0;
        }

        /**
         * Set the convex hull to be dirty.
         * Do this whenever the Drawable's shape has possibly changed.
         */

    }, {
        key: 'setConvexHullDirty',
        value: function setConvexHullDirty() {
            this._convexHullDirty = true;
        }

        /**
         * Set the convex hull points for the Drawable.
         * @param {Array<Array<number>>} points Convex hull points, as [[x, y], ...]
         */

    }, {
        key: 'setConvexHullPoints',
        value: function setConvexHullPoints(points) {
            this._convexHullPoints = points;
            this._convexHullDirty = false;
        }

        /**
         * Check if the world position touches the skin.
         * @param {twgl.v3} vec World coordinate vector.
         * @return {boolean} True if the world position touches the skin.
         */

    }, {
        key: 'isTouching',
        value: function isTouching(vec) {
            if (!this.skin) {
                return false;
            }

            if (this._transformDirty) {
                this._calculateTransform();
            }

            // Get the inverse of the model matrix or update it.
            var inverse = this._inverseMatrix;
            if (this._inverseTransformDirty) {
                var model = twgl.m4.copy(this._uniforms.u_modelMatrix, inverse);
                // The normal matrix uses a z scaling of 0 causing model[10] to be
                // 0. Getting a 4x4 inverse is impossible without a scaling in x, y,
                // and z.
                model[10] = 1;
                twgl.m4.inverse(model, model);
                this._inverseTransformDirty = false;
            }

            // Transfrom from world coordinates to Drawable coordinates.
            var localPosition = twgl.m4.transformPoint(inverse, vec, __isTouchingPosition);

            // Transform into texture coordinates. 0, 0 is the bottom left. 1, 1 is
            // the top right.
            localPosition[0] += 0.5;
            localPosition[1] += 0.5;
            // The RenderWebGL quad flips the texture's X axis. So rendered bottom
            // left is 1, 0 and the top right is 0, 1. Flip the X axis so
            // localPosition matches that transformation.
            localPosition[0] = 1 - localPosition[0];

            // Apply texture effect transform.
            EffectTransform.transformPoint(this, localPosition, localPosition);

            return this.skin.isTouching(localPosition);
        }

        /**
         * Get the precise bounds for a Drawable.
         * This function applies the transform matrix to the known convex hull,
         * and then finds the minimum box along the axes.
         * Before calling this, ensure the renderer has updated convex hull points.
         * @return {!Rectangle} Bounds for a tight box around the Drawable.
         */

    }, {
        key: 'getBounds',
        value: function getBounds() {
            if (this.needsConvexHullPoints()) {
                throw new Error('Needs updated convex hull points before bounds calculation.');
            }
            if (this._transformDirty) {
                this._calculateTransform();
            }
            var transformedHullPoints = this._getTransformedHullPoints();
            // Search through transformed points to generate box on axes.
            var bounds = new Rectangle();
            bounds.initFromPointsAABB(transformedHullPoints);
            return bounds;
        }
        /**
         * Get the precise bounds for the upper 8px slice of the Drawable.
         * Used for calculating where to position a text bubble.
         * Before calling this, ensure the renderer has updated convex hull points.
         * @return {!Rectangle} Bounds for a tight box around a slice of the Drawable.
         */

    }, {
        key: 'getBoundsForBubble',
        value: function getBoundsForBubble() {
            if (this.needsConvexHullPoints()) {
                throw new Error('Needs updated convex hull points before bubble bounds calculation.');
            }
            if (this._transformDirty) {
                this._calculateTransform();
            }
            var slice = 8; // px, how tall the top slice to measure should be.
            var transformedHullPoints = this._getTransformedHullPoints();
            var maxY = Math.max.apply(null, transformedHullPoints.map(function (p) {
                return p[1];
            }));
            var filteredHullPoints = transformedHullPoints.filter(function (p) {
                return p[1] > maxY - slice;
            });
            // Search through filtered points to generate box on axes.
            var bounds = new Rectangle();
            bounds.initFromPointsAABB(filteredHullPoints);
            return bounds;
        }

        /**
         * Get the rough axis-aligned bounding box for the Drawable.
         * Calculated by transforming the skin's bounds.
         * Note that this is less precise than the box returned by `getBounds`,
         * which is tightly snapped to account for a Drawable's transparent regions.
         * `getAABB` returns a much less accurate bounding box, but will be much
         * faster to calculate so may be desired for quick checks/optimizations.
         * @return {!Rectangle} Rough axis-aligned bounding box for Drawable.
         */

    }, {
        key: 'getAABB',
        value: function getAABB() {
            if (this._transformDirty) {
                this._calculateTransform();
            }
            var tm = this._uniforms.u_modelMatrix;
            var bounds = new Rectangle();
            bounds.initFromPointsAABB([twgl.m4.transformPoint(tm, [-0.5, -0.5, 0]), twgl.m4.transformPoint(tm, [0.5, -0.5, 0]), twgl.m4.transformPoint(tm, [-0.5, 0.5, 0]), twgl.m4.transformPoint(tm, [0.5, 0.5, 0])]);
            return bounds;
        }

        /**
         * Return the best Drawable bounds possible without performing graphics queries.
         * I.e., returns the tight bounding box when the convex hull points are already
         * known, but otherwise return the rough AABB of the Drawable.
         * @return {!Rectangle} Bounds for the Drawable.
         */

    }, {
        key: 'getFastBounds',
        value: function getFastBounds() {
            if (!this.needsConvexHullPoints()) {
                return this.getBounds();
            }
            return this.getAABB();
        }

        /**
         * Transform all the convex hull points by the current Drawable's
         * transform. This allows us to skip recalculating the convex hull
         * for many Drawable updates, including translation, rotation, scaling.
         * @return {!Array.<!Array.number>} Array of glPoints which are Array<x, y>
         * @private
         */

    }, {
        key: '_getTransformedHullPoints',
        value: function _getTransformedHullPoints() {
            var projection = twgl.m4.ortho(-1, 1, -1, 1, -1, 1);
            var skinSize = this.skin.size;
            var tm = twgl.m4.multiply(this._uniforms.u_modelMatrix, projection);
            var transformedHullPoints = [];
            for (var i = 0; i < this._convexHullPoints.length; i++) {
                var point = this._convexHullPoints[i];
                var glPoint = twgl.v3.create(0.5 + -point[0] / skinSize[0], point[1] / skinSize[1] - 0.5, 0);
                twgl.m4.transformPoint(tm, glPoint, glPoint);
                transformedHullPoints.push(glPoint);
            }
            return transformedHullPoints;
        }

        /**
         * Respond to an internal change in the current Skin.
         * @private
         */

    }, {
        key: '_skinWasAltered',
        value: function _skinWasAltered() {
            this._rotationCenterDirty = true;
            this._skinScaleDirty = true;
            this.setConvexHullDirty();
            this.setTransformDirty();
        }

        /**
         * Calculate a color to represent the given ID number. At least one component of
         * the resulting color will be non-zero if the ID is not RenderConstants.ID_NONE.
         * @param {int} id The ID to convert.
         * @returns {Array<number>} An array of [r,g,b,a], each component in the range [0,1].
         */

    }, {
        key: 'id',
        get: function get() {
            return this._id;
        }

        /**
         * @returns {Skin} the current skin for this Drawable.
         */

    }, {
        key: 'skin',
        get: function get() {
            return this._skin;
        }

        /**
         * @param {Skin} newSkin - A new Skin for this Drawable.
         */
        ,
        set: function set(newSkin) {
            if (this._skin !== newSkin) {
                if (this._skin) {
                    this._skin.removeListener(Skin.Events.WasAltered, this._skinWasAltered);
                }
                this._skin = newSkin;
                if (this._skin) {
                    this._skin.addListener(Skin.Events.WasAltered, this._skinWasAltered);
                }
                this._skinWasAltered();
            }
        }

        /**
         * @returns {Array<number>} the current scaling percentages applied to this Drawable. [100,100] is normal size.
         */

    }, {
        key: 'scale',
        get: function get() {
            return [this._scale[0], this._scale[1]];
        }
    }], [{
        key: 'color4fFromID',
        value: function color4fFromID(id) {
            id -= RenderConstants.ID_NONE;
            var r = (id >> 0 & 255) / 255.0;
            var g = (id >> 8 & 255) / 255.0;
            var b = (id >> 16 & 255) / 255.0;
            return [r, g, b, 1.0];
        }

        /**
         * Calculate the ID number represented by the given color. If all components of
         * the color are zero, the result will be RenderConstants.ID_NONE; otherwise the result
         * will be a valid ID.
         * @param {int} r The red value of the color, in the range [0,255].
         * @param {int} g The green value of the color, in the range [0,255].
         * @param {int} b The blue value of the color, in the range [0,255].
         * @returns {int} The ID represented by that color.
         */

    }, {
        key: 'color3bToID',
        value: function color3bToID(r, g, b) {
            var id = void 0;
            id = (r & 255) << 0;
            id |= (g & 255) << 8;
            id |= (b & 255) << 16;
            return id + RenderConstants.ID_NONE;
        }
    }]);

    return Drawable;
}();

module.exports = Drawable;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var twgl = __webpack_require__(0);

var Skin = __webpack_require__(2);
var Silhouette = __webpack_require__(4);

var BitmapSkin = function (_Skin) {
    _inherits(BitmapSkin, _Skin);

    /**
     * Create a new Bitmap Skin.
     * @extends Skin
     * @param {!int} id - The ID for this Skin.
     * @param {!RenderWebGL} renderer - The renderer which will use this skin.
     */
    function BitmapSkin(id, renderer) {
        _classCallCheck(this, BitmapSkin);

        /** @type {!int} */
        var _this = _possibleConstructorReturn(this, (BitmapSkin.__proto__ || Object.getPrototypeOf(BitmapSkin)).call(this, id));

        _this._costumeResolution = 1;

        /** @type {!RenderWebGL} */
        _this._renderer = renderer;

        /** @type {WebGLTexture} */
        _this._texture = null;

        /** @type {Array<int>} */
        _this._textureSize = [0, 0];

        _this._silhouette = new Silhouette();
        return _this;
    }

    /**
     * Dispose of this object. Do not use it after calling this method.
     */


    _createClass(BitmapSkin, [{
        key: 'dispose',
        value: function dispose() {
            if (this._texture) {
                this._renderer.gl.deleteTexture(this._texture);
                this._texture = null;
            }
            _get(BitmapSkin.prototype.__proto__ || Object.getPrototypeOf(BitmapSkin.prototype), 'dispose', this).call(this);
        }

        /**
         * @returns {boolean} true for a raster-style skin (like a BitmapSkin), false for vector-style (like SVGSkin).
         */

    }, {
        key: 'getTexture',


        /**
         * @param {Array<number>} scale - The scaling factors to be used.
         * @return {WebGLTexture} The GL texture representation of this skin when drawing at the given scale.
         */
        // eslint-disable-next-line no-unused-vars
        value: function getTexture(scale) {
            return this._texture;
        }

        /**
         * Set the contents of this skin to a snapshot of the provided bitmap data.
         * @param {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} bitmapData - new contents for this skin.
         * @param {int} [costumeResolution=1] - The resolution to use for this bitmap.
         * @param {Array<number>} [rotationCenter] - Optional rotation center for the bitmap. If not supplied, it will be
         * calculated from the bounding box
         * @fires Skin.event:WasAltered
         */

    }, {
        key: 'setBitmap',
        value: function setBitmap(bitmapData, costumeResolution, rotationCenter) {
            var gl = this._renderer.gl;

            if (this._texture) {
                gl.bindTexture(gl.TEXTURE_2D, this._texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmapData);
                this._silhouette.update(bitmapData);
            } else {
                // TODO: mipmaps?
                var textureOptions = {
                    auto: true,
                    wrap: gl.CLAMP_TO_EDGE,
                    src: bitmapData
                };

                this._texture = twgl.createTexture(gl, textureOptions);
                this._silhouette.update(bitmapData);
            }

            // Do these last in case any of the above throws an exception
            this._costumeResolution = costumeResolution || 2;
            this._textureSize = BitmapSkin._getBitmapSize(bitmapData);

            if (typeof rotationCenter === 'undefined') rotationCenter = this.calculateRotationCenter();
            this.setRotationCenter.apply(this, rotationCenter);

            this.emit(Skin.Events.WasAltered);
        }

        /**
         * @param {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} bitmapData - bitmap data to inspect.
         * @returns {Array<int>} the width and height of the bitmap data, in pixels.
         * @private
         */

    }, {
        key: 'isTouching',


        /**
         * Does this point touch an opaque or translucent point on this skin?
         * @param {twgl.v3} vec A texture coordinate.
         * @return {boolean} Did it touch?
         */
        value: function isTouching(vec) {
            return this._silhouette.isTouching(vec);
        }
    }, {
        key: 'isRaster',
        get: function get() {
            return true;
        }

        /**
         * @return {Array<number>} the "native" size, in texels, of this skin.
         */

    }, {
        key: 'size',
        get: function get() {
            return [this._textureSize[0] / this._costumeResolution, this._textureSize[1] / this._costumeResolution];
        }
    }], [{
        key: '_getBitmapSize',
        value: function _getBitmapSize(bitmapData) {
            if (bitmapData instanceof HTMLImageElement) {
                return [bitmapData.naturalWidth || bitmapData.width, bitmapData.naturalHeight || bitmapData.height];
            }

            if (bitmapData instanceof HTMLVideoElement) {
                return [bitmapData.videoWidth || bitmapData.width, bitmapData.videoHeight || bitmapData.height];
            }

            // ImageData or HTMLCanvasElement
            return [bitmapData.width, bitmapData.height];
        }
    }]);

    return BitmapSkin;
}(Skin);

module.exports = BitmapSkin;

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("hull.js");

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = __webpack_require__(8);

var hull = __webpack_require__(24);
var twgl = __webpack_require__(0);

var BitmapSkin = __webpack_require__(23);
var Drawable = __webpack_require__(22);
var Rectangle = __webpack_require__(7);
var PenSkin = __webpack_require__(19);
var RenderConstants = __webpack_require__(1);
var ShaderManager = __webpack_require__(3);
var SVGSkin = __webpack_require__(18);
var SVGTextBubble = __webpack_require__(17);
var EffectTransform = __webpack_require__(6);

/**
 * @callback RenderWebGL#idFilterFunc
 * @param {int} drawableID The ID to filter.
 * @return {bool} True if the ID passes the filter, otherwise false.
 */

/**
 * Maximum touch size for a picking check.
 * @todo Figure out a reasonable max size. Maybe this should be configurable?
 * @type {Array<int>}
 * @memberof RenderWebGL
 */
var MAX_TOUCH_SIZE = [3, 3];

/**
 * "touching {color}?" or "{color} touching {color}?" tests will be true if the
 * target is touching a color whose components are each within this tolerance of
 * the corresponding component of the query color.
 * between 0 (exact matches only) and 255 (match anything).
 * @type {object.<string,int>}
 * @memberof RenderWebGL
 */
var TOLERANCE_TOUCHING_COLOR = {
    R: 7,
    G: 7,
    B: 15,
    Mask: 2
};

/**
 * Constant used for masking when detecting the color white
 * @type {Array<int>}
 * @memberof RenderWebGL
 */
var COLOR_BLACK = [0, 0, 0, 1];

/**
 * Sprite Fencing - The number of pixels a sprite is required to leave remaining
 * onscreen around the edge of the staging area.
 * @type {number}
 */
var FENCE_WIDTH = 15;

var RenderWebGL = function (_EventEmitter) {
    _inherits(RenderWebGL, _EventEmitter);

    _createClass(RenderWebGL, null, [{
        key: 'isSupported',

        /**
         * Check if this environment appears to support this renderer before attempting to create an instance.
         * Catching an exception from the constructor is also a valid way to test for (lack of) support.
         * @param {canvas} [optCanvas] - An optional canvas to use for the test. Otherwise a temporary canvas will be used.
         * @returns {boolean} - True if this environment appears to support this renderer, false otherwise.
         */
        value: function isSupported(optCanvas) {
            try {
                // Create the context the same way that the constructor will: attributes may make the difference.
                return !!RenderWebGL._getContext(optCanvas || document.createElement('canvas'));
            } catch (e) {
                return false;
            }
        }

        /**
         * Ask TWGL to create a rendering context with the attributes used by this renderer.
         * @param {canvas} canvas - attach the context to this canvas.
         * @returns {WebGLRenderingContext} - a TWGL rendering context (backed by either WebGL 1.0 or 2.0).
         * @private
         */

    }, {
        key: '_getContext',
        value: function _getContext(canvas) {
            return twgl.getWebGLContext(canvas, { alpha: false, stencil: true });
        }

        /**
         * Create a renderer for drawing Scratch sprites to a canvas using WebGL.
         * Coordinates will default to Scratch 2.0 values if unspecified.
         * The stage's "native" size will be calculated from the these coordinates.
         * For example, the defaults result in a native size of 480x360.
         * Queries such as "touching color?" will always execute at the native size.
         * @see RenderWebGL#setStageSize
         * @see RenderWebGL#resize
         * @param {canvas} canvas The canvas to draw onto.
         * @param {int} [xLeft=-240] The x-coordinate of the left edge.
         * @param {int} [xRight=240] The x-coordinate of the right edge.
         * @param {int} [yBottom=-180] The y-coordinate of the bottom edge.
         * @param {int} [yTop=180] The y-coordinate of the top edge.
         * @constructor
         * @listens RenderWebGL#event:NativeSizeChanged
         */

    }]);

    function RenderWebGL(canvas, xLeft, xRight, yBottom, yTop) {
        _classCallCheck(this, RenderWebGL);

        /** @type {WebGLRenderingContext} */
        var _this = _possibleConstructorReturn(this, (RenderWebGL.__proto__ || Object.getPrototypeOf(RenderWebGL)).call(this));

        var gl = _this._gl = RenderWebGL._getContext(canvas);
        if (!gl) {
            throw new Error('Could not get WebGL context: this browser or environment may not support WebGL.');
        }

        /** @type {Drawable[]} */
        _this._allDrawables = [];

        /** @type {Skin[]} */
        _this._allSkins = [];

        /** @type {Array<int>} */
        _this._drawList = [];

        /** @type {int} */
        _this._nextDrawableId = RenderConstants.ID_NONE + 1;

        /** @type {int} */
        _this._nextSkinId = RenderConstants.ID_NONE + 1;

        /** @type {module:twgl/m4.Mat4} */
        _this._projection = twgl.m4.identity();

        /** @type {ShaderManager} */
        _this._shaderManager = new ShaderManager(gl);

        /** @type {HTMLCanvasElement} */
        _this._tempCanvas = document.createElement('canvas');

        _this._svgTextBubble = new SVGTextBubble();

        _this._createGeometry();

        _this.on(RenderConstants.Events.NativeSizeChanged, _this.onNativeSizeChanged);

        _this.setBackgroundColor(1, 1, 1);
        _this.setStageSize(xLeft || -240, xRight || 240, yBottom || -180, yTop || 180);
        _this.resize(_this._nativeSize[0], _this._nativeSize[1]);

        gl.disable(gl.DEPTH_TEST);
        /** @todo disable when no partial transparency? */
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
        return _this;
    }

    /**
     * @returns {WebGLRenderingContext} the WebGL rendering context associated with this renderer.
     */


    _createClass(RenderWebGL, [{
        key: 'resize',


        /**
         * Set the physical size of the stage in device-independent pixels.
         * This will be multiplied by the device's pixel ratio on high-DPI displays.
         * @param {int} pixelsWide The desired width in device-independent pixels.
         * @param {int} pixelsTall The desired height in device-independent pixels.
         */
        value: function resize(pixelsWide, pixelsTall) {
            var pixelRatio = window.devicePixelRatio || 1;
            this._gl.canvas.width = pixelsWide * pixelRatio;
            this._gl.canvas.height = pixelsTall * pixelRatio;
        }

        /**
         * Set the background color for the stage. The stage will be cleared with this
         * color each frame.
         * @param {number} red The red component for the background.
         * @param {number} green The green component for the background.
         * @param {number} blue The blue component for the background.
         */

    }, {
        key: 'setBackgroundColor',
        value: function setBackgroundColor(red, green, blue) {
            this._backgroundColor = [red, green, blue, 1];
        }

        /**
         * Tell the renderer to draw various debug information to the provided canvas
         * during certain operations.
         * @param {canvas} canvas The canvas to use for debug output.
         */

    }, {
        key: 'setDebugCanvas',
        value: function setDebugCanvas(canvas) {
            this._debugCanvas = canvas;
        }

        /**
         * Set logical size of the stage in Scratch units.
         * @param {int} xLeft The left edge's x-coordinate. Scratch 2 uses -240.
         * @param {int} xRight The right edge's x-coordinate. Scratch 2 uses 240.
         * @param {int} yBottom The bottom edge's y-coordinate. Scratch 2 uses -180.
         * @param {int} yTop The top edge's y-coordinate. Scratch 2 uses 180.
         */

    }, {
        key: 'setStageSize',
        value: function setStageSize(xLeft, xRight, yBottom, yTop) {
            this._xLeft = xLeft;
            this._xRight = xRight;
            this._yBottom = yBottom;
            this._yTop = yTop;

            // swap yBottom & yTop to fit Scratch convention of +y=up
            this._projection = twgl.m4.ortho(xLeft, xRight, yBottom, yTop, -1, 1);

            this._setNativeSize(Math.abs(xRight - xLeft), Math.abs(yBottom - yTop));
        }

        /**
         * @return {Array<int>} the "native" size of the stage, which is used for pen, query renders, etc.
         */

    }, {
        key: 'getNativeSize',
        value: function getNativeSize() {
            return [this._nativeSize[0], this._nativeSize[1]];
        }

        /**
         * Set the "native" size of the stage, which is used for pen, query renders, etc.
         * @param {int} width - the new width to set.
         * @param {int} height - the new height to set.
         * @private
         * @fires RenderWebGL#event:NativeSizeChanged
         */

    }, {
        key: '_setNativeSize',
        value: function _setNativeSize(width, height) {
            this._nativeSize = [width, height];
            this.emit(RenderConstants.Events.NativeSizeChanged, { newSize: this._nativeSize });
        }

        /**
         * Create a new bitmap skin from a snapshot of the provided bitmap data.
         * @param {ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} bitmapData - new contents for this skin.
         * @param {!int} [costumeResolution=1] - The resolution to use for this bitmap.
         * @param {?Array<number>} [rotationCenter] Optional: rotation center of the skin. If not supplied, the center of
         * the skin will be used.
         * @returns {!int} the ID for the new skin.
         */

    }, {
        key: 'createBitmapSkin',
        value: function createBitmapSkin(bitmapData, costumeResolution, rotationCenter) {
            var skinId = this._nextSkinId++;
            var newSkin = new BitmapSkin(skinId, this);
            newSkin.setBitmap(bitmapData, costumeResolution, rotationCenter);
            this._allSkins[skinId] = newSkin;
            return skinId;
        }

        /**
         * Create a new SVG skin.
         * @param {!string} svgData - new SVG to use.
         * @param {?Array<number>} rotationCenter Optional: rotation center of the skin. If not supplied, the center of the
         * skin will be used
         * @returns {!int} the ID for the new skin.
         */

    }, {
        key: 'createSVGSkin',
        value: function createSVGSkin(svgData, rotationCenter) {
            var skinId = this._nextSkinId++;
            var newSkin = new SVGSkin(skinId, this);
            newSkin.setSVG(svgData, rotationCenter);
            this._allSkins[skinId] = newSkin;
            return skinId;
        }

        /**
         * Create a new PenSkin - a skin which implements a Scratch pen layer.
         * @returns {!int} the ID for the new skin.
         */

    }, {
        key: 'createPenSkin',
        value: function createPenSkin() {
            var skinId = this._nextSkinId++;
            var newSkin = new PenSkin(skinId, this);
            this._allSkins[skinId] = newSkin;
            return skinId;
        }

        /**
         * Create a new SVG skin using the text bubble svg creator. The rotation center
         * is always placed at the top left.
         * @param {!string} type - either "say" or "think".
         * @param {!string} text - the text for the bubble.
         * @param {!boolean} pointsLeft - which side the bubble is pointing.
         * @returns {!int} the ID for the new skin.
         */

    }, {
        key: 'createTextSkin',
        value: function createTextSkin(type, text, pointsLeft) {
            var bubbleSvg = this._svgTextBubble.buildString(type, text, pointsLeft);
            return this.createSVGSkin(bubbleSvg, [0, 0]);
        }

        /**
         * Update an existing SVG skin, or create an SVG skin if the previous skin was not SVG.
         * @param {!int} skinId the ID for the skin to change.
         * @param {!string} svgData - new SVG to use.
         * @param {?Array<number>} rotationCenter Optional: rotation center of the skin. If not supplied, the center of the
         * skin will be used
         */

    }, {
        key: 'updateSVGSkin',
        value: function updateSVGSkin(skinId, svgData, rotationCenter) {
            if (this._allSkins[skinId] instanceof SVGSkin) {
                this._allSkins[skinId].setSVG(svgData, rotationCenter);
                return;
            }

            var newSkin = new SVGSkin(skinId, this);
            newSkin.setSVG(svgData, rotationCenter);
            this._reskin(skinId, newSkin);
        }

        /**
         * Update an existing bitmap skin, or create a bitmap skin if the previous skin was not bitmap.
         * @param {!int} skinId the ID for the skin to change.
         * @param {!string} imgData - new bitmap to use.
         * @param {?Array<number>} rotationCenter Optional: rotation center of the skin. If not supplied, the center of the
         * skin will be used
         */

    }, {
        key: 'updateBitmapSkin',
        value: function updateBitmapSkin(skinId, imgData, rotationCenter) {
            // Divide rotation center by 2 and set bitmap resolution = 2 because all images coming from paint editor
            // are double resolution
            var updatedRotationCenter = rotationCenter ? [Math.floor(rotationCenter[0] / 2), Math.floor(rotationCenter[1] / 2)] : null;
            if (this._allSkins[skinId] instanceof BitmapSkin) {
                this._allSkins[skinId].setBitmap(imgData, 2, updatedRotationCenter);
                return;
            }

            var newSkin = new BitmapSkin(skinId, this);
            newSkin.setBitmap(imgData, 2, updatedRotationCenter);
            this._reskin(skinId, newSkin);
        }
    }, {
        key: '_reskin',
        value: function _reskin(skinId, newSkin) {
            var oldSkin = this._allSkins[skinId];
            this._allSkins[skinId] = newSkin;

            // Tell drawables to update
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._allDrawables[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var drawable = _step.value;

                    if (drawable && drawable.skin === oldSkin) {
                        drawable.skin = newSkin;
                        drawable.setConvexHullDirty();
                        drawable.setTransformDirty();
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            oldSkin.dispose();
        }

        /**
         * Update a skin using the text bubble svg creator.
         * @param {!int} skinId the ID for the skin to change.
         * @param {!string} type - either "say" or "think".
         * @param {!string} text - the text for the bubble.
         * @param {!boolean} pointsLeft - which side the bubble is pointing.
         */

    }, {
        key: 'updateTextSkin',
        value: function updateTextSkin(skinId, type, text, pointsLeft) {
            var bubbleSvg = this._svgTextBubble.buildString(type, text, pointsLeft);
            this.updateSVGSkin(skinId, bubbleSvg, [0, 0]);
        }

        /**
         * Destroy an existing skin. Do not use the skin or its ID after calling this.
         * @param {!int} skinId - The ID of the skin to destroy.
         */

    }, {
        key: 'destroySkin',
        value: function destroySkin(skinId) {
            var oldSkin = this._allSkins[skinId];
            oldSkin.dispose();
            delete this._allSkins[skinId];
        }

        /**
         * Create a new Drawable and add it to the scene.
         * @returns {int} The ID of the new Drawable.
         */

    }, {
        key: 'createDrawable',
        value: function createDrawable() {
            var drawableID = this._nextDrawableId++;
            var drawable = new Drawable(drawableID);
            this._allDrawables[drawableID] = drawable;
            this._drawList.push(drawableID);

            drawable.skin = null;

            return drawableID;
        }

        /**
         * Destroy a Drawable, removing it from the scene.
         * @param {int} drawableID The ID of the Drawable to remove.
         */

    }, {
        key: 'destroyDrawable',
        value: function destroyDrawable(drawableID) {
            var drawable = this._allDrawables[drawableID];
            drawable.dispose();
            delete this._allDrawables[drawableID];

            var index = void 0;
            while ((index = this._drawList.indexOf(drawableID)) >= 0) {
                this._drawList.splice(index, 1);
            }
        }

        /**
         * Set a drawable's order in the drawable list (effectively, z/layer).
         * Can be used to move drawables to absolute positions in the list,
         * or relative to their current positions.
         * "go back N layers": setDrawableOrder(id, -N, true, 1); (assuming stage at 0).
         * "go to back": setDrawableOrder(id, 1); (assuming stage at 0).
         * "go to front": setDrawableOrder(id, Infinity);
         * @param {int} drawableID ID of Drawable to reorder.
         * @param {number} order New absolute order or relative order adjusment.
         * @param {boolean=} optIsRelative If set, `order` refers to a relative change.
         * @param {number=} optMin If set, order constrained to be at least `optMin`.
         * @return {?number} New order if changed, or null.
         */

    }, {
        key: 'setDrawableOrder',
        value: function setDrawableOrder(drawableID, order, optIsRelative, optMin) {
            var oldIndex = this._drawList.indexOf(drawableID);
            if (oldIndex >= 0) {
                // Remove drawable from the list.
                var drawable = this._drawList.splice(oldIndex, 1)[0];
                // Determine new index.
                var newIndex = order;
                if (optIsRelative) {
                    newIndex += oldIndex;
                }
                if (optMin) {
                    newIndex = Math.max(newIndex, optMin);
                }
                newIndex = Math.max(newIndex, 0);
                // Insert at new index.
                this._drawList.splice(newIndex, 0, drawable);
                return this._drawList.indexOf(drawable);
            }
            return null;
        }

        /**
         * Draw all current drawables and present the frame on the canvas.
         */

    }, {
        key: 'draw',
        value: function draw() {
            var gl = this._gl;

            twgl.bindFramebufferInfo(gl, null);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor.apply(gl, this._backgroundColor);
            gl.clear(gl.COLOR_BUFFER_BIT);

            this._drawThese(this._drawList, ShaderManager.DRAW_MODE.default, this._projection);
        }

        /**
         * Get the precise bounds for a Drawable.
         * @param {int} drawableID ID of Drawable to get bounds for.
         * @return {object} Bounds for a tight box around the Drawable.
         */

    }, {
        key: 'getBounds',
        value: function getBounds(drawableID) {
            var drawable = this._allDrawables[drawableID];
            // Tell the Drawable about its updated convex hull, if necessary.
            if (drawable.needsConvexHullPoints()) {
                var points = this._getConvexHullPointsForDrawable(drawableID);
                drawable.setConvexHullPoints(points);
            }
            var bounds = drawable.getFastBounds();
            // In debug mode, draw the bounds.
            if (this._debugCanvas) {
                var gl = this._gl;
                this._debugCanvas.width = gl.canvas.width;
                this._debugCanvas.height = gl.canvas.height;
                var context = this._debugCanvas.getContext('2d');
                context.drawImage(gl.canvas, 0, 0);
                context.strokeStyle = '#FF0000';
                var pr = window.devicePixelRatio;
                context.strokeRect(pr * (bounds.left + this._nativeSize[0] / 2), pr * (-bounds.top + this._nativeSize[1] / 2), pr * (bounds.right - bounds.left), pr * (-bounds.bottom + bounds.top));
            }
            return bounds;
        }

        /**
         * Get the precise bounds for a Drawable around the top slice.
         * Used for positioning speech bubbles more closely to the sprite.
         * @param {int} drawableID ID of Drawable to get bubble bounds for.
         * @return {object} Bounds for a tight box around the Drawable top slice.
         */

    }, {
        key: 'getBoundsForBubble',
        value: function getBoundsForBubble(drawableID) {
            var drawable = this._allDrawables[drawableID];
            // Tell the Drawable about its updated convex hull, if necessary.
            if (drawable.needsConvexHullPoints()) {
                var points = this._getConvexHullPointsForDrawable(drawableID);
                drawable.setConvexHullPoints(points);
            }
            var bounds = drawable.getBoundsForBubble();
            // In debug mode, draw the bounds.
            if (this._debugCanvas) {
                var gl = this._gl;
                this._debugCanvas.width = gl.canvas.width;
                this._debugCanvas.height = gl.canvas.height;
                var context = this._debugCanvas.getContext('2d');
                context.drawImage(gl.canvas, 0, 0);
                context.strokeStyle = '#FF0000';
                var pr = window.devicePixelRatio;
                context.strokeRect(pr * (bounds.left + this._nativeSize[0] / 2), pr * (-bounds.top + this._nativeSize[1] / 2), pr * (bounds.right - bounds.left), pr * (-bounds.bottom + bounds.top));
            }
            return bounds;
        }

        /**
         * Get the current skin (costume) size of a Drawable.
         * @param {int} drawableID The ID of the Drawable to measure.
         * @return {Array<number>} Skin size, width and height.
         */

    }, {
        key: 'getCurrentSkinSize',
        value: function getCurrentSkinSize(drawableID) {
            var drawable = this._allDrawables[drawableID];
            return this.getSkinSize(drawable.skin.id);
        }

        /**
         * Get the size of a skin by ID.
         * @param {int} skinID The ID of the Skin to measure.
         * @return {Array<number>} Skin size, width and height.
         */

    }, {
        key: 'getSkinSize',
        value: function getSkinSize(skinID) {
            var skin = this._allSkins[skinID];
            return skin.size;
        }

        /**
         * Get the rotation center of a skin by ID.
         * @param {int} skinID The ID of the Skin
         * @return {Array<number>} The rotationCenterX and rotationCenterY
         */

    }, {
        key: 'getSkinRotationCenter',
        value: function getSkinRotationCenter(skinID) {
            var skin = this._allSkins[skinID];
            return skin.calculateRotationCenter();
        }

        /**
         * Check if a particular Drawable is touching a particular color.
         * Unlike touching drawable, touching color tests invisible sprites.
         * @param {int} drawableID The ID of the Drawable to check.
         * @param {Array<int>} color3b Test if the Drawable is touching this color.
         * @param {Array<int>} [mask3b] Optionally mask the check to this part of Drawable.
         * @returns {boolean} True iff the Drawable is touching the color.
         */

    }, {
        key: 'isTouchingColor',
        value: function isTouchingColor(drawableID, color3b, mask3b) {
            var gl = this._gl;
            twgl.bindFramebufferInfo(gl, this._queryBufferInfo);

            var bounds = this._touchingBounds(drawableID);
            if (!bounds) {
                return false;
            }
            var candidateIDs = this._filterCandidatesTouching(drawableID, this._drawList, bounds);
            if (!candidateIDs) {
                return false;
            }

            // Limit size of viewport to the bounds around the target Drawable,
            // and create the projection matrix for the draw.
            gl.viewport(0, 0, bounds.width, bounds.height);
            var projection = twgl.m4.ortho(bounds.left, bounds.right, bounds.top, bounds.bottom, -1, 1);

            var fillBackgroundColor = this._backgroundColor;

            // When using masking such that the background fill color will showing through, ensure we don't
            // fill using the same color that we are trying to detect!
            if (color3b[0] > 196 && color3b[1] > 196 && color3b[2] > 196) {
                fillBackgroundColor = COLOR_BLACK;
            }

            gl.clearColor.apply(gl, fillBackgroundColor);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

            var extraUniforms = void 0;
            if (mask3b) {
                extraUniforms = {
                    u_colorMask: [mask3b[0] / 255, mask3b[1] / 255, mask3b[2] / 255],
                    u_colorMaskTolerance: TOLERANCE_TOUCHING_COLOR.Mask / 255
                };
            }

            try {
                gl.enable(gl.STENCIL_TEST);
                gl.stencilFunc(gl.ALWAYS, 1, 1);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
                gl.colorMask(false, false, false, false);
                this._drawThese([drawableID], mask3b ? ShaderManager.DRAW_MODE.colorMask : ShaderManager.DRAW_MODE.silhouette, projection, {
                    extraUniforms: extraUniforms,
                    ignoreVisibility: true // Touching color ignores sprite visibility
                });

                gl.stencilFunc(gl.EQUAL, 1, 1);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                gl.colorMask(true, true, true, true);

                this._drawThese(candidateIDs, ShaderManager.DRAW_MODE.default, projection, { idFilterFunc: function idFilterFunc(testID) {
                        return testID !== drawableID;
                    } });
            } finally {
                gl.colorMask(true, true, true, true);
                gl.disable(gl.STENCIL_TEST);
            }

            var pixels = new Uint8Array(Math.floor(bounds.width * bounds.height * 4));
            gl.readPixels(0, 0, bounds.width, bounds.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            if (this._debugCanvas) {
                this._debugCanvas.width = bounds.width;
                this._debugCanvas.height = bounds.height;
                var context = this._debugCanvas.getContext('2d');
                var imageData = context.getImageData(0, 0, bounds.width, bounds.height);
                imageData.data.set(pixels);
                context.putImageData(imageData, 0, 0);
            }

            for (var pixelBase = 0; pixelBase < pixels.length; pixelBase += 4) {
                var pixelDistanceR = Math.abs(pixels[pixelBase] - color3b[0]);
                var pixelDistanceG = Math.abs(pixels[pixelBase + 1] - color3b[1]);
                var pixelDistanceB = Math.abs(pixels[pixelBase + 2] - color3b[2]);

                if (pixelDistanceR <= TOLERANCE_TOUCHING_COLOR.R && pixelDistanceG <= TOLERANCE_TOUCHING_COLOR.G && pixelDistanceB <= TOLERANCE_TOUCHING_COLOR.B) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Check if a particular Drawable is touching any in a set of Drawables.
         * @param {int} drawableID The ID of the Drawable to check.
         * @param {Array<int>} candidateIDs The Drawable IDs to check, otherwise all.
         * @returns {boolean} True iff the Drawable is touching one of candidateIDs.
         */

    }, {
        key: 'isTouchingDrawables',
        value: function isTouchingDrawables(drawableID, candidateIDs) {
            candidateIDs = candidateIDs || this._drawList;

            var gl = this._gl;

            twgl.bindFramebufferInfo(gl, this._queryBufferInfo);

            var bounds = this._touchingBounds(drawableID);
            if (!bounds) {
                return false;
            }
            candidateIDs = this._filterCandidatesTouching(drawableID, candidateIDs, bounds);
            if (!candidateIDs) {
                return false;
            }

            // Limit size of viewport to the bounds around the target Drawable,
            // and create the projection matrix for the draw.
            gl.viewport(0, 0, bounds.width, bounds.height);
            var projection = twgl.m4.ortho(bounds.left, bounds.right, bounds.top, bounds.bottom, -1, 1);

            var noneColor = Drawable.color4fFromID(RenderConstants.ID_NONE);
            gl.clearColor.apply(gl, noneColor);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

            try {
                gl.enable(gl.STENCIL_TEST);
                gl.stencilFunc(gl.ALWAYS, 1, 1);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
                gl.colorMask(false, false, false, false);
                this._drawThese([drawableID], ShaderManager.DRAW_MODE.silhouette, projection);

                gl.stencilFunc(gl.EQUAL, 1, 1);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                gl.colorMask(true, true, true, true);

                this._drawThese(candidateIDs, ShaderManager.DRAW_MODE.silhouette, projection, { idFilterFunc: function idFilterFunc(testID) {
                        return testID !== drawableID;
                    } });
            } finally {
                gl.colorMask(true, true, true, true);
                gl.disable(gl.STENCIL_TEST);
            }

            var pixels = new Uint8Array(Math.floor(bounds.width * bounds.height * 4));
            gl.readPixels(0, 0, bounds.width, bounds.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            if (this._debugCanvas) {
                this._debugCanvas.width = bounds.width;
                this._debugCanvas.height = bounds.height;
                var context = this._debugCanvas.getContext('2d');
                var imageData = context.getImageData(0, 0, bounds.width, bounds.height);
                imageData.data.set(pixels);
                context.putImageData(imageData, 0, 0);
            }

            for (var pixelBase = 0; pixelBase < pixels.length; pixelBase += 4) {
                var pixelID = Drawable.color3bToID(pixels[pixelBase], pixels[pixelBase + 1], pixels[pixelBase + 2]);
                if (pixelID > RenderConstants.ID_NONE) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Detect which sprite, if any, is at the given location. This function will not
         * pick drawables that are not visible or have ghost set all the way up.
         * @param {int} centerX The client x coordinate of the picking location.
         * @param {int} centerY The client y coordinate of the picking location.
         * @param {int} [touchWidth] The client width of the touch event (optional).
         * @param {int} [touchHeight] The client height of the touch event (optional).
         * @param {Array<int>} [candidateIDs] The Drawable IDs to pick from, otherwise all.
         * @returns {int} The ID of the topmost Drawable under the picking location, or
         * RenderConstants.ID_NONE if there is no Drawable at that location.
         */

    }, {
        key: 'pick',
        value: function pick(centerX, centerY, touchWidth, touchHeight, candidateIDs) {
            var _this2 = this;

            var gl = this._gl;

            touchWidth = touchWidth || 1;
            touchHeight = touchHeight || 1;
            candidateIDs = (candidateIDs || this._drawList).filter(function (id) {
                var drawable = _this2._allDrawables[id];
                var uniforms = drawable.getUniforms();
                return drawable.getVisible() && uniforms.u_ghost !== 0;
            });

            var clientToGLX = gl.canvas.width / gl.canvas.clientWidth;
            var clientToGLY = gl.canvas.height / gl.canvas.clientHeight;

            centerX *= clientToGLX;
            centerY *= clientToGLY;
            touchWidth *= clientToGLX;
            touchHeight *= clientToGLY;

            touchWidth = Math.max(1, Math.min(touchWidth, MAX_TOUCH_SIZE[0]));
            touchHeight = Math.max(1, Math.min(touchHeight, MAX_TOUCH_SIZE[1]));

            var pixelLeft = Math.floor(centerX - Math.floor(touchWidth / 2) + 0.5);
            var pixelTop = Math.floor(centerY - Math.floor(touchHeight / 2) + 0.5);

            var widthPerPixel = (this._xRight - this._xLeft) / this._gl.canvas.width;
            var heightPerPixel = (this._yBottom - this._yTop) / this._gl.canvas.height;

            var pickLeft = this._xLeft + pixelLeft * widthPerPixel;
            var pickTop = this._yTop + pixelTop * heightPerPixel;

            var hits = [];
            var worldPos = twgl.v3.create(0, 0, 0);
            worldPos[2] = 0;

            // Iterate over the canvas pixels and check if any candidate can be
            // touched at that point.
            for (var x = 0; x < touchWidth; x++) {
                worldPos[0] = x + pickLeft;
                for (var y = 0; y < touchHeight; y++) {
                    worldPos[1] = y + pickTop;
                    // Check candidates in the reverse order they would have been
                    // drawn. This will determine what candiate's silhouette pixel
                    // would have been drawn at the point.
                    for (var d = candidateIDs.length - 1; d >= 0; d--) {
                        var id = candidateIDs[d];
                        var drawable = this._allDrawables[id];
                        if (drawable.isTouching(worldPos)) {
                            hits[id] = (hits[id] || 0) + 1;
                            break;
                        }
                    }
                }
            }

            // Bias toward selecting anything over nothing
            hits[RenderConstants.ID_NONE] = 0;

            var hit = RenderConstants.ID_NONE;
            for (var hitID in hits) {
                if (hits.hasOwnProperty(hitID) && hits[hitID] > hits[hit]) {
                    hit = hitID;
                }
            }

            return hit | 0;
        }

        /**
         * @typedef DrawableExtraction
         * @property {Uint8Array} data Raw pixel data for the drawable
         * @property {int} width Drawable bounding box width
         * @property {int} height Drawable bounding box height
         * @property {Array<number>} scratchOffset [x, y] offset in Scratch coordinates
         * from the drawable position to the client x, y coordinate
         * @property {int} x The x coordinate relative to drawable bounding box
         * @property {int} y The y coordinate relative to drawable bounding box
         */

        /**
         * Return drawable pixel data and picking coordinates relative to the drawable bounds
         * @param {int} drawableID The ID of the drawable to get pixel data for
         * @param {int} x The client x coordinate of the picking location.
         * @param {int} y The client y coordinate of the picking location.
         * @return {?DrawableExtraction} Data about the picked drawable
         */

    }, {
        key: 'extractDrawable',
        value: function extractDrawable(drawableID, x, y) {
            var drawable = this._allDrawables[drawableID];
            if (!drawable) return null;

            // Convert client coordinates into absolute scratch units
            var scratchX = this._nativeSize[0] * (x / this._gl.canvas.clientWidth - 0.5);
            var scratchY = this._nativeSize[1] * (y / this._gl.canvas.clientHeight - 0.5);

            var gl = this._gl;
            twgl.bindFramebufferInfo(gl, this._queryBufferInfo);

            var bounds = drawable.getFastBounds();
            bounds.snapToInt();

            // Translate to scratch units relative to the drawable
            var pickX = scratchX - bounds.left;
            var pickY = scratchY + bounds.top;

            // Limit size of viewport to the bounds around the target Drawable,
            // and create the projection matrix for the draw.
            gl.viewport(0, 0, bounds.width, bounds.height);
            var projection = twgl.m4.ortho(bounds.left, bounds.right, bounds.top, bounds.bottom, -1, 1);

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            try {
                gl.disable(gl.BLEND);
                this._drawThese([drawableID], ShaderManager.DRAW_MODE.default, projection, { effectMask: ~ShaderManager.EFFECT_INFO.ghost.mask });
            } finally {
                gl.enable(gl.BLEND);
            }

            var data = new Uint8Array(Math.floor(bounds.width * bounds.height * 4));
            gl.readPixels(0, 0, bounds.width, bounds.height, gl.RGBA, gl.UNSIGNED_BYTE, data);

            if (this._debugCanvas) {
                this._debugCanvas.width = bounds.width;
                this._debugCanvas.height = bounds.height;
                var ctx = this._debugCanvas.getContext('2d');
                var imageData = ctx.createImageData(bounds.width, bounds.height);
                imageData.data.set(data);
                ctx.putImageData(imageData, 0, 0);
                ctx.beginPath();
                ctx.arc(pickX, pickY, 3, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'black';
                ctx.stroke();
            }

            return {
                data: data,
                width: bounds.width,
                height: bounds.height,
                scratchOffset: [-scratchX + drawable._position[0], -scratchY - drawable._position[1]],
                x: pickX,
                y: pickY
            };
        }

        /**
         * @typedef ColorExtraction
         * @property {Uint8Array} data Raw pixel data for the drawable
         * @property {int} width Drawable bounding box width
         * @property {int} height Drawable bounding box height
         * @property {object} color Color object with RGBA properties at picked location
         */

        /**
         * Return drawable pixel data and color at a given position
         * @param {int} x The client x coordinate of the picking location.
         * @param {int} y The client y coordinate of the picking location.
         * @param {int} radius The client radius to extract pixels with.
         * @return {?ColorExtraction} Data about the picked color
         */

    }, {
        key: 'extractColor',
        value: function extractColor(x, y, radius) {
            var scratchX = Math.round(this._nativeSize[0] * (x / this._gl.canvas.clientWidth - 0.5));
            var scratchY = Math.round(-this._nativeSize[1] * (y / this._gl.canvas.clientHeight - 0.5));

            var gl = this._gl;
            twgl.bindFramebufferInfo(gl, this._queryBufferInfo);

            var bounds = new Rectangle();
            bounds.initFromBounds(scratchX - radius, scratchX + radius, scratchY - radius, scratchY + radius);

            var pickX = scratchX - bounds.left;
            var pickY = bounds.top - scratchY;

            gl.viewport(0, 0, bounds.width, bounds.height);
            var projection = twgl.m4.ortho(bounds.left, bounds.right, bounds.top, bounds.bottom, -1, 1);

            gl.clearColor.apply(gl, this._backgroundColor);
            gl.clear(gl.COLOR_BUFFER_BIT);
            this._drawThese(this._drawList, ShaderManager.DRAW_MODE.default, projection);

            var data = new Uint8Array(Math.floor(bounds.width * bounds.height * 4));
            gl.readPixels(0, 0, bounds.width, bounds.height, gl.RGBA, gl.UNSIGNED_BYTE, data);

            var pixelBase = Math.floor(4 * (pickY * bounds.width + pickX));
            var color = {
                r: data[pixelBase],
                g: data[pixelBase + 1],
                b: data[pixelBase + 2],
                a: data[pixelBase + 3]
            };

            if (this._debugCanvas) {
                this._debugCanvas.width = bounds.width;
                this._debugCanvas.height = bounds.height;
                var ctx = this._debugCanvas.getContext('2d');
                var imageData = ctx.createImageData(bounds.width, bounds.height);
                imageData.data.set(data);
                ctx.putImageData(imageData, 0, 0);
                ctx.strokeStyle = 'black';
                ctx.fillStyle = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + color.a + ')';
                ctx.rect(pickX - 4, pickY - 4, 8, 8);
                ctx.fill();
                ctx.stroke();
            }

            return {
                data: data,
                width: bounds.width,
                height: bounds.height,
                color: color
            };
        }

        /**
         * Get the candidate bounding box for a touching query.
         * @param {int} drawableID ID for drawable of query.
         * @return {?Rectangle} Rectangle bounds for touching query, or null.
         */

    }, {
        key: '_touchingBounds',
        value: function _touchingBounds(drawableID) {
            var drawable = this._allDrawables[drawableID];

            /** @todo remove this once URL-based skin setting is removed. */
            if (!drawable.skin || !drawable.skin.getTexture([100, 100])) return null;

            var bounds = drawable.getFastBounds();

            // Limit queries to the stage size.
            bounds.clamp(this._xLeft, this._xRight, this._yBottom, this._yTop);

            // Use integer coordinates for queries - weird things happen
            // when you provide float width/heights to gl.viewport and projection.
            bounds.snapToInt();

            if (bounds.width === 0 || bounds.height === 0) {
                // No space to query.
                return null;
            }
            return bounds;
        }

        /**
         * Filter a list of candidates for a touching query into only those that
         * could possibly intersect the given bounds.
         * @param {int} drawableID - ID for drawable of query.
         * @param {Array<int>} candidateIDs - Candidates for touching query.
         * @param {Rectangle} bounds - Bounds to limit candidates to.
         * @return {?Array<int>} Filtered candidateIDs, or null if none.
         */

    }, {
        key: '_filterCandidatesTouching',
        value: function _filterCandidatesTouching(drawableID, candidateIDs, bounds) {
            var _this3 = this;

            // Filter candidates by rough bounding box intersection.
            // Do this before _drawThese, so we can prevent any GL operations
            // and readback by returning early.
            candidateIDs = candidateIDs.filter(function (testID) {
                if (testID === drawableID) return false;
                // Only draw items which could possibly overlap target Drawable.
                var candidate = _this3._allDrawables[testID];
                var candidateBounds = candidate.getFastBounds();
                return bounds.intersects(candidateBounds);
            });
            if (candidateIDs.length === 0) {
                // No possible intersections based on bounding boxes.
                return null;
            }
            return candidateIDs;
        }

        /**
         * Update the position, direction, scale, or effect properties of this Drawable.
         * @param {int} drawableID The ID of the Drawable to update.
         * @param {object.<string,*>} properties The new property values to set.
         */

    }, {
        key: 'updateDrawableProperties',
        value: function updateDrawableProperties(drawableID, properties) {
            var drawable = this._allDrawables[drawableID];
            if (!drawable) {
                /**
                 * @todo fix whatever's wrong in the VM which causes this, then add a warning or throw here.
                 * Right now this happens so much on some projects that a warning or exception here can hang the browser.
                 */
                return;
            }
            if ('skinId' in properties) {
                drawable.skin = this._allSkins[properties.skinId];
            }
            if ('rotationCenter' in properties) {
                var newRotationCenter = properties.rotationCenter;
                drawable.skin.setRotationCenter(newRotationCenter[0], newRotationCenter[1]);
            }
            drawable.updateProperties(properties);
        }

        /**
         * Update the position object's x & y members to keep the drawable fenced in view.
         * @param {int} drawableID - The ID of the Drawable to update.
         * @param {Array.<number, number>} position to be fenced - An array of type [x, y]
         * @return {Array.<number, number>} The fenced position as an array [x, y]
         */

    }, {
        key: 'getFencedPositionOfDrawable',
        value: function getFencedPositionOfDrawable(drawableID, position) {
            var x = position[0];
            var y = position[1];

            var drawable = this._allDrawables[drawableID];
            if (!drawable) {
                // TODO: fix whatever's wrong in the VM which causes this, then add a warning or throw here.
                // Right now this happens so much on some projects that a warning or exception here can hang the browser.
                return [x, y];
            }

            var dx = x - drawable._position[0];
            var dy = y - drawable._position[1];

            var aabb = drawable.getFastBounds();

            var sx = this._xRight - Math.min(FENCE_WIDTH, Math.floor((aabb.right - aabb.left) / 2));
            if (aabb.right + dx < -sx) {
                x = drawable._position[0] - (sx + aabb.right);
            } else if (aabb.left + dx > sx) {
                x = drawable._position[0] + (sx - aabb.left);
            }
            var sy = this._yTop - Math.min(FENCE_WIDTH, Math.floor((aabb.top - aabb.bottom) / 2));
            if (aabb.top + dy < -sy) {
                y = drawable._position[1] - (sy + aabb.top);
            } else if (aabb.bottom + dy > sy) {
                y = drawable._position[1] + (sy - aabb.bottom);
            }
            return [x, y];
        }

        /**
         * Clear a pen layer.
         * @param {int} penSkinID - the unique ID of a Pen Skin.
         */

    }, {
        key: 'penClear',
        value: function penClear(penSkinID) {
            var skin = /** @type {PenSkin} */this._allSkins[penSkinID];
            skin.clear();
        }

        /**
         * Draw a point on a pen layer.
         * @param {int} penSkinID - the unique ID of a Pen Skin.
         * @param {PenAttributes} penAttributes - how the point should be drawn.
         * @param {number} x - the X coordinate of the point to draw.
         * @param {number} y - the Y coordinate of the point to draw.
         */

    }, {
        key: 'penPoint',
        value: function penPoint(penSkinID, penAttributes, x, y) {
            var skin = /** @type {PenSkin} */this._allSkins[penSkinID];
            skin.drawPoint(penAttributes, x, y);
        }

        /**
         * Draw a line on a pen layer.
         * @param {int} penSkinID - the unique ID of a Pen Skin.
         * @param {PenAttributes} penAttributes - how the line should be drawn.
         * @param {number} x0 - the X coordinate of the beginning of the line.
         * @param {number} y0 - the Y coordinate of the beginning of the line.
         * @param {number} x1 - the X coordinate of the end of the line.
         * @param {number} y1 - the Y coordinate of the end of the line.
         */

    }, {
        key: 'penLine',
        value: function penLine(penSkinID, penAttributes, x0, y0, x1, y1) {
            var skin = /** @type {PenSkin} */this._allSkins[penSkinID];
            skin.drawLine(penAttributes, x0, y0, x1, y1);
        }

        /**
         * Stamp a Drawable onto a pen layer.
         * @param {int} penSkinID - the unique ID of a Pen Skin.
         * @param {int} stampID - the unique ID of the Drawable to use as the stamp.
         */

    }, {
        key: 'penStamp',
        value: function penStamp(penSkinID, stampID) {
            var stampDrawable = this._allDrawables[stampID];
            if (!stampDrawable) {
                return;
            }

            var bounds = this._touchingBounds(stampID);
            if (!bounds) {
                return;
            }

            var skin = /** @type {PenSkin} */this._allSkins[penSkinID];

            var gl = this._gl;
            twgl.bindFramebufferInfo(gl, this._queryBufferInfo);

            // Limit size of viewport to the bounds around the stamp Drawable and create the projection matrix for the draw.
            gl.viewport(0, 0, bounds.width, bounds.height);
            var projection = twgl.m4.ortho(bounds.left, bounds.right, bounds.top, bounds.bottom, -1, 1);

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            try {
                gl.disable(gl.BLEND);
                this._drawThese([stampID], ShaderManager.DRAW_MODE.default, projection, { ignoreVisibility: true });
            } finally {
                gl.enable(gl.BLEND);
            }

            var stampPixels = new Uint8Array(Math.floor(bounds.width * bounds.height * 4));
            gl.readPixels(0, 0, bounds.width, bounds.height, gl.RGBA, gl.UNSIGNED_BYTE, stampPixels);

            var stampCanvas = this._tempCanvas;
            stampCanvas.width = bounds.width;
            stampCanvas.height = bounds.height;

            var stampContext = stampCanvas.getContext('2d');
            var stampImageData = stampContext.createImageData(bounds.width, bounds.height);
            stampImageData.data.set(stampPixels);
            stampContext.putImageData(stampImageData, 0, 0);

            skin.drawStamp(stampCanvas, bounds.left, bounds.top);
        }

        /* ******
         * Truly internal functions: these support the functions above.
         ********/

        /**
         * Build geometry (vertex and index) buffers.
         * @private
         */

    }, {
        key: '_createGeometry',
        value: function _createGeometry() {
            var quad = {
                a_position: {
                    numComponents: 2,
                    data: [-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5]
                },
                a_texCoord: {
                    numComponents: 2,
                    data: [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1]
                }
            };
            this._bufferInfo = twgl.createBufferInfoFromArrays(this._gl, quad);
        }

        /**
         * Respond to a change in the "native" rendering size. The native size is used by buffers which are fixed in size
         * regardless of the size of the main render target. This includes the buffers used for queries such as picking and
         * color-touching. The fixed size allows (more) consistent behavior across devices and presentation modes.
         * @param {object} event - The change event.
         * @private
         */

    }, {
        key: 'onNativeSizeChanged',
        value: function onNativeSizeChanged(event) {
            var _event$newSize = _slicedToArray(event.newSize, 2),
                width = _event$newSize[0],
                height = _event$newSize[1];

            var gl = this._gl;
            var attachments = [{ format: gl.RGBA }, { format: gl.DEPTH_STENCIL }];

            if (!this._pickBufferInfo) {
                this._pickBufferInfo = twgl.createFramebufferInfo(gl, attachments, MAX_TOUCH_SIZE[0], MAX_TOUCH_SIZE[1]);
            }

            /** @todo should we create this on demand to save memory? */
            // A 480x360 32-bpp buffer is 675 KiB.
            if (this._queryBufferInfo) {
                twgl.resizeFramebufferInfo(gl, this._queryBufferInfo, attachments, width, height);
            } else {
                this._queryBufferInfo = twgl.createFramebufferInfo(gl, attachments, width, height);
            }
        }

        /**
         * Draw a set of Drawables, by drawable ID
         * @param {Array<int>} drawables The Drawable IDs to draw, possibly this._drawList.
         * @param {ShaderManager.DRAW_MODE} drawMode Draw normally, silhouette, etc.
         * @param {module:twgl/m4.Mat4} projection The projection matrix to use.
         * @param {object} [opts] Options for drawing
         * @param {idFilterFunc} opts.filter An optional filter function.
         * @param {object.<string,*>} opts.extraUniforms Extra uniforms for the shaders.
         * @param {int} opts.effectMask Bitmask for effects to allow
         * @param {boolean} opts.ignoreVisibility Draw all, despite visibility (e.g. stamping, touching color)
         * @private
         */

    }, {
        key: '_drawThese',
        value: function _drawThese(drawables, drawMode, projection) {
            var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            var near = function near(a, b) {
                var relativeTolerance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.01;

                var absA = Math.abs(a);
                var absB = Math.abs(b);
                var error = Math.abs(a - b) / Math.max(absA, absB);
                return error < relativeTolerance;
            };

            var gl = this._gl;
            var currentShader = null;

            var numDrawables = drawables.length;
            for (var drawableIndex = 0; drawableIndex < numDrawables; ++drawableIndex) {
                var drawableID = drawables[drawableIndex];

                // If we have a filter, check whether the ID fails
                if (opts.filter && !opts.filter(drawableID)) continue;

                var drawable = this._allDrawables[drawableID];
                /** @todo check if drawable is inside the viewport before anything else */

                // Hidden drawables (e.g., by a "hide" block) are not drawn unless
                // the ignoreVisibility flag is used (e.g. for stamping or touchingColor).
                if (!drawable.getVisible() && !opts.ignoreVisibility) continue;

                var drawableScale = drawable.scale;

                // If the skin or texture isn't ready yet, skip it.
                if (!drawable.skin || !drawable.skin.getTexture(drawableScale)) continue;

                var uniforms = {};

                var effectBits = drawable.getEnabledEffects();
                effectBits &= opts.hasOwnProperty('effectMask') ? opts.effectMask : effectBits;
                var newShader = this._shaderManager.getShader(drawMode, effectBits);
                if (currentShader !== newShader) {
                    currentShader = newShader;
                    gl.useProgram(currentShader.program);
                    twgl.setBuffersAndAttributes(gl, currentShader, this._bufferInfo);
                    Object.assign(uniforms, {
                        u_projectionMatrix: projection,
                        u_fudge: window.fudge || 0
                    });
                }

                Object.assign(uniforms, drawable.skin.getUniforms(drawableScale), drawable.getUniforms());

                // Apply extra uniforms after the Drawable's, to allow overwriting.
                if (opts.extraUniforms) {
                    Object.assign(uniforms, opts.extraUniforms);
                }

                if (uniforms.u_skin) {
                    var useNearest = drawable._direction % 90 === 0 && (near(drawableScale, 100) || drawable.skin.isRaster);
                    twgl.setTextureParameters(gl, uniforms.u_skin, { minMag: useNearest ? gl.NEAREST : gl.LINEAR });
                }

                twgl.setUniforms(currentShader, uniforms);

                twgl.drawBufferInfo(gl, this._bufferInfo, gl.TRIANGLES);
            }
        }

        /**
         * Get the convex hull points for a particular Drawable.
         * To do this, draw the Drawable unrotated, unscaled, and untranslated.
         * Read back the pixels and find all boundary points.
         * Finally, apply a convex hull algorithm to simplify the set.
         * @param {int} drawableID The Drawable IDs calculate convex hull for.
         * @return {Array<Array<number>>} points Convex hull points, as [[x, y], ...]
         */

    }, {
        key: '_getConvexHullPointsForDrawable',
        value: function _getConvexHullPointsForDrawable(drawableID) {
            var drawable = this._allDrawables[drawableID];

            var _drawable$skin$size = _slicedToArray(drawable.skin.size, 2),
                width = _drawable$skin$size[0],
                height = _drawable$skin$size[1];
            // No points in the hull if invisible or size is 0.


            if (!drawable.getVisible() || width === 0 || height === 0) {
                return [];
            }

            /**
             * Return the determinant of two vectors, the vector from A to B and
             * the vector from A to C.
             *
             * The determinant is useful in this case to know if AC is counter
             * clockwise from AB. A positive value means the AC is counter
             * clockwise from AC. A negative value menas AC is clockwise from AB.
             *
             * @param {Float32Array} A A 2d vector in space.
             * @param {Float32Array} B A 2d vector in space.
             * @param {Float32Array} C A 2d vector in space.
             * @return {number} Greater than 0 if counter clockwise, less than if
             * clockwise, 0 if all points are on a line.
             */
            var CCW = function CCW(A, B, C) {
                // AB = B - A
                // AC = C - A
                // det (AB BC) = AB0 * AC1 - AB1 * AC0
                return (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
            };

            // https://github.com/LLK/scratch-flash/blob/dcbeeb59d44c3be911545dfe54d
            // 46a32404f8e69/src/scratch/ScratchCostume.as#L369-L413 Following
            // RasterHull creation, compare and store left and right values that
            // maintain a convex shape until that data can be passed to `hull` for
            // further work.
            var L = [];
            var R = [];
            var _pixelPos = twgl.v3.create();
            var _effectPos = twgl.v3.create();
            var ll = -1;
            var rr = -1;
            var Q = void 0;
            for (var y = 0; y < height; y++) {
                _pixelPos[1] = y / height;
                // Scan from left to right, looking for a touchable spot in the
                // skin.
                var x = 0;
                for (; x < width; x++) {
                    _pixelPos[0] = x / width;
                    EffectTransform.transformPoint(drawable, _pixelPos, _effectPos);
                    if (drawable.skin.isTouching(_effectPos)) {
                        Q = [x, y];
                        break;
                    }
                }
                // If x is equal to the width there are no touchable points in the
                // skin. Nothing we can add to L. And looping for R would find the
                // same thing.
                if (x >= width) {
                    continue;
                }
                // Decrement ll until Q is clockwise (CCW returns negative) from the
                // last two points in L.
                while (ll > 0) {
                    if (CCW(L[ll - 1], L[ll], Q) < 0) {
                        break;
                    } else {
                        --ll;
                    }
                }
                // Increment ll and then set L[ll] to Q. If ll was -1 before this
                // line, this will set L[0] to Q. If ll was 0 before this line, this
                // will set L[1] to Q.
                L[++ll] = Q;

                // Scan from right to left, looking for a touchable spot in the
                // skin.
                for (x = width - 1; x >= 0; x--) {
                    _pixelPos[0] = x / width;
                    EffectTransform.transformPoint(drawable, _pixelPos, _effectPos);
                    if (drawable.skin.isTouching(_effectPos)) {
                        Q = [x, y];
                        break;
                    }
                }
                // Decrement rr until Q is counter clockwise (CCW returns positive)
                // from the last two points in L. L takes clockwise points and R
                // takes counter clockwise points. if y was decremented instead of
                // incremented R would take clockwise points. We are going in the
                // right direction for L and the wrong direction for R, so we
                // compare the opposite value for R from L.
                while (rr > 0) {
                    if (CCW(R[rr - 1], R[rr], Q) > 0) {
                        break;
                    } else {
                        --rr;
                    }
                }
                // Increment rr and then set R[rr] to Q.
                R[++rr] = Q;
            }

            // Known boundary points on left/right edges of pixels.
            var boundaryPoints = L;
            // Truncate boundaryPoints to the index of the last added Q to L. L may
            // have more entries than the index for the last Q.
            boundaryPoints.length = ll + 1;
            // Add points in R to boundaryPoints in reverse so all points in
            // boundaryPoints are clockwise from each other.
            for (var j = rr; j >= 0; --j) {
                boundaryPoints.push(R[j]);
            }
            // Simplify boundary points using convex hull.
            return hull(boundaryPoints, Infinity);
        }
    }, {
        key: 'gl',
        get: function get() {
            return this._gl;
        }
    }]);

    return RenderWebGL;
}(EventEmitter);

// :3


RenderWebGL.prototype.canHazPixels = RenderWebGL.prototype.extractDrawable;

module.exports = RenderWebGL;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var RenderWebGL = __webpack_require__(25);

/**
 * Export for NPM & Node.js
 * @type {RenderWebGL}
 */
module.exports = RenderWebGL;

/***/ })
/******/ ]);
//# sourceMappingURL=scratch-render.js.map