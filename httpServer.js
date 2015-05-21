"use strict";
var http = require("http"), 
	url = require("url"), 
	path = require("path"), 
	fs = require("fs"), 
	async = require("async"),
	watcher = require("watchr");  // TODO
var crypto = require('crypto');

var io = require('socket.io')(http);

var LinkedEventList = require('./libs/LinkedEventList.js'); 
var cache = require('./libs/CacheStore.js'); 

//defaults
var config = JSON.parse(fs.readFileSync('./conf/config.json', 'utf-8'));

var protocol = 'http';
var useCache = config.useCache || true;
var hostname = config.hostname || 'localhost';
var port = parseInt(config.port || process.argv[2] || 3000,10);
var defaultPage = config.defaultPage || 'index.html';
var rootDir = (config.webRoot?path.resolve(''+config.webRoot) : path.resolve('public/')+path.sep);
var serverUrl = protocol + '://' + hostname;

if ( (protocol === 'http' && port != 80) || (protocol === 'https' && port != 443) )
	serverUrl = serverUrl + ':' + port

var contentTypesByExtension;
fs.readFile('./conf/mimetypes.json','utf-8', function(err, data){ contentTypesByExtension=JSON.parse(data);});

var cache = new cache.CacheStore();
var eventList = new LinkedEventList.LinkedEventList();

cache.setWatch(function(filename)
{
	if ( ! filename.startsWith(rootDir))
	{
		console.error('Unactionable callback as '+filename+' out of path for '+rootDir);
		return;
	}
	fs.stat ( filename, function (err, stats ) {
		var uri = filename.substring(rootDir.length,filename.length);
		if ( !serverUrl.endsWith('/') && !uri.startsWith('/'))
			uri = '/'+uri;

		var update = new Object();
		update.uri = uri;
		update.time = stats.mtime.getTime();
		var event = eventList.addEvent(stats.mtime.getTime(), uri);
		console.log("broadcast : "+event);
		io.sockets.emit('update',update);
	});
});
fs.readFile('./conf/precache.json', 'utf-8', function(err, data)
{
	if ( err ) throw err;
	async.each ( JSON.parse(data), function ( file, callback )
	{
		console.log(rootDir+file.file);
		cache.loadFile(rootDir+file.file);
	});
});	
var app=http.createServer(handler);
app.listen(3000);
var socket = io.listen(app); 

/*
io.on('connection', function(socket){
	socket.on('event', function(data){console.log("event !!!")});
	socket.on('disconnect', function(){console.log("DISCONNECT")});
});
*/
console.log("Static file server running at  => " + serverUrl +" for "+rootDir);


function writeString(response, code, headers, body) {
	response.writeHead(code, headers);
	if ( body !== undefined )
		response.write(body,'binary');
	response.end();
}
function writeError(response, code, filename) {
	writeString(response, code, {
		"Content-Type" : "text/plain"
	}, code + '.html');
	return;
}

if (typeof String.prototype.endsWith != 'function') {
	  String.prototype.endsWith = function (str){
	    return this.slice(-str.length) == str;
	  };
	}
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

function handler(request, response) 
{
	var uri;
	var filename;

	try
	{
		uri = url.parse(request.url).pathname;


		if ( uri.indexOf('..')>-1)
			throw "Invalid URL";

		filename = path.join(rootDir, uri);
		if (uri.endsWith('/'))
			filename = filename + defaultPage;
		
		console.log("file "+filename+" in cache : "+cache.has(filename));
		
		var reqModDate = request.headers["if-modified-since"];

		if (useCache && cache.has(filename)) 
		{
			var props = cache.getProps ( filename );
			var headers;
			if ( props !== undefined && props.headers !== undefined)
				headers = props.headers;
			if (reqModDate!=null) {
				if(new Date(reqModDate).getTime()==props.mtime.getTime()) 
				{
					return writeString(response, 304, headers);
				}
			}
			return writeString(response, 200, headers, cache.get(filename));
		}

		var file = fs.readFile(filename, "binary",
		function(err, file) {
			if (err) throw ( err );

			// TODO move this to async
			// TODO this doesn't get executed for precached files
			// TODO change overall structure into parsing -> check cache?fill cache -> response
			// TODO meanwhile filecache should take care of reading the file in above ccode
			// TODO doing the above will allow support of 304 header 
			
			cache.loadFile(filename,file);
			var props = {};
			var headers = {};
			
			async.parallel([
			    function(callback) {props.uri = filename.substring(rootDir.length,filename.length);callback();},
				function(callback) {props.etag = crypto.createHash('md5').update(file).digest('hex');callback();},
				function(callback) {var extension = path.extname(filename);props.mime = contentTypesByExtension[extension] || 'text/plain';callback();},
				function(callback) {props.mtime = fs.statSync(filename).mtime;callback();}
            ], function() { 
				headers['Etag']=props.etag;
				headers['Content-Type']=props.mime;
				headers['Last-Modified']=props.mtime.toUTCString();
				headers['Content-Length']=props.size;
				props.headers = headers;
				cache.setProps ( filename, props);
            });

			return writeString(response, 200, headers, file);
		});
	} catch (err) {
		if ( err.code === 'ENOENT')
			return writeError(response, 404, filename);
		else
		{
			console.log('ERROR: ' + err.message);
			return writeError(response, 500, filename);
		}
	} finally {
		//
	}
	return true;
}


