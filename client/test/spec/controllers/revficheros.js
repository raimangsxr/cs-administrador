'use strict';

describe('Controller: RevficherosCtrl', function () {

  // load the controller's module
  beforeEach(module('meanApp'));

  var RevficherosCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RevficherosCtrl = $controller('RevficherosCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(RevficherosCtrl.awesomeThings.length).toBe(3);
  });
});
