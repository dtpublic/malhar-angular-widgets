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
  .directive('wtGauge', function () {
    return {
      replace: true,
      scope: {
        label: '@',
        min: '=',
        max: '=',
        value: '='
      },
      link: function (scope, element, attrs) {
        var config = {
          size: 200,
          label: attrs.label,
          min: undefined !== scope.min ? scope.min : 0,
          max: undefined !== scope.max ? scope.max : 100,
          minorTicks: 5
        };

        var range = config.max - config.min;
        config.yellowZones = [
          { from: config.min + range * 0.75, to: config.min + range * 0.9 }
        ];
        config.redZones = [
          { from: config.min + range * 0.9, to: config.max }
        ];

        scope.gauge = new Gauge(element[0], config);
        scope.gauge.render();

        function update(value) {
          var percentage;
          if (_.isString(value)) {
            percentage = parseFloat(value);
          } else if (_.isNumber(value)) {
            percentage = value;
          }

          if (!_.isUndefined(percentage)) {
            scope.gauge.redraw(percentage);
          }
        }

        update(0);

        scope.$watch('value', function (value) {
          if (scope.gauge) {
            update(value);
          }
        });
      }
    };
  });