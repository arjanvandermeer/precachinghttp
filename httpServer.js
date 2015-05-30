"use strict";

var fs = require("fs");
var async = require("async");
var config = require("config");
var http = require("http");

var LinkedEventList = require('./libs/LinkedEventList.js');
var cache = require('./libs/CacheStore.js');
var cache = new cache.CacheStore();
var eventList = new LinkedEventList.LinkedEventList();

var server = require('./libs/cachingHttpServer.js');
var httpServer = new server.cachingHttpServer(config, cache);

fs.readFileSync('./config/mimetypes.json', 'utf-8', function(err, data) {
	if (err)
		throw err;
	var contentTypesByExtension = JSON.parse(data);
	httpServer.setMimetypes(contentTypesByExtension);
});

fs.readFile('./config/precache.json', 'utf-8', function(err, data) {
	if (err)
		throw err;
	async.each(JSON.parse(data), function(file, callback) {
		httpServer.loadFile(file.file);
	});
});

var app = http.createServer(httpServer.handler.bind(httpServer));
app.listen(httpServer.getPort());
console.log("Static file server running at  => " + httpServer.getUrl() );	
//var socket = io.listen(app);
