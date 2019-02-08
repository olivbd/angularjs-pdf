/*!
 * Angular-PDF: An Angularjs directive <ng-pdf> to display PDF in the browser with PDFJS.
 * @version 3.0.1
 * @link https://github.com/olivbd/angular-pdf#readme
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("angular"));
	else if(typeof define === 'function' && define.amd)
		define("pdf", ["angular"], factory);
	else if(typeof exports === 'object')
		exports["pdf"] = factory(require("angular"));
	else
		root["pdf"] = factory(root["angular"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/angular-pdf.module.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/angular-pdf.directive.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var NgPdf = exports.NgPdf = ["$window", "$document", "$log", function NgPdf($window, $document, $log) {
  'ngInject';

  var backingScale = function backingScale(canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = $window.devicePixelRatio || 1;
    var bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
  };

  var setCanvasDimensions = function setCanvasDimensions(canvas, w, h) {
    var ratio = backingScale(canvas);
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    canvas.style.width = Math.floor(w) + 'px';
    canvas.style.height = Math.floor(h) + 'px';
    canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    return canvas;
  };

  var initCanvas = function initCanvas(element, canvas) {
    angular.element(canvas).addClass('rotate0');

    var existingCanvas = element.find('canvas');
    if (existingCanvas.length === 0) {
      element.append(canvas);
    } else {
      existingCanvas.replaceWith(canvas);
    }
  };

  return {
    restrict: 'E',
    // templateUrl(element, attr) {
    //   $log.log('attr', attr);
    //   return attr.templateUrl ? attr.templateUrl : false;
    // },
    scope: {
      pdf: '=',
      onerror: '&?',
      onload: '&?',
      onpagerender: '&?',
      onpassword: '&?',
      onprogress: '&?'
    },
    link: function link(scope, element, attrs) {
      var renderTask = null,
          pdfLoaderTask = null,
          debug = false,
          pdfDoc = null,
          limitHeight = attrs.limitcanvasheight === '1';

      var canvas = $document[0].createElement('canvas');
      initCanvas(element, canvas);

      debug = attrs.hasOwnProperty('debug') ? attrs.debug : false;

      var ctx = canvas.getContext('2d'),
          windowEl = angular.element($window);

      element.css('display', 'block');

      windowEl.on('scroll', function () {
        scope.$apply(function () {
          scope.scroll = windowEl[0].scrollY;
        });
      });

      PDFJS.disableWorker = true;

      scope.renderPage = function (num) {
        if (renderTask) {
          renderTask._internalRenderTask.cancel();
        }

        pdfDoc.getPage(num).then(function (page) {
          var viewport = void 0;
          var pageWidthScale = void 0;
          var renderContext = void 0;

          if (scope.pdf.scale === 'page-fit') {
            viewport = page.getViewport(1);
            var clientRect = element[0].getBoundingClientRect();
            pageWidthScale = clientRect.width / viewport.width;
            if (limitHeight) {
              pageWidthScale = Math.min(pageWidthScale, clientRect.height / viewport.height);
            }
            scope.pdf.scale = pageWidthScale;
          }
          viewport = page.getViewport(scope.pdf.scale);

          setCanvasDimensions(canvas, viewport.width, viewport.height);

          renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };

          renderTask = page.render(renderContext);
          renderTask.promise.then(function () {
            if (angular.isFunction(scope.onpagerender)) {
              scope.onpagerender();
            }
          }).catch(function (reason) {
            $log.log(reason);
          });
        });
      };

      var clearCanvas = function clearCanvas() {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      var renderPDF = function renderPDF() {
        console.log('renderPDF');
        clearCanvas();

        var params = {
          url: scope.pdf.url,
          withCredentials: scope.pdf.usecredentials
        };

        if (scope.pdf.httpHeaders) {
          params.httpHeaders = scope.pdf.httpHeaders;
        }

        if (scope.pdf.url && scope.pdf.url.length) {
          pdfLoaderTask = PDFJS.getDocument(params);
          pdfLoaderTask.onProgress = function (progressData) {
            if (angular.isFunction(scope.onprogress)) {
              scope.onprogress({ progressData: progressData });
            }
          };

          pdfLoaderTask.onPassword = function (updatePasswordFn, passwordResponse) {
            if (angular.isFunction(scope.onpassword)) {
              scope.onpassword({ updatePasswordFn: updatePasswordFn, passwordResponse: passwordResponse });
            }
          };

          pdfLoaderTask.then(function (_pdfDoc) {
            if (angular.isFunction(scope.onload)) {
              scope.onload();
            }

            pdfDoc = _pdfDoc;
            scope.renderPage(scope.pdf.page);

            scope.$apply(function () {
              scope.pdf.pageCount = _pdfDoc.numPages;
            });
          }, function (error) {
            if (error) {
              if (angular.isFunction(scope.onerror)) {
                scope.onerror({ error: error });
              }
            }
          });
        }
      };

      scope.$watch('pdf.url', function (newVal, oldVal) {
        if (newVal !== '') {
          if (debug) {
            $log.log('pdfUrl value change detected: ', scope.pdf.url);
          }
          scope.pdf.page = 1;
          scope.pdf.rotate = 0;
          if (pdfLoaderTask) {
            pdfLoaderTask.destroy().then(function () {
              renderPDF();
            });
          } else {
            renderPDF();
          }
        }
      });

      scope.$watch('pdf.page', function () {
        if (scope.pdf.page < 1 || !scope.pdf.page) {
          scope.pdf.page = 1;
        } else if (scope.pdf.page > scope.pdf.pageCount) {
          scope.pdf.page = scope.pdf.pageCount;
        }
        if (pdfDoc !== null) {
          scope.renderPage(scope.pdf.page);
        }
      });

      scope.$watch('pdf.rotate', function () {
        if (scope.pdf.rotate !== undefined) {
          canvas.setAttribute('class', 'rotate' + scope.pdf.rotate);
        }
      });

      scope.$watch('pdf.scale', function () {
        if (scope.pdf.scale && pdfDoc !== null) {
          scope.renderPage(scope.pdf.page);
        }
      });
    }
  };
}];

/***/ }),

/***/ "./src/angular-pdf.module.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pdf = undefined;

var _angular = __webpack_require__(0);

var _angular2 = _interopRequireDefault(_angular);

var _angularPdf = __webpack_require__("./src/angular-pdf.directive.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Pdf = exports.Pdf = _angular2.default.module('pdf', []).directive('ngPdf', _angularPdf.NgPdf).name;

exports.default = Pdf;

/***/ }),

/***/ 0:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ })

/******/ });
});
//# sourceMappingURL=angular-pdf.js.map