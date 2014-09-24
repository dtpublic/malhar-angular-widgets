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

describe('Service: websocket', function () {

  var webSocket, webSocketObject, notificationService, $rootScope;

  beforeEach(module('ui.websocket', function(webSocketProvider) {
    webSocketObject = {
      send: jasmine.createSpy()
    };

    webSocketProvider.setWebSocketObject(webSocketObject);
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

  it('should unsubscribe', function () {
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

  it('should notify on WebSocket onclose', function () {
    expect(webSocketObject.onclose).toBeDefined();
    spyOn(notificationService, 'notify');
    webSocketObject.onclose();
    expect(notificationService.notify).toHaveBeenCalled();
  });

  it('should notify on WebSocket onerror', function () {
    expect(webSocketObject.onerror).toBeDefined();
    spyOn(notificationService, 'notify');
    webSocketObject.onerror();
    expect(notificationService.notify).toHaveBeenCalled();
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
