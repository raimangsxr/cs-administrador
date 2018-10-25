/**
 * Created by rromani on 21/02/18.
 */
'use strict';

angular.module('csAdministratorApp')
  .component('operationResponseObje', {
    templateUrl: 'components/operationResponseObje/view.html',
    bindings: {
      distrib: '=',
    },
    controller: function Controller ($rootScope, $scope, $http, $log, $uibModal, NgTableParams) {
      var $ctrl = this;


      $scope.$on('distrib-changed', function(event, distrib) {
        $ctrl.distrib = distrib;
        $ctrl.check_objes();
      });


      $ctrl.$onInit = function(){
        // do all your initializations here.
        // create a local scope object for this component only. always update that scope with bindings. and use that in views also.
        $ctrl.check_objes();
      };


      $ctrl.check_objes = function(){
        if(!$ctrl.distrib.alias)
          return;
        $ctrl.loading = true;
        $ctrl.error = false;
        $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/operation/manual-objes-response-required/'+$ctrl.distrib.alias).then(
          function(response){
            var data = response.data.map(function(item){
              item.link = 'http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/file/'+$ctrl.distrib.alias+'/'+$ctrl.distrib.code+'/'+item.filename;
              return item;
            });
            $ctrl.tableParams = new NgTableParams({
              page: 1,
              count: 50,
              sorting: { _id: "desc" }
            }, {data: data});
            $ctrl.objes = data;
            $ctrl.loading = false;
          }, function(err){
            $ctrl.loading = false;
            $ctrl.error = true;
            $log.error(JSON.stringify(err));
          }
        );
      }




      $ctrl.openModal = function (file) {

        var modalInstance;
        switch (file.metadata.fileType) {
          case "15OBJEINME":
          case "OBJEINME":
            modalInstance = $uibModal.open({
              templateUrl: 'components/operationResponseObje/view_response_objeinme.html',
              controller: 'OperationResponseOBJEINMECtrl',
              size: 'md',
              resolve: {
                file: file
              }
            });
            break;
          case "15AOBJEAGCL":
          case "AOBJEAGCL":
            modalInstance = $uibModal.open({
              templateUrl: 'components/operationResponseObje/view_response_aobjeagcl.html',
              controller: 'OperationResponseAOBJEAGCLCtrl',
              size: 'md',
              resolve: {
                file: file
              }
            });
            break;
        }

        modalInstance.result.then(function(result){
          if(result) {
            file.answered = true;
            $log.info('Answer saved successfully');
            modalInstance.close(true);
          }
          else
            $log.info('Answer dismissed or failed');
        });
      };

    }
  });
