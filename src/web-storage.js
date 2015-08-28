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
        storageOrigin,
        Promise = global.Promise;
    
    function createPromise(action, callback) {
        var promise;
        if (Promise) {
            promise = new Promise(function (callback) {
                action(callback);
            });
            if (typeof callback === 'function') {
                promise.then(callback);
            }
        } else {
            action(callback);
        }
        return promise;
    }
    
    /**
     * Initialize web storage
     * @storageLocation:String URL to container.html
     * @callback:Function callback which will be called after location initialized
     */
    webStorage.init = function init (storageLocation, callback) {
        return createPromise(function (fulfill) {
            var originParseResult = (/^(\w{3,6}:\/\/[^\/]+)\/?/).exec(storageLocation),
                initHandler = function (event) {
                    if (event.origin === storageOrigin && typeof event.data === 'object' && event.data.init === true) {
                        transport = event.source;
                        global.removeEventListener('message', initHandler, false);
                        assignCallback();
                        fulfill();
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
            } else {
                throw new Error('Invalid URL (' + storageLocation + ') for storage location');
            }
        }, callback);
    };
    
    webStorage.length = function length (callback) {
        return createPromise(function (fulfill) {
            send('length', null, fulfill);
        }, callback);
    };
    
    webStorage.key = function key (pos, callback) {
        return createPromise(function (fulfill) {
            send('key', [pos], fulfill);
        }, callback);
    };
    
    webStorage.getItem = function getItem (key, callback) {
        return createPromise(function (fulfill) {
            send('getItem', [key], fulfill);
        }, callback);
    };
    
    webStorage.setItem = function setItem (key, value, callback) {
        return createPromise(function (fulfill) {
            send('setItem', [key, value], fulfill);
        }, callback);
    };
    
    webStorage.removeItem = function removeItem (key, callback) {
        return createPromise(function (fulfill) {
            send('removeItem', [key], fulfill);
        }, callback);
    };
    
    webStorage.clear = function clear (callback) {
        return createPromise(function (fulfill) {
            send('clear', [], fulfill);
        }, callback);
    };
    
    webStorage.value = function (key, value, callback) {
        if (typeof value === 'function') {
            callback = value;
        }
        return createPromise(function (fulfill) {
            if (typeof value === 'function') {
                webStorage.getItem(key, function (value) {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        // as it's not supposed to has JSON, no action should be done
                    }
                    fulfill(value);
                });
            } else {
                try {
                    value = JSON.stringify(value);
                } catch (e) {
                    if (global.console && global.console.warn) {
                        global.console.warn('Cannot transform object to JSON');
                        value = 'null';
                    }
                }
                webStorage.setItem(key, value, fulfill);
            }
        }, callback);
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
