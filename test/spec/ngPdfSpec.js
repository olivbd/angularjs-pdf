describe('ngPdf', function() {
  console.log = function() {};
  var element, $scope;

  // Load the myApp module, which contains the directive
  beforeEach(module('App'));

  beforeEach(module('my.templates'));

  beforeEach(inject(function(_$compile_, _$rootScope_, _$document_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    var $compile = _$compile_;
    var $rootScope = _$rootScope_;
    var $document = _$document_;
    $scope = $rootScope.$new();
    // Compile a piece of HTML containing the directive
    var html = '<ng-pdf pdf="pdf"></ng-pdf>';
    var elmnt = angular.element(html);
    $document.find('body').append(elmnt);
    element = $compile(elmnt)($scope);
    $scope.pdf = {
      url:   '/pdf/relativity.protected.pdf',
      scale: 'page-fit',
      page:  13
    };
    $scope.$digest();
  }));

  beforeEach(function(done){
    setTimeout(function() {
      done();
    }, 9000);
  }, 10000);
});

describe('ngPdf protected', function() {
  console.log = function() {};
  var element, $scope;

  // Load the myApp module, which contains the directive
  beforeEach(module('App'));

  beforeEach(module('my.templates'));

  beforeEach(inject(function(_$compile_, _$rootScope_, _$document_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    var $compile = _$compile_;
    var $rootScope = _$rootScope_;
    var $document = _$document_;
    $scope = $rootScope.$new();
    // Compile a piece of HTML containing the directive
    var html = '<ng-pdf pdf="pdf" onpassword="onpassword(updatePasswordFn, passwordResponse)"></ng-pdf>';
    var elmnt = angular.element(html);
    $document.find('body').append(elmnt);
    element = $compile(elmnt)($scope);
    $scope.pdf = {
      url:   '/pdf/relativity.protected.pdf',
      scale: 'page-fit',
      page:  13
    };
    $scope.pdfUrl = '/pdf/relativity.protected.pdf';
    $scope.onpassword = jasmine.createSpy('onpassword');
    $scope.$digest();
  }));

  beforeEach(function(done){
    setTimeout(function() {
      done();
    }, 9000);
  }, 10000);

});
