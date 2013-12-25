/*!
 * WebStorage JavaScript Library v1.0.0
 * https://github.com/anton-kononenko/web-data-storage
 *
 * Author: Anton Kononenko <kononenko.a.m@gmail.com>
 *
 * Released under the MIT license
 * https://github.com/anton-kononenko/web-data-storage/blob/master/LICENSE 
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.WebStorage = factory();
    }
}(this, function () {
    'use strict';
    
    var global = window,
        webStorage = {},
        signatures = {},
        transport,
        storageOrigin;
    
    webStorage.init = function init (storageLocation, callback) {
        var originParseResult = (/^(\w{3,6}:\/\/[^\/]+)\/?/).exec(storageLocation),
            initHandler = function (event) {
                if (event.origin === storageOrigin && typeof event.data === 'object' && event.data.init === true) {
                    transport = event.source;
                    global.removeEventListener('message', initHandler, false);
                    assignCallback();
                    callback();
                }
            },
            iframe;
    
        if (originParseResult !== null) {
            iframe = global.document.createElement('iframe');
            
            storageOrigin = originParseResult[1];

            iframe.setAttribute('name', global.location.origin);
            iframe.setAttribute('style', 'width:1px;height:1px;display:none;');
            iframe.setAttribute('src', storageLocation);

            global.addEventListener('message', initHandler, false);
            global.document.body.appendChild(iframe);
        }
    };
    
    webStorage.length = function length (callback) {
        send('length', null, callback);
    };
    
    webStorage.key = function key (pos, callback) {
        send('key', [pos], callback);
    };
    
    webStorage.getItem = function getItem (key, callback) {
        send('getItem', [key], callback);
    };
    
    webStorage.setItem = function setItem (key, value, callback) {
        send('setItem', [key, value], callback);
    };
    
    webStorage.removeItem = function removeItem (key, callback) {
        send('removeItem', [key], callback);
    };
    
    webStorage.clear = function clear (callback) {
        send('clear', [], callback);
    };
    
    function assignCallback () {
        global.addEventListener('message', function (event) {
            if (event.origin === storageOrigin) {
                var callback = signatures[event.data.callSignature];
                
                if (callback) {
                    delete signatures[event.data.callSignature];
                    callback(event.data.error, event.data.result);
                }
            }
        }, false);
    }
    
    function send (prop, args, callback) {
        var callSignature = Date.now() + prop + args.join();
        
        signatures[callSignature] = callback;
        
        transport.postMessage({
            prop: prop,
            args: args,
            callSignature: callSignature
        }, storageOrigin);
    }
    
    return webStorage;
}));