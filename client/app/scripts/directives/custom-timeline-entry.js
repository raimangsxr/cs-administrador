'use strict';
/**
 * Created by ricardo on 13/04/16.
 */

angular.module('csAdministratorApp').directive('customTimelineEntry', function(){
  return {
    restrict: 'E',
    templateUrl: 'views/directives/custom-timeline-entry.html',
    scope: {
      data: '='
    }
  };
});
