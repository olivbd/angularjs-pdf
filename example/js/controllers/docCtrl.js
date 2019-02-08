app.controller('DocCtrl', function($scope, $log) {

  $scope.pdfName = 'Relativity: The Special and General Theory by Albert Einstein';
  // $scope.pdfUrl = 'pdf/relativity.pdf';

  $scope.pdf = {
    url:   'pdf/relativity.pdf',
    page:  13,
    scale: 1
  };

  $scope.pdfPassword = 'test';
  $scope.scroll = 0;
  $scope.loading = 'loading...';

  $scope.getNavStyle = function(scroll) {
    if(scroll > 100) return 'pdf-controls fixed';
    else return 'pdf-controls';
  };

  $scope.error = function(error) {
    $log.error(error);
  };

  $scope.progress = function (progressData) {
    $log.log(progressData);
  };

  $scope.password = function (updatePasswordFn, passwordResponse) {
    if (passwordResponse === PDFJS.PasswordResponses.NEED_PASSWORD) {
        updatePasswordFn($scope.pdfPassword);
    } else if (passwordResponse === PDFJS.PasswordResponses.INCORRECT_PASSWORD) {
      $log.log('Incorrect password')
    }
  };

  $scope.goPrevious = function () {
    if ($scope.pdf.page > 1) {
      $scope.pdf.page --;
    }
  };

  $scope.goNext = function () {
    if ($scope.pdf.page <= $scope.pdf.pageCount) {
      $scope.pdf.page ++;
    }
  };

  $scope.zoomIn = function () {
    if ($scope.pdf.scale < 4) {
      $scope.pdf.scale = parseFloat($scope.pdf.scale) + 0.2;
    }
  };

  $scope.zoomOut = function () {
    if ($scope.pdf.scale > 0.2) {
      $scope.pdf.scale = parseFloat($scope.pdf.scale) - 0.2;
    }
  };

  $scope.rotate = function () {
    if ($scope.pdf.rotate === 0) {
      $scope.pdf.rotate = 90;
    }
    else if ($scope.pdf.rotate === 90) {
      $scope.pdf.rotate = 180
    }
    else if ($scope.pdf.rotate === 180) {
      $scope.pdf.rotate = 270;
    }
    else {
      $scope.pdf.rotate = 0;
    }
  };


});
