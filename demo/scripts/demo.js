/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

angular.module('app', [
    'ngRoute',
    'ui.dashboard',
    'ui.widgets',
    'ui.models'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/view.html',
        controller: 'DemoCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .controller('DemoCtrl', function ($scope, $interval, RandomTopNDataModel, RandomTimeSeriesDataModel,
                                    RandomMinutesDataModel, RandomNVD3TimeSeriesDataModel, RandomMetricsTimeSeriesDataModel) {
    var widgetDefinitions = [
      {
        name: 'time',
        directive: 'wt-time',
        style: {
          width: '33%'
        }
      },
      {
        name: 'random',
        directive: 'wt-random',
        style: {
          width: '33%'
        }
      },
      {
        name: 'scope-watch',
        directive: 'wt-scope-watch',
        attrs: {
          value: 'randomValue'
        },
        style: {
          width: '34%'
        }
      },
      {
        name: 'Metrics Chart',
        directive: 'wt-metrics-chart',
        dataAttrName: 'data',
        dataModelType: RandomMetricsTimeSeriesDataModel,
        style: {
          width: '50%'
        }
      },
      {
        name: 'NVD3 Line Chart',
        directive: 'wt-nvd3-line-chart',
        dataAttrName: 'data',
        dataModelType: RandomNVD3TimeSeriesDataModel,
        dataModelArgs: {
          rate: 40
        },
        attrs: {
          'show-time-range': true
        },
        style: {
          width: '50%'
        }
      },
      {
        name: 'Line Chart',
        directive: 'wt-line-chart',
        dataAttrName: 'chart',
        dataModelType: RandomTimeSeriesDataModel,
        style: {
          width: '50%'
        }
      },
      {
        name: 'Bar Chart',
        directive: 'wt-bar-chart',
        dataAttrName: 'data',
        dataModelType: RandomMinutesDataModel,
        dataModelArgs: {
          limit: 1000
        },
        style: {
          width: '50%'
        }
      },
      {
        name: 'topN',
        directive: 'wt-top-n',
        dataAttrName: 'data',
        dataModelType: RandomTopNDataModel
      },
      {
        name: 'gauge',
        directive: 'wt-gauge',
        attrs: {
          value: 'percentage'
        },
        style: {
          width: '250px'
        }
      },
    ];

    var defaultWidgets = [
      { name: 'time' },
      { name: 'random' },
      { name: 'scope-watch' },
      { name: 'Metrics Chart' },
      { name: 'NVD3 Line Chart' },
      { name: 'Line Chart' },
      { name: 'Bar Chart' },
      { name: 'topN' },
      { name: 'gauge' }
    ];

    $scope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets
    };

    // random scope value (scope-watch widget)
    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);

    // percentage (gauge widget, progressbar widget)
    $scope.percentage = 5;
    $interval(function () {
      $scope.percentage = ($scope.percentage + 10) % 100;
    }, 1000);

    // line chart widget
    $interval(function () {
      $scope.topN = _.map(_.range(0, 10), function (index) {
        return {
          name: 'item' + index,
          value: Math.floor(Math.random() * 100)
        };
      });
    }, 500);
  });

