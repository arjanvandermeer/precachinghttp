importScripts('cache-polyfill.js');
//importScripts('async.js');

// The files we want to cache
var urlsToCache = [
  //'/iframe.html'
    'http://localhost:3000//baby.jpg',
    'http://localhost:3000/iframe3.html'
];
var urlsNotToCache = [
	'http://localhost:3000/iframe.html',
	'http://localhost:3000/sw3.js'
];

//example usage:
self.addEventListener('install', function(event) {
event.waitUntil(
 caches.open('demo-cache').then(function(cache) {
	//	async.each ( JSON.parse(data), function ( file, callback )
		//		{
			//		cache.loadFile(file.file);
				//});
	 return cache.addAll(urlsToCache);
//   return cache.put('/', new Response("From the cache!"));
 })
);
});


self.addEventListener('activate', function(event) {
	console.log('in activate');
/*
	  event.waitUntil(
	    caches.keys().then(function(cacheNames) {
	      return Promise.all(
	        cacheNames.map(function(cacheName) {
	          if (urlsToCache.indexOf(cacheName) !== -1) {
	        	  console.log('removing '+cacheName+' from cache upon activation ');
	            return caches.delete(cacheName);
	          }
	        })
	      );
	    })
	  );
*/
	});

self.addEventListener('onmessage',function(message) 
		{
			console.log("ON MESSAGE "+message);
		});
self.addEventListener('fetch', function(event) {
	 event.respondWith(
			    caches.match(event.request)
			      .then(function(response) {
			    	  
//			    	 var file = url.parse(request.url).pathname;
			        var doNotCache = urlsNotToCache.indexOf ( event.request.url ) !== -1;
//			    	 console.log("xFILE : "+event.request.url+' do not cache : '+doNotCache);
			    	 	
//			    	 var parser = document.createElement('a');
	//		    	 parser.href = event.request.url;
		//	    	 var path = parser.pathname;
			//    	 console.log("FILE : "+parser);
			    	 
				        
				        // Cache hit - return response
			        if (response && !doNotCache) {
			        	console.log("cached hit for "+event.request.url);
			          return response;
			        }

			        // IMPORTANT: Clone the request. A request is a stream and
			        // can only be consumed once. Since we are consuming this
			        // once by cache and once by the browser for fetch, we need
			        // to clone the response

			        var fetchRequest = event.request.clone();


			        return fetch(fetchRequest).then(
			          function(response) {
			            // Check if we received a valid response
			            if(doNotCache || !response || response.status !== 200 || response.type !== 'basic') {
				        	console.log("uncachable response for "+event.request.url);
			              return response;
			            }
			        	console.log("non-cache hit for "+event.request.url);

//			        	if ( urlsNotToCache.contains ( event.request.url ))
			            // IMPORTANT: Clone the response. A response is a stream
			            // and because we want the browser to consume the response
			            // as well as the cache consuming the response, we need
			            // to clone it so we have 2 stream.
			            var responseToCache = response.clone();

			            caches.open('demo-cache')
			              .then(function(cache) {
			                cache.put(event.request, responseToCache);
			              });

			            return response;
			          }
			        );
			      })
			    );
			});
