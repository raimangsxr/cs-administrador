'use strict';

/**
 * @ngdoc function
 * @name csAdministratorApp.controller:RootCtrl
 * @description
 * # RootCtrl
 * Controller of the csAdministratorApp
 */
angular.module('csAdministratorApp')
  .controller('RootCtrl', function ($rootScope, $window, $cookies) {

    // $rootScope.serverConfig = {host: 'localhost', port: 3000};
    // $rootScope.serverConfig = {host: '192.168.246.52', port: 9000};
    $rootScope.serverConfig = {host: '192.168.5.152', port: 9000};


    $rootScope.distribuidoras = [
      {alias: 'stacomba', 'code': '0185', 'name': 'Eléctrica de Santa Comba'},
      {alias: 'udesa', 'code': '0111', 'name': 'UDESA'},
      {alias: 'cabalar', code: '0183', name: 'Eléctrica de Cabalar'},
      {alias: 'gayoso', code: '0188', name: 'Eléctrica de Gayoso'},
      {alias: 'valdriz', code: '0496', name: 'Eléctrica de Valdriz'},
      {alias: 'ccaldelas', code: '0217', name: 'Eléctrica de Castro Caldelas'},
      {alias: 'egres', code: '0221', name: 'Eléctrica de Gres'},
      {alias: 'mleira', code: '0358', name: 'Eléctrica de Martin Leira'},
      {alias: 'ceind', code: '0127', name: 'Central Eléctrica Industrial'},
      {alias: 'ezas', code: '0186', name: 'Eléctrica de Zas'},
      {alias: 'arnego', code: '0302', name: 'Eléctrica de Arnego'},
      {alias: 'efoxo', code: '0193', name: 'Eléctrica de Foxo'},
      {alias: 'barcalesa', code: '0555', name: 'Eléctrica de Barcalesa'}
    ];
    $rootScope.periodos = [
      {alias: 'Última semana', apiPath:'lastWeek', days:7},
      {alias: 'Últimas dos semanas', apiPath:'lastTwoWeeks', days:15},
      {alias: 'Todos los datos', apiPath:'all'}
    ];

    //$rootScope.pollInterval = 2000; // 2 minutes

    if(!$rootScope.distrib){
      $rootScope.distrib = $rootScope.distribuidoras[0];
    }

    var authData = $cookies.getObject('currentUser');
    if(authData){
      $rootScope.currentUser = authData;
    }

    $rootScope.logout = function(){
      delete $rootScope.currentUser;
      $cookies.remove('currentUser');
      $window.location.href = '/';
    };

    $rootScope.setActive = function(idNewActiveTab){
      var oldActiveTab = angular.element(document.querySelector('li.active'));
      oldActiveTab.removeClass('active');
      var newActiveTab = angular.element(document.querySelector('#'+idNewActiveTab));
      newActiveTab.addClass('active');
    };
});
