'use strict';

describe('Controller: AuditCtrl', function () {

  // load the controller's module
  beforeEach(module('meanApp'));

  var AuditCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AuditCtrl = $controller('AuditCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(AuditCtrl.awesomeThings.length).toBe(3);
  });
});
