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

        $scope.maxTimeLimit = 300;

        $scope.options = [
          {
            value: 30,
            label: 'last 30 seconds'
          },
          {
            value: 60,
            label: 'last minute'
          },
          {
            value: 120,
            label: 'last two minutes'
          },
          {
            value: $scope.maxTimeLimit,
            label: 'last 5 minutes'
          }
        ];
        $scope.timeFrame = $scope.options[0];


        var chartHistory = null;
        if ($scope.controller) {
          chartHistory = new MetricsChartHistory($scope, $scope.metrics, $scope.maxTimeLimit, $scope.timeFrame.value);
          $scope.controller.addPoint = function (point) {
            chartHistory.addPoint(point);
          };
        }

        $scope.timeFrameChanged = function (newTimeFrame) {
          if (chartHistory) {
            chartHistory.updateChart(Date.now(), newTimeFrame.value);
          }
        };
      },
      link: function postLink(scope) {
        scope.data = [];
      }
    };
  })
  .factory('MetricsChartHistory', function () {
    function MetricsChartHistory(scope, metrics, maxTimeLimit, timeLimit) {
      this.scope = scope;
      this.metrics = metrics;
      this.maxTimeLimit = maxTimeLimit;
      this.timeLimit = timeLimit;
      this.history = [];

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
      updateHistory: function (now, point) {
        var historyStartTime = now - this.maxTimeLimit * 1000;

        var ind = _.findIndex(this.history, function (historyPoint) {
          return historyPoint.timestamp >= historyStartTime;
        });
        if (ind > 1) {
          this.history = _.rest(this.history, ind - 1);
        }

        var historyPoint = {
          timestamp: now,
          data: point
        };
        this.history.push(historyPoint);
      },

      updateChart: function (now, timeLimit) {
        this.timeLimit = timeLimit;

        var startTime = now - 1000 * timeLimit;

        var history = _.filter(this.history, function (historyPoint) { //TODO optimize
          return historyPoint.timestamp >= startTime;
        });

        _.each(this.metrics, function (metric, index) {
          var metricKey = metric.key;

          var values = _.map(history, function (historyPoint) {
            return {
              timestamp: historyPoint.timestamp,
              value: Math.round(parseInt(historyPoint.data[metricKey], 10))
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

        if (history.length > 1) {
          this.scope.data = _.clone(this.series);
          this.scope.start = Math.min(startTime, _.first(history).timestamp);
          this.scope.end = _.last(history).timestamp;
        }
      },

      addPoint: function (point) {
        var now = Date.now();
        this.updateHistory(now, point);

        this.updateChart(now, this.timeLimit);
      }
    });

    return MetricsChartHistory;
  });