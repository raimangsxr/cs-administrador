'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('RevficherosCtrl', function ($scope, $animate, NgTableParams) {
    var ficheros = [
      {
        '_id': '56b22cf6404ce0e29e079d86',
        'fileName': 'CLMAG_0402_0233_201504_20150501.0',
        'fileState': 'REE_PDTE_CONFIRMACION',
        'fileType': 'LUNCHPOD',
        'uploadDate': '2016-01-22T06:24:34.000Z'
      },
      {
        '_id': '56b22cf68d562187af8addfd',
        'fileName': 'CLMAG_0402_0463_201504_20150501.0',
        'fileState': 'REE_PDTE_CONFIRMACION',
        'fileType': 'CYCLONICA',
        'uploadDate': '2014-06-30T12:58:50.000Z'
      },
      {
        '_id': '56b22cf6bc68496491f919e4',
        'fileName': 'CLMAG_0493_0233_201505_20150501.0',
        'fileState': 'REE_PDTE_CONFIRMACION',
        'fileType': 'ZENSOR',
        'uploadDate': '2014-11-30T09:40:27.000Z'
      },
      {
        '_id': '56b22cf6ad2ed3b1c673760d',
        'fileName': 'CLMAG_0402_0233_201504_20150501.1',
        'fileState': 'REE_PDTE_CONFIRMACION',
        'fileType': 'FARMEX',
        'uploadDate': '2014-12-22T04:35:46.000Z'
      },
      {
        '_id': '56b22cf6e8cac06431bc9c4b',
        'fileName': 'CLMAG_0402_0233_201504_20150501.2',
        'fileState': 'FICHERO_ENVIADO_ERROR',
        'fileType': 'SEALOUD',
        'uploadDate': '2014-03-22T03:19:59.000Z'
      },
      {
        '_id': '56b22cf605f28d0a66e2f7d8',
        'fileName': 'CLMAG_0301_0233_201504_20150501.0',
        'fileState': 'REE_PDTE_CONFIRMACION',
        'fileType': 'EXOSTREAM',
        'uploadDate': '2014-04-30T10:43:09.000Z'
      },
      {
        '_id': '56b22cf622111b0314331298',
        'fileName': 'CLMAG_0402_0233_201504_20150501.0',
        'fileState': 'FICHERO_ENVIADO_ERROR',
        'fileType': 'ENTROFLEX',
        'uploadDate': '2015-03-28T10:06:13.000Z'
      },
      {
        '_id': '56b22cf6256f04afa8666d64',
        'fileName': 'CLMAG_0402_0233_201504_20150501.0',
        'fileState': 'FICHERO_ENVIADO_ERROR',
        'fileType': 'AQUAMATE',
        'uploadDate': '2014-03-21T06:22:38.000Z'
      },
      {
        '_id': '56b22cf667091f980da4ab9b',
        'fileName': 'CLMAG_0402_0233_201504_20150501.0',
        'fileState': 'REE_CONFIRMADO_BAD2',
        'fileType': 'BOINK',
        'uploadDate': '2015-10-26T09:53:54.000Z'
      },
      {
        '_id': '56b22cf637fe84291084cdf3',
        'fileName': 'CLMAG_0402_0233_201504_20150501.0',
        'fileState': 'FICHERO_ENVIADO_OK',
        'fileType': 'TECHTRIX',
        'uploadDate': '2014-01-21T06:17:29.000Z'
      },
      {
        '_id': '56b22cf625f466e5b7bccfbd',
        'fileName': 'CLMAG_0402_0233_201504_20150501.0',
        'fileState': 'FICHERO_ENVIADO_OK',
        'fileType': 'EXOBLUE',
        'uploadDate': '2015-12-21T03:53:12.000Z'
      }
    ];
    $scope.tableParams = new NgTableParams({page: 1, count: 10}, { data: ficheros});
    $scope.datepicker = {
      startDate: new Date(moment().subtract(1, 'day')),
      endDate: new Date(moment().subtract(1, 'day'))
    };
    $scope.ranges = {
        'Hoy': [moment(), moment()],
        'Ayer': [moment().subtract('days', 1), moment().subtract('days', 1)],
        'Últimos 7 días': [moment().subtract('days', 7), moment()],
        'Últimos 30 días': [moment().subtract('days', 30), moment()],
        'Este mes': [moment().startOf('month'), moment().endOf('month')]
    };
    $scope.refreshFileTable = function(){
      var result = [];
      ficheros.forEach(function(file){
        var fecha = new Date(file.uploadDate);
        if((fecha >= $scope.datepicker.startDate) && (fecha < $scope.datepicker.endDate))
          result.push(file);
      })
      $scope.tableParams = new NgTableParams({page: 1, count: 10}, { data: result});
    }
    
    
  });
