'use strict';

describe('Controller: DetalleCtrl', function () {

  // load the controller's module
  beforeEach(module('meanApp'));

  var DetalleCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DetalleCtrl = $controller('DetalleCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(DetalleCtrl.awesomeThings.length).toBe(3);
  });
});
