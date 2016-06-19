/**
 * import dependencies
 */
import angular from 'angular';
import 'angular-ui-bootstrap';
import 'd3';
import 'lodash';

require('npm/bootstrap/dist/css/bootstrap.css');
require('npm/font-awesome/css/font-awesome.css');
require('../styles/app.less');

angular.module('OpenDataDiscovery', [
  'ui.bootstrap'
])
.constant('_', window._)
.run(function(routerHeler) {
  'ngInject';
  routerHeler.configureStates([
    {
      state: 'main',
      config: {
        templateUrl: 'index.html',
        url: '/'
      }
    }
  ]);
});
