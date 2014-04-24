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

angular.module('ui.dashboard.widgets', ['ngGrid']);

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

angular.module('ui.dashboard.widgets')
  .directive('wtHistoricalChart', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/historicalChart/historicalChart.html',
      scope: {
        chart: '='
      },
      controller: function ($scope) {
        $scope.mode = 'MINUTES';

        $scope.changeMode = function (mode) {
          $scope.mode = mode;
          $scope.$emit('modeChanged', mode);
        };
      }
    };
  });
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

angular.module('ui.dashboard.widgets')
  .directive('wtLineChart', function () {
    return {
      template: '<div></div>',
      scope: {
        chart: '='
      },
      replace: true,
      link: function postLink(scope, element) {
        var lineChart = new google.visualization.LineChart(element[0]);

        function draw(chart) {
          var data = chart.data;

          var table = new google.visualization.DataTable();
          table.addColumn('datetime');
          table.addColumn('number');
          table.addRows(data.length);

          var view = new google.visualization.DataView(table);

          for (var i = 0; i < data.length; i++) {
            var item = data[i];
            table.setCell(i, 0, new Date(item.timestamp));
            var value = parseFloat(item.value);
            table.setCell(i, 1, value);
          }

          var chartOptions = {
            legend: 'none',
            vAxis: { minValue: 0, maxValue: 100 }
            //chartArea: { top: 20, left: 30, height: 240 }
          };

          if (chart.max) {
            var lastTimestamp;

            if (data.length) {
              var last = data[data.length - 1];
              lastTimestamp = last.timestamp;
            } else {
              lastTimestamp = Date.now();
            }

            var max = new Date(lastTimestamp);
            var min = new Date(lastTimestamp - (chart.max - 1) * 1000);

            angular.extend(chartOptions, {
              hAxis: { viewWindow: { min: min, max: max }}
            });
          }

          if (chart.chartOptions) {
            angular.extend(chartOptions, chart.chartOptions);
          }

          lineChart.draw(view, chartOptions);
        }

        scope.$watch('chart', function (chart) {
          if (!chart) {
            chart = {
              data: [],
              max: 30
            };
          }

          if (chart.data) {
            draw(chart);
          }
        });
      }
    };
  });
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

angular.module('ui.dashboard.widgets')
  .directive('wtPieChart', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/pieChart/pieChart.html',
      scope: {
        data: '=data'
      },
      controller: function ($scope) {
        $scope.xFunction = function(){
          return function(d) {
            return d.key;
          };
        };
        $scope.yFunction = function(){
          return function(d) {
            return d.y;
          };
        };

        $scope.descriptionFunction = function(){
          return function(d){
            return d.key + ' ' + d.y;
          };
        };
      }
    };
  });
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

angular.module('ui.dashboard.widgets')
  .directive('wtRandom', function ($interval) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/random/random.html',
      link: function postLink(scope) {
        function update() {
          scope.number = Math.floor(Math.random() * 100);
        }

        var promise = $interval(update, 500);

        scope.$on('$destroy', function () {
          $interval.cancel(promise);
        });
      }
    };
  });
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

angular.module('ui.dashboard.widgets')
  .directive('wtScopeWatch', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/scopeWatch/scopeWatch.html',
      scope: {
        scopeValue: '=value',
        valueClass: '@valueClass'
      }
    };
  });
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

angular.module('ui.dashboard.widgets')
  .directive('wtTime', function ($interval) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/time/time.html',
      link: function (scope) {
        function update() {
          scope.time = new Date().toLocaleTimeString();
        }

        var promise = $interval(update, 500);

        scope.$on('$destroy', function () {
          $interval.cancel(promise);
        });
      }
    };
  });
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

angular.module('ui.dashboard.widgets')
  .directive('wtTopN', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/topN/topN.html',
      scope: {
        data: '='
      },
      controller: function ($scope) {
        $scope.gridOptions = {
          data: 'items',
          enableRowSelection: false,
          enableColumnResize: false,
          columnDefs: [
            { field: 'name', displayName: 'Name' },
            { field: 'value', displayName: 'Value' }
          ]
        };
      },
      link: function postLink(scope) {
        scope.$watch('data', function (data) {
          if (data) {
            scope.items = _.sortBy(data, function (item) {
              return (-item.value);
            });
          }
        });
      }
    };
  });
angular.module("ui.dashboard.widgets").run(["$templateCache", function($templateCache) {

  $templateCache.put("template/widgets/historicalChart/historicalChart.html",
    "<div>\n" +
    "    <div class=\"btn-toolbar\">\n" +
    "        <div class=\"btn-group\" style=\"float: right;\">\n" +
    "            <button type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"changeMode('MINUTES')\"\n" +
    "                    ng-class=\"{active: mode === 'MINUTES'}\">Minutes</button>\n" +
    "            <button type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"changeMode('HOURS')\"\n" +
    "                    ng-class=\"{active: mode === 'HOURS'}\">Hours</button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div wt-line-chart chart=\"chart\"></div>\n" +
    "</div>"
  );

  $templateCache.put("template/widgets/pieChart/pieChart.html",
    "<div>\n" +
    "<nvd3-pie-chart\n" +
    "    data=\"data\"\n" +
    "    showLegend=\"true\"\n" +
    "    width=\"300\" height=\"300\"\n" +
    "    showlabels=\"true\"\n" +
    "    labelType=\"percent\"\n" +
    "    interactive=\"true\"\n" +
    "    x=\"xFunction()\"\n" +
    "    y=\"yFunction()\">\n" +
    "</nvd3-pie-chart>\n" +
    "</div>"
  );

  $templateCache.put("template/widgets/random/random.html",
    "<div>\n" +
    "    Random Number\n" +
    "    <div class=\"alert alert-info\">{{number}}</div>\n" +
    "</div>"
  );

  $templateCache.put("template/widgets/scopeWatch/scopeWatch.html",
    "<div>\n" +
    "    Value\n" +
    "    <div class=\"alert\" ng-class=\"valueClass || 'alert-warning'\">{{scopeValue || 'no data'}}</div>\n" +
    "</div>"
  );

  $templateCache.put("template/widgets/time/time.html",
    "<div>\n" +
    "    Time\n" +
    "    <div class=\"alert alert-success\">{{time}}</div>\n" +
    "</div>"
  );

  $templateCache.put("template/widgets/topN/topN.html",
    "<div class=\"top-n\">\n" +
    "    <div ng-grid=\"gridOptions\" class=\"grid\"></div>\n" +
    "</div>"
  );

}]);
