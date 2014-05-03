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
  .factory('WebSocketDataModel', function (WidgetDataModel, webSocket) {
    function WebSocketDataModel() {
    }

    WebSocketDataModel.prototype = Object.create(WidgetDataModel.prototype);

    WebSocketDataModel.prototype.init = function () {
      this.topic = null;
      this.callback = null;
      if (this.dataModelOptions && this.dataModelOptions.defaultTopic) {
        this.update(this.dataModelOptions.defaultTopic);
      }
    };

    WebSocketDataModel.prototype.update = function (newTopic) {
      var that = this;

      if (this.topic && this.callback) {
        webSocket.unsubscribe(this.topic, this.callback);
      }

      this.callback = function (message) {
        that.updateScope(message);
        that.widgetScope.$apply();
      };

      this.topic = newTopic;
      webSocket.subscribe(this.topic, this.callback, this.widgetScope);
    };

    WebSocketDataModel.prototype.destroy = function () {
      WidgetDataModel.prototype.destroy.call(this);

      if (this.topic && this.callback) {
        webSocket.unsubscribe(this.topic, this.callback);
      }
    };

    return WebSocketDataModel;
  })
  .factory('TimeSeriesDataModel', function (WebSocketDataModel) {
    function TimeSeriesDataModel() {
    }

    TimeSeriesDataModel.prototype = Object.create(WebSocketDataModel.prototype);

    TimeSeriesDataModel.prototype.init = function () {
      WebSocketDataModel.prototype.init.call(this);
    };

    TimeSeriesDataModel.prototype.update = function (newTopic) {
      WebSocketDataModel.prototype.update.call(this, newTopic);
      this.items = [];
    };

    TimeSeriesDataModel.prototype.updateScope = function (value) {
      value = _.isArray(value) ? value[0] : value;

      this.items.push({
        timestamp: parseInt(value.timestamp, 10), //TODO
        value: parseInt(value.value, 10) //TODO
      });

      if (this.items.length > 100) { //TODO
        this.items.shift();
      }

      var chart = {
        data: this.items,
        max: 30
      };

      WebSocketDataModel.prototype.updateScope.call(this, chart);
      this.data = [];
    };

    return TimeSeriesDataModel;
  })
  .factory('PieChartDataModel', function (WebSocketDataModel) {
    function PieChartDataModel() {
    }

    PieChartDataModel.prototype = Object.create(WebSocketDataModel.prototype);

    PieChartDataModel.prototype.init = function () {
      WebSocketDataModel.prototype.init.call(this);
      this.data = [];
    };

    PieChartDataModel.prototype.update = function (newTopic) {
      WebSocketDataModel.prototype.update.call(this, newTopic);
    };

    PieChartDataModel.prototype.updateScope = function (value) {
      var sum = _.reduce(value, function (memo, item) {
        return memo + parseFloat(item.value);
      }, 0);

      var sectors = _.map(value, function (item) {
        return {
          key: item.label,
          y: item.value / sum
        };
      });

      sectors = _.sortBy(sectors, function (item) {
        return item.key;
      });

      WebSocketDataModel.prototype.updateScope.call(this, sectors);
    };

    return PieChartDataModel;
  });
