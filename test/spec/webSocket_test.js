/*
 * Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
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

describe('Service: webSocket', function () {

  var webSocket, webSocketObject, notificationService, $rootScope, $timeout, WebSocket, Visibility, visibilityIsSupported, $window, wsUrl;

  describe('when explicitConnection is disabled', function() {

    describe('when url is provided by calling provider.setWebSocketURL', function() {

      beforeEach(module('ui.websocket', function($provide, webSocketProvider) {

        WebSocket = function(url, protocol) {
          webSocketObject = this;
          wsUrl = url;
        };

        Visibility = {
          change: jasmine.createSpy(),
          isSupported: function() {
            return visibilityIsSupported;
          }
        };

        visibilityIsSupported = true;
        
        $provide.value('$window', $window = {
          Visibility: Visibility,
          WebSocket: WebSocket
        });

        spyOn($window, 'WebSocket').andCallThrough();

        webSocketProvider.setWebSocketURL('ws://testing.com');

      }));

      beforeEach(inject(function (_webSocket_, _notificationService_, _$rootScope_) {
        webSocket = _webSocket_;
        notificationService = _notificationService_;
        $rootScope = _$rootScope_;
      }));
      
      it('should instantiate a WebSocket immediately with the url set with provider.setWebSocketURL', function() {
        expect($window.WebSocket).toHaveBeenCalledWith('ws://testing.com');
      });

    });

    describe('when the url is not provided by calling provider.setWebSocketURL', function() {

      beforeEach(module('ui.websocket', function($provide, webSocketProvider) {

        WebSocket = function(url, protocol) {
          webSocketObject = this;
          wsUrl = url;
        };

        Visibility = {
          change: jasmine.createSpy(),
          isSupported: function() {
            return visibilityIsSupported;
          }
        };

        visibilityIsSupported = true;
        
        $provide.value('$window', $window = {
          Visibility: Visibility,
          WebSocket: WebSocket
        });

        spyOn($window, 'WebSocket').andCallThrough();

      }));
      
      it('should throw if a URL was not set with provider.setWebSocketURL', function() {
        expect(function() {
          inject(function(webSocket) {
            // should not get here
          });
        }).toThrow();
      });

    });

  });

  describe('when explicitConnection is enabled', function() {
    
    describe('when url is provided by calling provider.setWebSocketURL', function() {
      
      beforeEach(module('ui.websocket', function($provide, webSocketProvider) {

        WebSocket = function(url, protocol) {
          webSocketObject = this;
          wsUrl = url;
        };

        Visibility = {
          change: jasmine.createSpy(),
          isSupported: function() {
            return visibilityIsSupported;
          }
        };

        visibilityIsSupported = true;
        
        $provide.value('$window', $window = {
          Visibility: Visibility,
          WebSocket: WebSocket
        });

        spyOn($window, 'WebSocket').andCallThrough();

        webSocketProvider.setExplicitConnection(true);

        webSocketProvider.setWebSocketURL('ws://testing.com');

      }));

      beforeEach(inject(function (_webSocket_, _notificationService_, _$rootScope_) {
        webSocket = _webSocket_;
        notificationService = _notificationService_;
        $rootScope = _$rootScope_;
      }));

      it('should not call WebSocket immediately', function() {
        expect($window.WebSocket).not.toHaveBeenCalled();
      });

      it('should instantiate a WebSocket with the url set with provider.setWebSocketURL if no url arg is passed to it', function() {
        webSocket.connect();
        expect($window.WebSocket).toHaveBeenCalledWith('ws://testing.com');
      });

    });

    describe('when the url is not provided by calling provider.setWebSocketURL', function() {
      
      beforeEach(module('ui.websocket', function($provide, webSocketProvider) {

        WebSocket = function(url, protocol) {
          webSocketObject = this;
          wsUrl = url;
        };

        Visibility = {
          change: jasmine.createSpy(),
          isSupported: function() {
            return visibilityIsSupported;
          }
        };

        visibilityIsSupported = true;
        
        $provide.value('$window', $window = {
          Visibility: Visibility,
          WebSocket: WebSocket
        });

        spyOn($window, 'WebSocket').andCallThrough();

        webSocketProvider.setExplicitConnection(true);

      }));

      beforeEach(inject(function (_webSocket_, _notificationService_, _$rootScope_) {
        webSocket = _webSocket_;
        notificationService = _notificationService_;
        $rootScope = _$rootScope_;
      }));

      it('should not call WebSocket immediately', function() {
        expect($window.WebSocket).not.toHaveBeenCalled();
      });

      it('should instantiate a WebSocket with the provided url', function() {
        webSocket.connect('ws://my-other-url.com');
        expect($window.WebSocket).toHaveBeenCalledWith('ws://my-other-url.com');
      });

      it('should throw if no url is passed and no url was set with provider.setWebSocketURL', function() {
        expect(function() {
          webSocket.connect();
        }).toThrow();
      });

    });

  });

  describe('the send method', function() {
    
    var wsUrl;

    beforeEach(module('ui.websocket', function($provide, webSocketProvider) {

      WebSocket = function(url, protocol) {
        webSocketObject = this;
        wsUrl = url;
        this.send = jasmine.createSpy();
      };

      Visibility = {
        change: jasmine.createSpy(),
        isSupported: function() {
          return visibilityIsSupported;
        }
      };

      visibilityIsSupported = true;
      
      $provide.value('$window', $window = {
        Visibility: Visibility,
        WebSocket: WebSocket
      });

      spyOn($window, 'WebSocket').andCallThrough();

      webSocketProvider.setWebSocketURL('ws://testing.com');

    }));

    beforeEach(inject(function (_webSocket_, _notificationService_, _$rootScope_) {
      webSocket = _webSocket_;
      notificationService = _notificationService_;
      $rootScope = _$rootScope_;
    }));

    it('should send message when WebSocket connection is opened', inject(function () {
      expect(webSocketObject.onopen).toBeDefined();

      webSocket.send({});

      expect(webSocketObject.send).not.toHaveBeenCalled(); // no connection yet

      webSocketObject.onopen();

      expect(webSocketObject.send).toHaveBeenCalled();
    }));

    it('should notify subscribers', function () {
      expect(webSocketObject.onmessage).toBeDefined();

      var listener1 = jasmine.createSpy();
      var listener2 = jasmine.createSpy();

      webSocket.subscribe('test', listener1);
      webSocket.subscribe('test', listener2);

      var message1 = { topic: 'test', data: { value: 100 } };
      webSocketObject.onmessage({ data: JSON.stringify(message1) });

      expect(listener1).toHaveBeenCalledWith({ value: 100 });
      expect(listener2).toHaveBeenCalledWith({ value: 100 });

      var message2 = { topic: 'test', data: { value: 50 } };
      webSocketObject.onmessage({ data: JSON.stringify(message2) });

      expect(listener1).toHaveBeenCalledWith({ value: 50 });
      expect(listener2).toHaveBeenCalledWith({ value: 50 });
    });

    it('should send a subscribe message', function() {
      var listener1 = jasmine.createSpy();
      spyOn(webSocket, 'send');
      webSocket.subscribe('testing', listener1);
      expect(webSocket.send).toHaveBeenCalledWith({ type: 'subscribe', topic: 'testing' });
    });

    it('should unsubscribe single callback', function () {
      expect(webSocketObject.onmessage).toBeDefined();

      var listener1 = jasmine.createSpy();
      var listener2 = jasmine.createSpy();

      webSocket.subscribe('test', listener1);
      webSocket.subscribe('test', listener2);

      var message = { topic: 'test', data: {} };
      var event = { data: JSON.stringify(message) };
      webSocketObject.onmessage(event);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      webSocket.unsubscribe('test', listener1);

      webSocketObject.onmessage(event);

      expect(listener1.callCount).toEqual(1);
      expect(listener2.callCount).toEqual(2);
    });

    it('should unsubscribe all listeners when second argument is omitted', function () {
      expect(webSocketObject.onmessage).toBeDefined();

      var listener1 = jasmine.createSpy();
      var listener2 = jasmine.createSpy();

      webSocket.subscribe('test', listener1);
      webSocket.subscribe('test', listener2);

      var message = { topic: 'test', data: {} };
      var event = { data: JSON.stringify(message) };
      webSocketObject.onmessage(event);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      webSocket.unsubscribe('test');

      webSocketObject.onmessage(event);

      expect(listener1.callCount).toEqual(1);
      expect(listener2.callCount).toEqual(1);
    });


    it('should call unsubscribe on scope destroy', function () {
      var listener = jasmine.createSpy();
      var scope = $rootScope.$new();

      spyOn(webSocket, 'unsubscribe');

      webSocket.subscribe('test', listener, scope);

      expect(webSocket.unsubscribe).not.toHaveBeenCalled();

      scope.$destroy();

      expect(webSocket.unsubscribe).toHaveBeenCalled();

    });

    it('should send an unsubscribe message when there are no more listeners for a given topic', function() {
      
      var listener1 = jasmine.createSpy();
      spyOn(webSocket, 'send');
      webSocket.subscribe('testing', listener1);
      expect(webSocket.send).toHaveBeenCalledWith({ type: 'subscribe', topic: 'testing' });
      webSocket.unsubscribe('testing', listener1);
      expect(webSocket.send).toHaveBeenCalledWith({ type: 'unsubscribe', topic: 'testing' });
    });

    it('should send a subscribe message again if a topic has previously been unsubscribed to', function() {
      var listener1 = jasmine.createSpy();
      spyOn(webSocket, 'send');
      webSocket.subscribe('testing', listener1);
      expect(webSocket.send).toHaveBeenCalledWith({ type: 'subscribe', topic: 'testing' });
      webSocket.unsubscribe('testing', listener1);
      expect(webSocket.send).toHaveBeenCalledWith({ type: 'unsubscribe', topic: 'testing' });
      webSocket.subscribe('testing', listener1);
      expect(webSocket.send.calls[2].args[0]).toEqual({ type: 'subscribe', topic: 'testing' });
    });

  });

  describe('the connect method', function() {
    
    beforeEach(module('ui.websocket', function($provide, webSocketProvider) {
      WebSocket = function(url, protocol) {
        webSocketObject = this;
        wsUrl = url;
        this.send = jasmine.createSpy();
        this.close = function() {
          this.onclose();
        };
      };
      WebSocket.OPEN = 1;

      Visibility = {
        change: jasmine.createSpy(),
        isSupported: function() {
          return visibilityIsSupported;
        }
      };

      visibilityIsSupported = true;
      
      $provide.value('$window', $window = {
        Visibility: Visibility,
        WebSocket: WebSocket
      });
      webSocketProvider.setExplicitConnection(true);
      webSocketProvider.setWebSocketURL('ws://testing.com');

    }));

    beforeEach(inject(function (_webSocket_, _notificationService_, _$rootScope_, _$timeout_) {
      webSocket = _webSocket_;
      notificationService = _notificationService_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      webSocket.connect();

      webSocketObject.onopen();

      spyOn(webSocketObject, 'close').andCallThrough();
      // spyOn(webSocket, 'connect').andCallThrough();
    }));

    it('should not throw', function() {
      expect(function() {
        webSocket.connect();
      }).not.toThrow();
    });

    it('should do nothing if an open WebSocket instance is already there', function() {
      var initObj = webSocketObject;
      initObj.readyState = WebSocket.OPEN;
      webSocket.connect();
      expect(initObj === webSocketObject).toEqual(true);
    });

  });

  describe('the disconnect method', function() {
    
    beforeEach(module('ui.websocket', function($provide, webSocketProvider) {

      WebSocket = function(url, protocol) {
        webSocketObject = this;
        wsUrl = url;
        this.send = jasmine.createSpy();
        this.close = function() {
          this.onclose();
        };
      };

      Visibility = {
        change: jasmine.createSpy(),
        isSupported: function() {
          return visibilityIsSupported;
        }
      };

      visibilityIsSupported = true;
      
      $provide.value('$window', $window = {
        Visibility: Visibility,
        WebSocket: WebSocket
      });

      spyOn($window, 'WebSocket').andCallThrough();
      webSocketProvider.setExplicitConnection(true);
      webSocketProvider.setWebSocketURL('ws://testing.com');

    }));

    describe('when the webSocket has been connected', function() {

      beforeEach(inject(function (_webSocket_, _notificationService_, _$rootScope_, _$timeout_) {
        webSocket = _webSocket_;
        notificationService = _notificationService_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        webSocket.connect();

        webSocketObject.onopen();

        spyOn(webSocketObject, 'close').andCallThrough();
        spyOn(webSocket, 'connect');
      }));

      it('should call the close method of the WebSocket', function() {
        webSocket.disconnect();
        expect(webSocketObject.close).toHaveBeenCalled();
      });

      it('should not try to re-establish connection after connectionAttemptInterval', function() {
        webSocket.disconnect();
        $timeout.verifyNoPendingTasks();
      });

    });

    describe('when the webSocket has not connected', function() {
      
      beforeEach(inject(function (_webSocket_, _notificationService_, _$rootScope_, _$timeout_) {
        webSocket = _webSocket_;
        notificationService = _notificationService_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        spyOn(webSocket, 'connect');
      }));

      it('should not throw', function() {
        expect(function() {
          webSocket.disconnect();
        }).not.toThrow();
      });

    });

  });

  describe('when the connection gets unexpectedly closed', function() {

    beforeEach(module('ui.websocket', function($provide, webSocketProvider) {

      WebSocket = function(url, protocol) {
        webSocketObject = this;
        wsUrl = url;
        this.send = jasmine.createSpy();
        this.close = function() {
          this.onclose();
        };
      };

      Visibility = {
        change: jasmine.createSpy(),
        isSupported: function() {
          return visibilityIsSupported;
        }
      };

      visibilityIsSupported = true;
      
      $provide.value('$window', $window = {
        Visibility: Visibility,
        WebSocket: WebSocket
      });

      spyOn($window, 'WebSocket').andCallThrough();

      webSocketProvider.setWebSocketURL('ws://testing.com');
      webSocketProvider.setConnectionAttemptInterval(1000);
      webSocketProvider.setMaxConnectionAttempts(3);

    }));

    beforeEach(inject(function (_webSocket_, _notificationService_, _$rootScope_, _$timeout_) {
      webSocket = _webSocket_;
      notificationService = _notificationService_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;

      webSocketObject.onopen();

      spyOn(webSocketObject, 'close').andCallThrough();
      spyOn(webSocket, 'connect').andCallThrough();
    }));
    
    it('should try to re-establish connection', function() {
      webSocketObject.onclose();
      $timeout.flush();
      expect(webSocket.connect).toHaveBeenCalled();
    });

    it('should try maxConnectionAttempts times', function() {
      webSocketObject.onclose();
      $timeout.flush();
      webSocketObject.onclose();
      $timeout.flush();
      webSocketObject.onclose();
      $timeout.flush();
      webSocketObject.onclose();
      $timeout.verifyNoPendingTasks();
      expect(webSocket.connect.calls.length).toEqual(3);
    });

    it('should start queuing up send messages again, then send those messages once connection has been re-established', function() {
      
    });

  });

});
