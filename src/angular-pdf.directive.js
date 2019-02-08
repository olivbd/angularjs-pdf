export const NgPdf = ($window, $document, $log) => {
  'ngInject';

  const backingScale = canvas => {
    const ctx = canvas.getContext('2d');
    const dpr = $window.devicePixelRatio || 1;
    const bsr = ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
  };

  const setCanvasDimensions = (canvas, w, h) => {
    const ratio = backingScale(canvas);
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    canvas.style.width = `${Math.floor(w)}px`;
    canvas.style.height = `${Math.floor(h)}px`;
    canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    return canvas;
  };

  const initCanvas = (element, canvas) => {
    angular.element(canvas).addClass('rotate0');

    const existingCanvas = element.find('canvas');
    if (existingCanvas.length === 0) {
      element.append(canvas);
    }
    else {
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
      pdf:          '=',
      onerror:      '&?',
      onload:       '&?',
      onpagerender: '&?',
      onpassword:   '&?',
      onprogress:   '&?'
    },
    link(scope, element, attrs) {
      let
        renderTask = null,
        pdfLoaderTask = null,
        debug = false,
        pdfDoc = null,
        limitHeight = attrs.limitcanvasheight === '1';

      const canvas = $document[0].createElement('canvas');
      initCanvas(element, canvas);

      debug = attrs.hasOwnProperty('debug') ? attrs.debug : false;

      const
        ctx = canvas.getContext('2d'),
        windowEl = angular.element($window);

      element.css('display', 'block');

      windowEl.on('scroll', () => {
        scope.$apply(() => {
          scope.scroll = windowEl[0].scrollY;
        });
      });

      PDFJS.disableWorker = true;

      scope.renderPage = num => {
        if (renderTask) {
          renderTask._internalRenderTask.cancel();
        }

        pdfDoc.getPage(num).then(page => {
          let viewport;
          let pageWidthScale;
          let renderContext;

          if (scope.pdf.scale === 'page-fit') {
            viewport = page.getViewport(1);
            const clientRect = element[0].getBoundingClientRect();
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
            viewport
          };

          renderTask = page.render(renderContext);
          renderTask.promise.then(() => {
            if (angular.isFunction(scope.onpagerender)) {
              scope.onpagerender();
            }
          }).catch(reason => {
            $log.log(reason);
          });
        });
      };

      const clearCanvas = function () {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      const renderPDF = function () {
        console.log('renderPDF');
        clearCanvas();

        const params = {
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
              scope.onprogress({progressData: progressData});
            }
          };

          pdfLoaderTask.onPassword = function (updatePasswordFn, passwordResponse) {
            if (angular.isFunction(scope.onpassword)) {
              scope.onpassword({updatePasswordFn: updatePasswordFn, passwordResponse: passwordResponse});
            }
          };

          pdfLoaderTask.then(
            _pdfDoc => {
              if (angular.isFunction(scope.onload)) {
                scope.onload();
              }

              pdfDoc = _pdfDoc;
              scope.renderPage(scope.pdf.page);

              scope.$apply(() => {
                scope.pdf.pageCount = _pdfDoc.numPages;
              });
            }, error => {
              if (error) {
                if (angular.isFunction(scope.onerror)) {
                  scope.onerror({error: error});
                }
              }
            }
          );
        }
      };

      scope.$watch('pdf.url', (newVal, oldVal) => {
        if (newVal !== '') {
          if (debug) {
            $log.log('pdfUrl value change detected: ', scope.pdf.url);
          }
          scope.pdf.page = 1;
          scope.pdf.rotate = 0;
          if (pdfLoaderTask) {
            pdfLoaderTask.destroy().then(() => {
              renderPDF();
            });
          } else {
            renderPDF();
          }
        }
      });

      scope.$watch('pdf.page', () => {
        if (scope.pdf.page < 1 || !scope.pdf.page) {
          scope.pdf.page = 1;
        }
        else if (scope.pdf.page > scope.pdf.pageCount) {
          scope.pdf.page = scope.pdf.pageCount;
        }
        if (pdfDoc !== null) {
          scope.renderPage(scope.pdf.page);
        }
      });

      scope.$watch('pdf.rotate', () => {
        if (scope.pdf.rotate !== undefined) {
          canvas.setAttribute('class', 'rotate' + scope.pdf.rotate);
        }
      });

      scope.$watch('pdf.scale', () => {
        if (scope.pdf.scale && pdfDoc !== null) {
          scope.renderPage(scope.pdf.page);
        }
      });

    }
  }
};
