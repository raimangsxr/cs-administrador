'use strict';
/**
 * Created by ricardo on 13/04/16.
 */

angular.module('meanApp').directive('customTimeline', function(){
  return {
    restrict: 'E',
    templateUrl: '/views/directives/custom-timeline.html',
    scope: {
      data: '=',
      filename: '='
    }
  };
});
