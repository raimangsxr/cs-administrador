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
      };




      $ctrl.openModal = function (file) {

        var modalInstance, templateUrl, controller;
        switch (file.metadata.fileType) {
          case "15AOBJE2":
          case "AOBJE2":
            templateUrl = 'components/operationResponseObje/view_response_aobje2.html';
            controller = 'OperationResponseAOBJE2Ctrl';
            break;
          case "15AOBJEAGCL":
          case "AOBJEAGCL":
            templateUrl = 'components/operationResponseObje/view_response_aobjeagcl.html';
            controller = 'OperationResponseAOBJEAGCLCtrl';
            break;
          case "15AOBJEAGRECL":
          case "AOBJEAGRECL":
            templateUrl = 'components/operationResponseObje/view_response_aobjeagrecl.html';
            controller = 'OperationResponseAOBJEAGRECLCtrl';
            break;
          case "15AOBJEAGRERE":
          case "AOBJEAGRERE":
            templateUrl = 'components/operationResponseObje/view_response_aobjeagrere.html';
            controller = 'OperationResponseAOBJEAGRERECtrl';
            break;
          case "15AOBJECIL":
          case "AOBJECIL":
            templateUrl = 'components/operationResponseObje/view_response_aobjecil.html';
            controller = 'OperationResponseAOBJECILCtrl';
            break;
          // case "15AREVCL":
          // case "AREVCL":
          //   templateUrl = 'components/operationResponseObje/view_response_arevcl.html';
          //   controller = 'OperationResponseAREVCLCtrl';
          //   break;
          // case "15AREVAC":
          // case "AREVAC":
          //   templateUrl = 'components/operationResponseObje/view_response_arevac.html';
          //   controller = 'OperationResponseAREVACCtrl';
          //   break;
          // case "15AREVAGRE":
          // case "AREVAGRE":
          //   templateUrl = 'components/operationResponseObje/view_response_arevagre.html';
          //   controller = 'OperationResponseAREVAGRECtrl';
          //   break;
          // case "15AREVAE":
          // case "AREVAE":
          //   templateUrl = 'components/operationResponseObje/view_response_arevae.html';
          //   controller = 'OperationResponseAREVAECtrl';
          //   break;
          // case "15AREVCIL":
          // case "AREVCIL":
          //   templateUrl = 'components/operationResponseObje/view_response_arevcil.html';
          //   controller = 'OperationResponseAREVCILCtrl';
          //   break;
          case "15OBJEINME":
          case "OBJEINME":
            templateUrl = 'components/operationResponseObje/view_response_objeinme.html';
            controller = 'OperationResponseOBJEINMECtrl';
            break;
          case "15OBJEINMERE":
          case "OBJEINMERE":
            templateUrl = 'components/operationResponseObje/view_response_objeinmere.html';
            controller = 'OperationResponseOBJEINMERECtrl';
            break;
          case "15OBJEINCL":
          case "OBJEINCL":
            templateUrl = 'components/operationResponseObje/view_response_objeincl.html';
            controller = 'OperationResponseOBJEINCLCtrl';
            break;
        }

        modalInstance = $uibModal.open({
          templateUrl: templateUrl,
          controller: controller,
          size: 'md',
          resolve: {
            file: file
          }
        });

        modalInstance.result.then(function(result){
          if(result) {
            file.answered = true;
            $log.info('Answer saved successfully');
            modalInstance.close(true);
          }
          else {
            $log.info('Answer dismissed or failed');
          }
        });
      };

    }
  });
