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

angular.module('ui.widgets')
  .directive('wtMetricsChart', function ($filter, MetricsChartHistory) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/metricsChart/metricsChart.html',
      scope: {
        data: '=?',
        metrics: '=',
        controller: '='
      },
      controller: function ($scope) {
        var filter = $filter('date');
        var yAxisFilter = $filter('number');

        $scope.xAxisTickFormatFunction = function () {
          return function (d) {
            return filter(d, 'mm:ss');
          };
        };

        $scope.yAxisTickFormatFunction = function () {
          return function (d) {
            return yAxisFilter(d);
          };
        };

        $scope.xFunction = function () {
          return function (d) {
            return d.timestamp;
          };
        };
        $scope.yFunction = function () {
          return function (d) {
            return d.value;
          };
        };

        $scope.chartCallback = function () { // callback to access nvd3 chart
          //console.log('chartCallback');
          //console.log(arguments);
          //console.log(chart.legend.dispatch.);
          //chart.legend.dispatch.on('legendClick', function(newState) {
          //  console.log(newState);
          //});
        };
      },
      link: function postLink(scope) {
        scope.data = [];

        if (scope.controller) {
          var chartHistory = new MetricsChartHistory(scope, scope.metrics);
          scope.controller.addPoint = function (point) {
            chartHistory.addPoint(point);
          };
        }
      }
    };
  })
  .factory('MetricsChartHistory', function () {
    function MetricsChartHistory(scope, metrics) {
      this.scope = scope;
      this.history = [];
      this.metrics = metrics;

      this.series = [];

      _.each(metrics, function (metric) {
        this.series.push({
          key: metric.key,
          disabled: !metric.visible,
          color: metric.color
        });
      }.bind(this));
    }

    angular.extend(MetricsChartHistory.prototype, {
      addPoint: function (point) {
        var timeLimit = 30 * 1000;
        var now = Date.now();
        var startTime = now - timeLimit;

        var ind = _.findIndex(this.history, function (historyPoint) {
          return historyPoint.timestamp >= startTime;
        });
        if (ind > 1) {
          this.history = _.rest(this.history, ind - 1);
        }

        var historyPoint = {
          timestamp: now,
          data: point
        };
        this.history.push(historyPoint);

        _.each(this.metrics, function (metric, index) {
          var metricKey = metric.key;

          var values = _.map(this.history, function (historyPoint) {
            return {
              timestamp: historyPoint.timestamp,
              value: Math.round(parseInt(historyPoint.data[metricKey]))
            };
          });

          this.series[index].values = values;
        }.bind(this));

        /*
         //TODO this is workaround to have fixed x axis scale when no enough date is available
         chart.push({
         key: 'Left Value',
         values: [
         {timestamp: startTime, value: 0}
         ]
         });
         */

        /*
         var max = _.max(history, function (historyPoint) { //TODO optimize
         return historyPoint.stats.tuplesEmittedPSMA; //TODO
         });

         chart.push({
         key: 'Upper Value',
         values: [
         {timestamp: now - 30 * 1000, value: Math.round(max.value * 1.2)}
         ]
         });
         */

        if (this.history.length > 1) {
          this.scope.data = _.clone(this.series);
          this.scope.start = _.first(this.history).timestamp;
          this.scope.end = _.last(this.history).timestamp;
        }
      }
    });

    return MetricsChartHistory;
  });