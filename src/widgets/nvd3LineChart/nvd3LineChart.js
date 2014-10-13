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
  .directive('wtNvd3LineChart', function ($filter) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/nvd3LineChart/nvd3LineChart.html',
      scope: {
        data: '=data',
        showLegend: '@',
        showTimeRange: '=?',
        timeAxisFormat: '=?'
      },
      controller: function ($scope) {
        var filter = $filter('date');
        var numberFilter = $filter('number');

        $scope.xAxisTickFormatFunction = function () {
          return function (d) {
            return filter(d, $scope.timeAxisFormat);
          };
        };

        $scope.yAxisTickFormatFunction = function () {
          return function (d) {
            if (d > 999) {
              var value;
              var scale;
              if (d < 999999) {
                value = Math.round(d/1000);
                scale = 'k';
              } else {
                value = Math.round(d/1000000);
                scale = 'm';
              }
              return numberFilter(value) + scale;
            } else {
              return numberFilter(d);
            }
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
      },
      link: function postLink(scope, element, attrs) {
        if (!_.has(attrs, 'showTimeRange')) {
          scope.showTimeRange = true;
        }

        scope.timeAxisFormat = scope.timeAxisFormat || 'HH:mm';

        scope.$watch('data', function (data) {
          if (data && data[0] && data[0].values && (data[0].values.length > 1)) {
            var timeseries = _.sortBy(data[0].values, function (item) {
              return item.timestamp;
            });

            var start = timeseries[0].timestamp;
            var end = timeseries[timeseries.length - 1].timestamp;
            scope.start = start;
            scope.end = end;
          }
        });
      }
    };
  });