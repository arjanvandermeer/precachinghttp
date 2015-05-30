"use strict";

var async = require("async");
var path = require("path");
var fs = require("fs");
var crypto = require('crypto');
var http = require('http');
var io = require('socket.io')(http);
var url = require("url");

if (typeof String.prototype.endsWith != 'function') {
	String.prototype.endsWith = function(str) {
		return this.slice(-str.length) == str;
	};
}
if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(str) {
		return this.slice(0, str.length) == str;
	};
}

exports.cachingHttpServer = function(config, cache) 
{
	this.protocol = 'http';
	
	this.hostname = config.has("HttpServer.network.hostname")?config.get("HttpServer.network.hostname"):"localhost";
	this.port= config.has("HttpServer.network.port")?parseInt(config.get("HttpServer.network.port"),10):3000;
	this.useCache = cache!== undefined && config.has("HttpServer.pages.useCache")?config.get("HttpServer.pages.useCache"):false;
	this.defaultPage = config.has("HttpServer.pages.defaultPage")?config.get("HttpServer.pages.defaultPage"):"index.html";
	this.webRoot= config.has("HttpServer.pages.webRoot")?config.get("HttpServer.pages.webRoot"):"public";
	this.rootDir =  path.resolve('' + this.webRoot)+ path.sep;

	this.serverUrl = this.protocol + '://' + this.hostname;
	if ((this.protocol === 'http' && this.port != 80)
			|| (this.protocol === 'https' && this.port != 443))
		this.serverUrl = this.serverUrl + ':' + this.port;

	if ( this.useCache )
		cache.setWatch(this.CacheCallbackHandler );
	
	this.mimetypes=[];

	this.writeString= function (response, code, headers, body) {
		response.writeHead(code, headers);

		if (body !== undefined)
			response.write(body, 'binary');
		response.end();
	}
	/*
	this.translateUriToFile = function ( request )
	{
		console.log(">"+request.url);
		uri = url.parse(request.url).pathname;

		if (uri.indexOf('..') > -1)
			throw "Invalid URL";

		
		var filename = path.join(this.rootDir, uri);
		if (uri.endsWith('/'))
			filename = filename + defaultPage;
		
		return filename;
	}*/

	this.handler = function(request, response) 
	{
		try
		{
//			console.log("request uri "+request.url);

			var uri = url.parse(request.url).pathname;
			if (uri.indexOf('..') > -1)
				throw "Invalid URL";
			
//			if ( uri === '/shutdown' )
//				process.exit(0);

			var filename = path.join(''+this.rootDir, ''+uri);
			if (uri.endsWith('/'))
				filename = filename + defaultPage;
			
//			console.log ("hit for "+filename+" in cache "+this.inCache(filename));
			
			if (! this.inCache ( filename ))
			{
				this.loadFile(filename);
			} 
			
			var reqModDate = request.headers["if-modified-since"];
			var reqETag = request.headers["etag"];
	
			var headers = cache.getProps(filename).headers;
			
			if (reqModDate !== undefined && new Date(reqModDate).getTime() === cache.getProps(filename).mtime.getTime())
					return this.writeString(response, 304, headers);
			if (reqETag !== undefined && reqETag === headers.etag)
					return this.writeString(response, 304, headers);
			
			return this.writeString(response, 200, headers, this.getFile(filename));
		} catch (err) {
			if (err.code === 'ENOENT')
				return this.writeString(response, 404, { "Content-Type" : "text/plain"	}, 'file not found');
			else {
				console.error ( err );
				return this.writeString(response, 500, { "Content-Type" : "text/plain"	}, 'fatal error '+err);
			}
		} finally {
			//
		}
	}
	this.start= function ()
	{
		try
		{
			var app = http.createServer(this.handler);
			app.listen(this.port);
			var socket = io.listen(app);
			console.log("Static file server running at  => " + this.serverUrl + " for "+ this.rootDir);	
		} catch ( err )
		{
			console.log(err);
		}
	}
	this.loadFile= function ( filename )
	{
		if (! path.isAbsolute(filename ))
			filename = this.rootDir + filename;

		console.log("loading "+filename);

		var file = cache.loadFile ( filename );
		var props = {};
		var headers = {};

		// TODO - overkill. Do this in one promise in series

		var dir = this.rootDir;
		props.uri = filename.substring(dir.length, filename.length);
		props.etag = crypto.createHash('md5').update(file).digest('hex');
		var extension = path.extname(filename);
		props.mime = this.getMimetype(extension);
		props.mtime = fs.statSync(filename).mtime;
// TODO verify this against fs length
		props.size = file.length;

		headers['Etag'] = props.etag;
		headers['Content-Type'] = props.mime;
		headers['Last-Modified'] = props.mtime.toUTCString();
		headers['Content-Length'] = props.size;
		props.headers = headers;
		cache.setProps(filename, props);
	}
	this.getFile = function ( filename )
	{
		if ( ! cache.has ( filename ))
			this.loadFile ( filename);

		return cache.get ( filename  );
	}
	this.getProps = function ( filename )
	{
		if ( ! cache.has ( filename ))
			this.loadFile ( filename);
		return cache.getProps ( filename );
	}
	this.inCache = function( filename )
	{
		return this.useCache && cache.has(filename);
	}
	this.setMimetypes = function(data)
	{
		this.mimetypes = data;
	}
	this.getMimetype = function ( extension )
	{
		if ( this.mimetypes[extension] !== undefined)
			return this.mimetypes[extension];
		else
			return "application/octet-stream";
	}
	this.getPort = function() 
	{
		return this.port;
	}
	this.getUseCache = function ()
	{
		return this.useCache;
	}
	this.getDefaultPage = function ()
	{
		return this.defaultPage;
	}
	this.getRoot = function ()
	{
		return this.rootDir;
	}
	this.getUrl = function ()
	{
		return this.serverUrl;
	}
	this.CacheCallbackHandler = function(filename) {
		if (!filename.startsWith(this.rootDir)) {
			console.error('Unactionable callback as ' + filename
					+ ' out of path for ' + this.rootDir);
			return;
		}
		fs.stat(filename, function(err, stats) {
			var uri = filename.substring(this.rootDir.length, filename.length);
			if (!uri.startsWith('/'))
				uri = '/' + uri;

			var update = new Object();
			update.uri = uri;
			update.time = stats.mtime.getTime();
			var event = eventList.addEvent(stats.mtime.getTime(), uri);
			console.log("broadcast : " + event);
			io.sockets.emit('update', update);
		});
	}
}
