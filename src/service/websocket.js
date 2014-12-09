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
  .factory('Visibility', function ($window) {
    return $window.Visibility;
  })
  .provider('webSocket', function () {
    var visibilityTimeout = 20000;
    var maxConnectionAttempts = 5;
    var connectionAttemptInterval = 2000;
    var webSocketURL;
    var explicitConnect;
    var closeRequested;

    return {
      $get: function ($q, $rootScope, $timeout, notificationService, Visibility, $log, $window) {

        var socket;

        var webSocketService;

        var deferred = $q.defer();

        var webSocketError = false;

        var connectionAttempts = 0;

        var onopen = function () {
          $log.info('WebSocket connection has been made. URL: ', webSocketURL);
          connectionAttempts = 0;
          deferred.resolve();
          $rootScope.$apply();
        };

        var onclose = function() {
          // Reset the deferred
          deferred = $q.defer();

          // Check if this close was requested
          if (!closeRequested) {
             
            // Check connectionAttempts count
            if (connectionAttempts < maxConnectionAttempts) {
              // Try to re-establish connection
              var url = this.url;
              connectionAttempts++;
              $timeout(function() {
                $log.info('Attempting to reconnect to websocket');
                webSocketService.connect(url);
              }, connectionAttemptInterval);
            }

            else {
              $log.error('Could not re-establish the WebSocket connection.');
              notificationService.notify({
                type: 'error',
                title: 'Could not re-establish WebSocket Connection',
                text: 'The dashboard lost contact with your DataTorrent Gateway for over ' +
                      Math.round((maxConnectionAttempts * connectionAttemptInterval)/1000) +
                      ' seconds. Double-check your connection and try refreshing the page.'
              });
            }

          }

          // Otherwise reset some flags
          else {
            connectionAttempts = 0;
            closeRequested = false;
          }
        };

        // TODO: listeners for error and close, exposed on
        // service itself
        var onerror = function () {
          webSocketError = true;
          $log.error('WebSocket encountered an error');
        };

        var onmessage = function (event) {
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

        var topicMap = {}; // topic -> [callbacks] mapping

        var stopUpdates = false;


        if (Visibility.isSupported()) {
          var timeoutPromise;

          Visibility.change(angular.bind(this, function (e, state) {
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
          }));
        }

        webSocketService = {
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
          },

          disconnect: function() {
            if (!socket) {
              return;
            }
            closeRequested = true;
            socket.close();
          },

          connect: function(url) {
            if (!url) {
              if (webSocketURL) {
                url = webSocketURL;
              }
              else {
                throw new TypeError('No WebSocket connection URL specified in connect method');
              }
            }

            if (socket && socket.readyState === $window.WebSocket.OPEN) {
              $log.info('webSocket.connect called, but webSocket connection already established.');
              return;
            }

            socket = new $window.WebSocket(url);
            // deferred = $q.defer();
            socket.onopen = onopen;
            socket.onclose = onclose;
            socket.onerror = onerror;
            socket.onmessage = onmessage;

            // resubscribe to topics
            // send the subscribe message
            for (var topic in topicMap) {
              if (topicMap.hasOwnProperty(topic)) {
                var message = { type: 'subscribe', topic: topic };
                this.send(message);
              }
            }
          }
        };

        if (!explicitConnect) {
          webSocketService.connect();
        }

        return webSocketService;
      },

      setVisibilityTimeout: function (timeout) {
        visibilityTimeout = timeout;
      },

      setWebSocketURL: function (wsURL) {
        webSocketURL = wsURL;
      },

      setExplicitConnection: function(flag) {
        explicitConnect = flag;
      },

      setMaxConnectionAttempts: function(max) {
        maxConnectionAttempts = max;
      },

      setConnectionAttemptInterval: function(interval) {
        maxConnectionAttempts = interval;
      }
    };
  });
