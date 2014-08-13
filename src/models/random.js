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

angular.module('ui.models')
  .factory('RandomBaseDataModel', function (WidgetDataModel, Visibility) {
    function RandomBaseDataModel() {
    }

    RandomBaseDataModel.prototype = Object.create(WidgetDataModel.prototype);
    RandomBaseDataModel.prototype.constructor = WidgetDataModel;

    angular.extend(RandomBaseDataModel.prototype, {
      init: function () {
        this.stopUpdates = false;
        this.visibilityListener = Visibility.change(function (e, state) {
          if (state === 'hidden') {
            this.stopUpdates = true;
          } else {
            this.stopUpdates = false;
          }
        }.bind(this));
      },

      updateScope: function (data) {
        if (!this.stopUpdates) {
          WidgetDataModel.prototype.updateScope.call(this, data);
        }
      },

      destroy: function () {
        WidgetDataModel.prototype.destroy.call(this);
        Visibility.unbind(this.visibilityListener);
      }
    });

    return RandomBaseDataModel;
  })
  .factory('RandomPercentageDataModel', function (RandomBaseDataModel, $interval) {
    function RandomPercentageDataModel() {
    }

    RandomPercentageDataModel.prototype = Object.create(RandomBaseDataModel.prototype);

    RandomPercentageDataModel.prototype.init = function () {
      var value = 50;

      this.intervalPromise = $interval(function () {
        value += Math.random() * 40 - 20;
        value = value < 0 ? 0 : value > 100 ? 100 : value;

        this.updateScope(value);
      }.bind(this), 500);
    };

    RandomPercentageDataModel.prototype.destroy = function () {
      RandomBaseDataModel.prototype.destroy.call(this);
      $interval.cancel(this.intervalPromise);
    };

    return RandomPercentageDataModel;
  })
  .factory('RandomTopNDataModel', function (RandomBaseDataModel, $interval) {
    function RandomTopNDataModel() {
    }

    RandomTopNDataModel.prototype = Object.create(RandomBaseDataModel.prototype);

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
      RandomBaseDataModel.prototype.destroy.call(this);
      $interval.cancel(this.intervalPromise);
    };

    return RandomTopNDataModel;
  })
  .factory('RandomBaseTimeSeriesDataModel', function (RandomBaseDataModel, $interval) {
    function RandomTimeSeriesDataModel(options) {
      this.rate = (options && options.rate) ? options.rate : 50;
    }

    RandomTimeSeriesDataModel.prototype = Object.create(RandomBaseDataModel.prototype);
    RandomTimeSeriesDataModel.prototype.constructor = RandomBaseDataModel;

    RandomTimeSeriesDataModel.prototype.init = function () {
      RandomBaseDataModel.prototype.init.call(this);

      var max = 30;
      var data = [];
      var chartValue = 50;
      var rate = this.rate;

      function nextValue() {
        chartValue += Math.random() * rate - rate/2;
        chartValue = chartValue < 0 ? 0 : chartValue > 100 ? 100 : chartValue;
        return Math.round(chartValue);
      }

      var now = Date.now();
      for (var i = max - 1; i >= 0; i--) {
        data.push({
          timestamp: now - i * 1000,
          value: nextValue()
        });
      }

      this.updateScope(data);

      this.intervalPromise = $interval(function () {
        if (data.length >= max) {
          data.shift();
        }
        data.push({
          timestamp: Date.now(),
          value: nextValue()
        });

        this.updateScope(data);
      }.bind(this), 1000);
    };

    RandomTimeSeriesDataModel.prototype.destroy = function () {
      RandomBaseDataModel.prototype.destroy.call(this);
      $interval.cancel(this.intervalPromise);
    };

    return RandomTimeSeriesDataModel;
  })
  .factory('RandomTimeSeriesDataModel', function (RandomBaseTimeSeriesDataModel) {
    function RandomTimeSeriesDataModel(options) {
      RandomBaseTimeSeriesDataModel.call(this, options);
    }

    RandomTimeSeriesDataModel.prototype = Object.create(RandomBaseTimeSeriesDataModel.prototype);

    angular.extend(RandomTimeSeriesDataModel.prototype, {
      updateScope: function (data) {
        var chart = {
          data: data,
          max: 30,
          chartOptions: {
            vAxis: {}
          }
        };

        RandomBaseTimeSeriesDataModel.prototype.updateScope.call(this, chart);
      }
    });

    return RandomTimeSeriesDataModel;
  })
  .factory('RandomMetricsTimeSeriesDataModel', function (RandomBaseTimeSeriesDataModel) {
    function RandomMetricsTimeSeriesDataModel(options) {
      RandomBaseTimeSeriesDataModel.call(this, options);
    }

    RandomMetricsTimeSeriesDataModel.prototype = Object.create(RandomBaseTimeSeriesDataModel.prototype);

    angular.extend(RandomMetricsTimeSeriesDataModel.prototype, {
      updateScope: function (data) {
        var chart = [
          {
            key: 'Stream1',
            values: data
          },
          {
            key: 'Stream2',
            values: _.map(data, function (item) { return { timestamp:item.timestamp, value: item.value + 10 }; })
          }
        ];

        RandomBaseTimeSeriesDataModel.prototype.updateScope.call(this, chart);
      }
    });

    return RandomMetricsTimeSeriesDataModel;
  })
  .factory('RandomNVD3TimeSeriesDataModel', function (RandomBaseTimeSeriesDataModel) {
    function RandomTimeSeriesDataModel(options) {
      RandomBaseTimeSeriesDataModel.call(this, options);
    }

    RandomTimeSeriesDataModel.prototype = Object.create(RandomBaseTimeSeriesDataModel.prototype);

    angular.extend(RandomTimeSeriesDataModel.prototype, {
      updateScope: function (data) {
        var chart = [
          {
            key: 'Data',
            values: data
          }
        ];

        RandomBaseTimeSeriesDataModel.prototype.updateScope.call(this, chart);
      }
    });

    return RandomTimeSeriesDataModel;
  })
  .factory('RandomMinutesDataModel', function (RandomBaseDataModel, $interval) {
    function RandomTimeSeriesDataModel(options) {
      this.limit = (options && options.limit) ? options.limit : 500;
    }

    RandomTimeSeriesDataModel.prototype = Object.create(RandomBaseDataModel.prototype);

    RandomTimeSeriesDataModel.prototype.init = function () {
      this.generateChart();
      this.intervalPromise = $interval(this.generateChart.bind(this), 2000);
    };

    RandomTimeSeriesDataModel.prototype.generateChart = function () {
      var minuteCount = 30;
      var data = [];
      var limit = this.limit;
      var chartValue = limit / 2;

      function nextValue() {
        chartValue += Math.random() * (limit * 0.4) - (limit * 0.2);
        chartValue = chartValue < 0 ? 0 : chartValue > limit ? limit : chartValue;
        return chartValue;
      }

      var now = Date.now();

      for (var i = minuteCount - 1; i >= 0; i--) {
        data.push({
          timestamp: now - i * 1000 * 60,
          value: nextValue()
        });
      }

      var widgetData = [
        {
          key: 'Data',
          values: data
        }
      ];

      this.updateScope(widgetData);
    };

    RandomTimeSeriesDataModel.prototype.destroy = function () {
      RandomBaseDataModel.prototype.destroy.call(this);
      $interval.cancel(this.intervalPromise);
    };

    return RandomTimeSeriesDataModel;
  });