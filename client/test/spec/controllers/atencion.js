'use strict';

describe('Controller: AtencionCtrl', function () {

  // load the controller's module
  beforeEach(module('meanApp'));

  var AtencionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AtencionCtrl = $controller('AtencionCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(AtencionCtrl.awesomeThings.length).toBe(3);
  });
});
