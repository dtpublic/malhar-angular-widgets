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

angular.module('ui.websocket')
  .factory('visibly', function ($window) {
    return $window.visibly;
  })
  .provider('webSocket', function () {
    var visibilityTimeout = 20000;
    var webSocketURL;
    var webSocketObject; // for testing only

    return {
      $get: function ($q, $rootScope, $timeout, notificationService, Visibility, $log, $window) {
        if (!webSocketURL && !webSocketObject) {
          throw 'WebSocket URL is not defined';
        }

        var socket = !webSocketObject ? new $window.WebSocket(webSocketURL) : webSocketObject;

        var deferred = $q.defer();

        socket.onopen = function () {
          deferred.resolve();
          $rootScope.$apply();
        };

        var webSocketError = false;

        socket.onclose = function () {
          if (!webSocketError) {
            notificationService.notify({
              title: 'WebSocket Closed',
              text: 'WebSocket connection has been closed. Try refreshing the page.',
              type: 'error',
              icon: false,
              hide: false,
              history: false
            });
          }
        };

        //TODO
        socket.onerror = function () {
          webSocketError = true;
          notificationService.notify({
            title: 'WebSocket Error',
            text: 'WebSocket error. Try refreshing the page.',
            type: 'error',
            icon: false,
            hide: false,
            history: false
          });
        };

        var topicMap = {}; // topic -> [callbacks] mapping

        var stopUpdates = false;

        socket.onmessage = function (event) {
          if (stopUpdates) { // stop updates if page is inactive
            return;
          }

          var message = JSON.parse(event.data);

          var topic = message.topic;

          if (topicMap.hasOwnProperty(topic)) {
            if ($window.WS_DEBUG) {
              if ($window.WS_DEBUG === true) {
                $log.debug('WebSocket ', topic, ' => ', message.data);
              }
              else {
                var search = new RegExp($window.WS_DEBUG + '');
                if (search.test(topic)) {
                  $log.debug('WebSocket ', topic, ' => ', message.data);
                }
              }
            }
            topicMap[topic].fire(message.data);
          }
        };

        if (Visibility.isSupported()) {
          var timeoutPromise;

          Visibility.change(function (e, state) {
            if (state === 'hidden') {
              timeoutPromise = $timeout(function () {
                stopUpdates = true;
                timeoutPromise = null;
              }, visibilityTimeout);
            } else {
              stopUpdates = false;

              if (timeoutPromise) {
                $timeout.cancel(timeoutPromise);
              }

              $log.debug('visible');
            }
          }.bind(this));
        }

        return {
          send: function (message) {
            var msg = JSON.stringify(message);

            deferred.promise.then(function () {
              $log.debug('send ' + msg);
              socket.send(msg);
            });
          },

          subscribe: function (topic, callback, $scope) {
            var callbacks = topicMap[topic];

            // If a jQuery.Callbacks object has not been created for this
            // topic, one should be created and a "subscribe" message 
            // should be sent.
            if (!callbacks) {

              // send the subscribe message
              var message = { type: 'subscribe', topic: topic };
              this.send(message);

              // create the Callbacks object
              callbacks = jQuery.Callbacks();
              topicMap[topic] = callbacks;
            }

            // When scope is provided...
            if ($scope) {

              // ...it's $digest method should be called
              // after the callback has been triggered, so
              // we have to wrap the function.
              var wrappedCallback = function () {
                callback.apply({}, arguments);
                $scope.$digest();
              };
              callbacks.add(wrappedCallback);

              // We should also be listening for the destroy
              // event so we can automatically unsubscribe.
              $scope.$on('$destroy', angular.bind(this, function () {
                this.unsubscribe(topic, wrappedCallback);
              }));

              return wrappedCallback;
            }
            else {
              callbacks.add(callback);
              return callback;
            }
          },

          unsubscribe: function (topic, callback) {
            if (topicMap.hasOwnProperty(topic)) {
              var callbacks = topicMap[topic];
              callbacks.remove(callback);

              // callbacks.has() will return false
              // if there are no more handlers
              // registered in this callbacks collection.
              if (!callbacks.has()) {
                
                // Send the unsubscribe message first
                var message = { type: 'unsubscribe', topic: topic };
                this.send(message);

                // Then remove the callbacks object for this topic
                delete topicMap[topic];
                
              }
            }
          }
        };
      },

      setVisibilityTimeout: function (timeout) {
        visibilityTimeout = timeout;
      },

      setWebSocketURL: function (wsURL) {
        webSocketURL = wsURL;
      },

      setWebSocketObject: function (wsObject) {
        webSocketObject = wsObject;
      }
    };
  });
