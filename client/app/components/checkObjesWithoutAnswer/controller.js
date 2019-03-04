/**
 * Created by rromani on 04/03/19.
 */
'use strict';

angular.module('csAdministratorApp')
  .component('checkObjesWithoutAnswer', {
    templateUrl: 'components/checkObjesWithoutAnswer/view.html',
    bindings: {
      distrib: '=',
    },
    controller: function Controller ($rootScope, $scope, $http, $log, $cookies, NgTableParams) {
      var $ctrl = this;


      $scope.$on('distrib-changed', function(event, distrib) {
        $ctrl.distrib = distrib;
        $ctrl.changePeriod();
      });


      $ctrl.$onInit = function() {
        // do all your initializations here.
        // create a local scope object for this component only. always update that scope with bindings. and use that in views also.

        $ctrl.selected_year = new Date().getFullYear();
        $ctrl.selected_month = ((new Date().getMonth()+1<10) ? "0" : "").concat(new Date().getMonth()+1);
        $ctrl.period = $ctrl.selected_year + '-' + $ctrl.selected_month;
        $ctrl.years = [new Date().getFullYear(), new Date().getFullYear()-1, new Date().getFullYear()-2, new Date().getFullYear()-3];
        $ctrl.months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

      };


      $ctrl.changePeriod = function() {
        $ctrl.period = $ctrl.selected_year + '-' + $ctrl.selected_month;
        if(!$ctrl.distrib.alias)
          return;
        $ctrl.loading = true;
        $ctrl.error = false;
        $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/check/objeswoanswer/'+$ctrl.distrib.alias+'/'+$ctrl.selected_year+'/'+$ctrl.selected_month).then(
          function(response){
            $ctrl.objes = processObjes(response.data);
            $ctrl.tableParams = new NgTableParams({
              page: 1,
              count: 50,
              sorting: { tipoObjecion: "asc", codTipoPunto: "asc", objeObject: "asc" },
            }, {data: $ctrl.objes});
            $ctrl.loading = false;
          }, function(err){
            $ctrl.loading = false;
            $ctrl.error = true;
            $log.error(JSON.stringify(err));
          }
        );
      };


      $ctrl.markAsNecesitaRevisionManual = function(obje) {
        // set "metadata.necesitaRevisionManual" = true
        // unset "metadata.details"

        var id = getObjeInputFileId(obje);

        $http.post(
          'http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/check/objeswoanswer/necesitarevisionmanual/' + $rootScope.distrib.alias + '/' + id,
          { forcedBy: $cookies.getObject('currentUser').username }
        ).then(
          function (response) {
            obje.checked = true;
            $log.log('OK');
          },
          function (error) {
            $log.error(JSON.stringify(error));
          }
        );
      };


      $ctrl.markAsObjectionOmitted = function(obje) {
        // set "metadata.necesitaRevisionManual" = true
        // unset "metadata.details"

        $http.post(
          'http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/check/objeswoanswer/objectionomitted/' + $rootScope.distrib.alias + '/' + obje._id,
          { forcedBy: $cookies.getObject('currentUser').username }
        ).then(
          function (response) {
            obje.checked = true;
            $log.log('OK');
          },
          function (error) {
            $log.error(JSON.stringify(error));
          }
        );
      };



      /* AUX */

      function processObjes(objes) {
        return objes.map(function(obje) {
          switch (obje.tipoObjecion) {
            case 'OBJE2':
            case 'AOBJE2':
            case '15OBJE2':
            case '15AOBJE2':
            case '15OBJEINME':
            case 'OBJEINME':
              obje.objeObject = obje.cups;
              break;
            case '15AOBJEAGCL':
            case 'AOBJEAGCL':
              obje.objeObject = obje.aggregationId;
              break;
            default:
              obje.objeObject = 'DESCONOCIDO!';
          }
          obje.checked = false;
          $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/query/'+$ctrl.distrib.alias+'/inputFs.files/id/' + obje.gridFileId).then(
            function(results){
              var inputFile = results.data;
              $ctrl.objes.filter(function(o) { return o.gridFileId === inputFile._id }).forEach(function(obje) {
                obje.inputFileName = inputFile.filename;
                obje.inputFileId = inputFile._id;
              });
            }, function(err){
              $log.error(JSON.stringify(err));
            }
          );
          return obje;
        });
      }


      function getObjeInputFileId(obje) {
        if (obje.inputFileName.startsWith('REINTEROBJEDISTRIB')) {
          //REINTEROBJEDISTRIB_OBJEINME_0631_0111_201801_20180926.0
          var splittedName = obje.inputFileName.split('_');
          splittedName.shift();
          return splittedName.join('_');
        } else {
          return obje.inputFileId;
        }
      }
    }
  });
