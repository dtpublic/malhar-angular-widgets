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
    'ui.dashboard.widgets'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'view.html',
        controller: 'DemoCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .controller('DemoCtrl', function ($scope, $interval) {
    $scope.topN = [
      { name: 'item1', value: 'value1'},
      { name: 'item2', value: 'value2'}
    ];

    var widgetDefinitions = [
      {
        name: 'time',
        directive: 'wt-time'
      },
      {
        name: 'random',
        directive: 'wt-scope-watch',
        attrs: {
          value: 'randomValue'
        }
      }
    ];

    var defaultWidgets = [
      { name: 'time' },
      { name: 'random' },
      { name: 'time' },
      {
        name: 'random',
        style: {
          width: '50%'
        }
      },
      {
        name: 'time',
        style: {
          width: '50%'
        }
      }
    ];

    $scope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets
    };

    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);
  });

