// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2016-02-03 using
// generator-karma 1.0.1

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      "jasmine"
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/ng-table/dist/ng-table.min.js',
      'bower_components/moment/moment.js',
      'bower_components/momentjs/moment.js',
      'bower_components/bootstrap-daterangepicker/daterangepicker.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/ng-bs-daterangepicker/src/ng-bs-daterangepicker.js',
      'bower_components/angular-locale_es-es/angular-locale_es-es.js',
      'bower_components/Chart.js/Chart.js',
      'bower_components/angular-chart.js/dist/angular-chart.js',
      'bower_components/underscore/underscore.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/Bootflat/bootflat/js/icheck.min.js',
      'bower_components/Bootflat/bootflat/js/jquery.fs.selecter.min.js',
      'bower_components/Bootflat/bootflat/js/jquery.fs.stepper.min.js',
      'bower_components/angular-md5/angular-md5.js',
      // endbower
      "app/scripts/**/*.js",
      "test/mock/**/*.js",
      "test/spec/**/*.js"
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      "PhantomJS"
    ],

    // Which plugins to enable
    plugins: [
      "karma-phantomjs-launcher",
      "karma-jasmine"
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
