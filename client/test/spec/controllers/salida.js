'use strict';

describe('Controller: SalidaCtrl', function () {

  // load the controller's module
  beforeEach(module('csAdministratorApp'));

  var SalidaCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SalidaCtrl = $controller('SalidaCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SalidaCtrl.awesomeThings.length).toBe(3);
  });
});
