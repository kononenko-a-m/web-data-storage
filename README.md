web-data-storage
================

This is small library which provide possibility to use localStorage across several domains.
It's split for two sections:
- Container page (src/container.html), which will store actual data
- JS API (src/web-storage.js), provide object WebStorage, which brings power of local storage, all data manipulation, implemented via callbacks, as it rely on event.

Overview
================

Library suppose that was placed somewhere container.html, and specified in it, what origins is allowed.
web-storage.js should be included in allowed origins in order to store data.
Communication between page with script and container page is implemented via window.postMessage, and on container.html data will be stored in actual data storage.

API
================

webStorage.init (storageLocation, callback) - init connection to container page
storageLocation : String - URL to container.html
callback : Function - callback which will be called after connection established between current page, and container

webStorage.length ([callback]) - check localStorage documentation
    
webStorage.key (pos[, callback]) - check localStorage documentation
    
webStorage.getItem (key[, callback]) - check localStorage documentation
    
webStorage.setItem (key, value[, callback]) - check localStorage documentation

webStorage.setItem (key, value[, callback]) - check localStorage documentation
    
webStorage.removeItem (key[, callback]) - check localStorage documentation
    
webStorage.clear ([callback]) - check localStorage documentation

webStorage.value(key[, value[, callback]]) - simplified access to local storage, will make transformation to/from JSON on write/read

callback : Function - into function will be passed two arguments
- e : Error - error which happens during execution of current call
- result - value which was returned by call

Every method would return Promise, if it's available in current system

Usage
================

WebStorage.init('http://localhost/src/container.html', function () {
	WebStorage.setItem('key', 'test', function () {
		WebStorage.getItem('key', function (e, result) {
		   console.log(result); 
		});
	});
});
