/**
 * Created by rromani on 21/02/18.
 */
'use strict';

/**
 * @ngdoc function
 * @name csAdministratorApp.controller:DetailBaldCtrl
 * @description
 * # AuditCtrl
 * Controller of the csAdministratorApp
 */
angular.module('csAdministratorApp')
  .controller('OperationResponseOBJEINMERECtrl', ['$rootScope', '$scope', '$log', '$http', '$cookies', '$uibModal', '$uibModalInstance', '$q', 'file', function ($rootScope, $scope, $log, $http, $cookies, $uibModal, $uibModalInstance, $q, file) {

    $scope.file = file;
    $scope.responses = {};

    $scope.close = function(){
      $uibModalInstance.close();
    };

    _getAndParseInputFile(file).then(
      function (parsedFile){
        $scope.objes = parsedFile.metadata.details.filter(function(obje){
          return obje.motivo === '700' || obje.motivo === '800';
        });
        $scope.objes.forEach(function(obje){
          $scope.responses[obje.cups] = {};
          $scope.responses[obje.cups].aceptado = null;
          $scope.responses[obje.cups].segundoComer = '9999';
          $scope.responses[obje.cups].comentarioRespuesta = null;
        });
      },
      function (error){
        $log.error(JSON.stringify(error));
      }
    )


    $scope.setResponse = function () {
      delete file.link;

      var fileMetadataWithResponses = $scope.objes.map(function(obje){
        var response = $scope.responses[obje.cups];
        Object.assign(obje, response); // Mergeamos las propiedades de ambos
        return obje;
      });

      _getReinterobjeData(file._id, file.filename, fileMetadataWithResponses).then(
        function(generateFiles){
          $http.post(
            'http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/operation/response-obje/' + $rootScope.distrib.alias,
            generateFiles
          ).then(
            function (response) {
              file.metadata.fechaRevisionManual = new Date().toISOString();
              _updateInputFile(file);
              $uibModalInstance.close(true);
            },
            function (error) {
              $log.error(error);
              $uibModalInstance.close(false);
            }
          );
        },
        function(error){
          log.error(JSON.stringify(error));
        }
      );
    };


    function _getAndParseInputFile(file){
      var deferred = $q.defer();
      if(file.metadata.hasOwnProperty('details')) {
        deferred.resolve(file);
      }
      else {
        $http.get(file.link).then(
          function (response) {
            file.metadata.details = [];
            var file_lines = response.data.trim().split('\n');
            file_lines.forEach(function(line){
              var fields = line.trim().split(';');
              var obje_detail = {};
              obje_detail.cups = fields[0];
              obje_detail.fechaInicio = fields[1];
              obje_detail.fechaFin = fields[2];
              obje_detail.motivo = fields[3];
              obje_detail.publicado = parseInt(fields[4]);
              obje_detail.propuesto = parseInt(fields[5]);
              obje_detail.comentario = fields[6];
              obje_detail.objeAAutoObje = fields[7];
              file.metadata.details.push(obje_detail);
            });
            _updateInputFile(angular.copy(file));
            deferred.resolve(file);
          }, function (err) {
            $log.error(JSON.stringify(err));
          });
      }
      return deferred.promise;
    }


    function _updateInputFile(file){
      delete file.link;
      $http.put(
        'http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/file/' + $rootScope.distrib.alias + '/' + file.filename, file
      );
    }


    function _getReinterobjeData(fileId, filename, objesMetadata){
      var deferred = $q.defer();
      $http.get('http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/query/objecion-intercambio-distribuidor/'+ $rootScope.distrib.alias + '/' + fileId).then(
        function (response) {
          var filename_fields = filename.split('_');
          var responseData = {};
          var responseObjesData = objesMetadata.map(function(obje){
            var objeDocument = response.data.filter(function(doc) {return doc.cups === obje.cups})[0];
            return [
              objeDocument._id,
              objeDocument.codDistribuidor,
              objeDocument.codTipoPunto,
              objeDocument.codComercializador,
              objeDocument.cups,
              objeDocument.codProvincia,
              objeDocument.codTarifa,
              objeDocument.codDH,
              objeDocument.codNivelTension,
              obje.fechaInicio,
              obje.fechaFin,
              null, // AE publicado
              null, // AE propuesto
              obje.publicado, // AS publicado
              obje.propuesto, // AS propuesto
              null, // R1 publicado
              null, // R1 propuesto
              null, // R2 publicado
              null, // R2 propuesto
              null, // R3 publicado
              null, // R3 propuesto
              null, // R4 publicado
              null, // R4 propuesto
              obje.tipoDemanda | null, // tipoDemanda (= tipoAutoconsumo)
              obje.magnitud | null, // magnitud
              obje.motivo,
              obje.comentario,
              null,
              objeDocument.acuseRecibo,
              obje.aceptado,
              obje.comentarioRespuesta,
              'N'
            ].join(';');
          });
          var generateFiles = {};
          responseObjesData.forEach(function(obje){
            var segundoComer = objesMetadata.filter(function(objeMeta){return obje.split(';')[4] === objeMeta.cups})[0].segundoComer;
            var responseFilename = [
                'REINTEROBJEDISTRIB',
                filename_fields[0],
                filename_fields[1],
                filename_fields[2],
                segundoComer,
                filename_fields[3],
                new Date().getFullYear().toString()+((new Date().getMonth()+1<10)?'0'+(new Date().getMonth()+1).toString():(new Date().getMonth()+1).toString())+new Date().getDate().toString()
            ].join('_');
            if(generateFiles.hasOwnProperty(responseFilename)) {
              generateFiles[responseFilename].data.push(obje);
            }
            else {
              generateFiles[responseFilename] = {};
              generateFiles[responseFilename].filename = responseFilename;
              generateFiles[responseFilename].data = [obje];
            }
          });
          var result = [];
          for (var file in generateFiles){
            result.push(generateFiles[file])
          }
          $q.all(result.map(function(file){ return getLastFilename(file.filename)})).then(
            function(filenames){
              result = result.map(function(file){
                var lastVersion = parseInt(filenames.filter(function(filename) { return filename.split('.')[0] === file.filename })[0].split('.')[1]);
                file.filename = file.filename + '.' + (lastVersion+1).toString();
                return file;
              });
              deferred.resolve(result);
            },
            function(err){
              $log.error(JSON.stringify(err));
            }
          )
        }, function (err) {
          $log.error(JSON.stringify(err));
        });
      return deferred.promise;
    }



    function getLastFilename(filename) {
      var deferred = $q.defer();
      $http.get('http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/query/last-file-by-input-filename/'+ $rootScope.distrib.alias + '/' + filename).then(
        function(response){
          if (response.data.length > 0)
            deferred.resolve(response.data[0].filename);
          else
            deferred.resolve(filename+'.100');
        }, function (err) {
          $log.error(JSON.stringify(err));
          deferred.reject(err);
        }
      );
      return deferred.promise;
    }

  }]
  );
