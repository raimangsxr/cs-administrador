'use strict';

/**
 * @ngdoc overview
 * @name csAdministratorApp
 * @description
 * # csAdministratorApp
 *
 * Main module of the application.
 */
var underscore = angular.module('underscore', []);
underscore.factory('_', ['$window', function($window) {
  return $window._; // assumes underscore has already been loaded on the page
}]);

angular
  .module('csAdministratorApp', [
    'ngAnimate',
    'ngCookies',
    'ngRoute',
    'ngTable',
    'ngBootstrap',
    'chart.js',
    'underscore',
    'ui.bootstrap',
    'ngMd5'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/Login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'login'
      })
      .when('/', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl',
        controllerAs: 'dashboard'
      })
      .when('/revision', {
        templateUrl: 'views/revficheros.html',
        controller: 'RevficherosCtrl',
        controllerAs: 'revFicheros'
      })
      .when('/atencion', {
        templateUrl: 'views/atencion.html',
        controller: 'AtencionCtrl',
        controllerAs: 'atencion'
      })
      .when('/entrada', {
        templateUrl: 'views/entrada/entrada.html',
        controller: 'EntradaCtrl',
        controllerAs: 'entrada'
      })
      .when('/entrada/detalle/:filename', {
        templateUrl: 'views/entrada/entrada_detalle.html',
        controller: 'EntradaDetalleCtrl',
        controllerAs: 'entradaDetalle'
      })
      .when('/salida', {
        templateUrl: 'views/salida/salida.html',
        controller: 'SalidaCtrl',
        controllerAs: 'salida'
      })
      .when('/salida/detalle/:filename', {
        templateUrl: 'views/salida/salida_detalle.html',
        controller: 'SalidaDetalleCtrl',
        controllerAs: 'salidaDetalle'
      })
      .when('/audit', {
        templateUrl: 'views/audit/audit.html',
        controller: 'AuditCtrl',
        controllerAs: 'audit'
      })
      .when('/check', {
        templateUrl: 'views/check/check.html',
        controller: 'CheckCtrl',
        controllerAs: 'check'
      })
      .otherwise({
        redirectTo: '/Login'
      });
  })
  .run(function ($rootScope, $location) {
    $rootScope.$on( '$routeChangeStart', function(event, next) {
      if ( $rootScope.currentUser === undefined ) {
        // no logged user, we should be going to #login
        if ( next.templateUrl === 'views/login.html' ) {
          // already going to #login, no redirect needed
        } else {
          // not going to #login, we should redirect now
          $location.path( '/login' );
        }
      }
    });
  });
