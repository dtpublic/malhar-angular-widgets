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
    'ui.dashboard.widgets',
    'ui.dashboard'
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
  .controller('DemoCtrl', function ($scope, $interval, RandomTopNDataModel, RandomTimeSeriesDataModel) {
    var widgetDefinitions = [
      {
        name: 'topN',
        directive: 'wt-top-n',
        dataAttrName: 'data',
        dataModelType: RandomTopNDataModel
      },
      {
        name: 'Line Chart',
        directive: 'wt-line-chart',
        dataAttrName: 'chart',
        dataModelType: RandomTimeSeriesDataModel,
        style: {
          width: '50%'
        }
      }
    ];

    var defaultWidgets = [
      { name: 'topN' },
      { name: 'Line Chart' }
    ];

    $scope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets
    };

    $interval(function () {
      $scope.topN = _.map(_.range(0, 10), function (index) {
        return {
          name: 'item' + index,
          value: Math.floor(Math.random() * 100)
        };
      });
    }, 500);
  })
  .factory('RandomTopNDataModel', function (WidgetDataModel, $interval) {
    function RandomTopNDataModel() {
    }

    RandomTopNDataModel.prototype = Object.create(WidgetDataModel.prototype);

    RandomTopNDataModel.prototype.init = function () {
      this.intervalPromise = $interval(function () {
        var topTen = _.map(_.range(0, 10), function (index) {
          return {
            name: 'item' + index,
            value: Math.floor(Math.random() * 100)
          };
        });
        this.updateScope(topTen);
      }.bind(this), 500);
    };

    RandomTopNDataModel.prototype.destroy = function () {
      WidgetDataModel.prototype.destroy.call(this);
      $interval.cancel(this.intervalPromise);
    };

    return RandomTopNDataModel;
  })
  .factory('RandomTimeSeriesDataModel', function (WidgetDataModel, $interval) {
    function RandomTimeSeriesDataModel() {
    }

    RandomTimeSeriesDataModel.prototype = Object.create(WidgetDataModel.prototype);

    RandomTimeSeriesDataModel.prototype.init = function () {
      var max = 30;
      var data = [];
      var chartValue = 50;

      function nextValue() {
        chartValue += Math.random() * 40 - 20;
        chartValue = chartValue < 0 ? 0 : chartValue > 100 ? 100 : chartValue;
        return chartValue;
      }

      var now = Date.now();
      for (var i = max - 1; i >= 0; i--) {
        data.push({
          timestamp: now - i * 1000,
          value: nextValue()
        });
      }
      var chart = {
        data: data,
        max: max,
        chartOptions: {
          vAxis: {}
        }
      };
      this.updateScope(chart);

      this.intervalPromise = $interval(function () {
        data.shift();
        data.push({
          timestamp: Date.now(),
          value: nextValue()
        });

        var chart = {
          data: data,
          max: max
        };

        this.updateScope(chart);
      }.bind(this), 1000);
    };

    RandomTimeSeriesDataModel.prototype.destroy = function () {
      WidgetDataModel.prototype.destroy.call(this);
      $interval.cancel(this.intervalPromise);
    };

    return RandomTimeSeriesDataModel;
  });

