"use strict";

var assert = require("assert");
var sinon = require("sinon");
var fs = require("fs");
var blanket = require("blanket");

var config = require("config");

var http = require("../libs/CachingHttpServer.js");
var CacheStore = require("../libs/CacheStore.js");

describe('Caching HTTP Server', function() {
	var cache;
	var configStubGet;
	var configStubHas;
	var readFileSyncStub;
	var statFileSyncStub;
	var watchFileStub;

	var stubContent_indexhtml = "<html><head></head><body>In index.html</body></html>";
	var stubContent_indexjs = "alert('In index.js');";

	var stubContent_mtime = new Date();
	var stubContent_mimetypes = {
			".html" : "text/html",
			".css" : "text/css",
		};

	describe('init process', function() {
		before(function() {
			cache = new CacheStore.CacheStore();
			configStubHas = sinon.stub(config, "has");
			configStubGet = sinon.stub(config, "get");
		});
		beforeEach('clear cache', function() {
			cache.clear();
		});
		after(function() {
			configStubGet.restore();
			configStubHas.restore();
		});
		it('should properly initialize with defaults and no cache', function() {
			configStubHas.returns(false);
			var server = new http.cachingHttpServer(config);
			assert.equal(server.getPort(), 3000 );
			assert.equal(server.getUseCache(), false);
			assert.equal(server.getDefaultPage(), "index.html");

		});
		it('should properly initialize with stubbed config values and no cache', function() {
			configStubHas.returns(false);
			configStubHas.withArgs('HttpServer.network.port').returns(true);
			configStubGet.withArgs('HttpServer.network.port').returns('3001');
			configStubHas.withArgs('HttpServer.pages.useCache').returns(true);
			configStubGet.withArgs('HttpServer.pages.useCache').returns(false);
			configStubHas.withArgs('HttpServer.pages.defaultPage').returns(true);
			configStubGet.withArgs('HttpServer.pages.defaultPage').returns('default.html');
			
			var server = new http.cachingHttpServer(config);
			assert.equal(server.getPort(), 3001);
			assert.equal(server.getUseCache(), false);
			assert.equal(server.getDefaultPage(), "default.html");
		});
		it('should properly initialize with stubbed config values and cache', function() {
			configStubHas.returns(false);
			configStubHas.withArgs('HttpServer.pages.useCache').returns(true);
			configStubGet.withArgs('HttpServer.pages.useCache').returns(true);
			
			var server = new http.cachingHttpServer(config, cache);
			assert.equal(server.getUseCache(), true);
		});
		it('should load and return correct mimetypes', function() {
			var server = new http.cachingHttpServer(config, cache);
			server.setMimetypes ( stubContent_mimetypes );
			assert.equal("text/css", server.getMimetype(".css"));
			assert.equal("text/html", server.getMimetype(".html"));
			assert.equal("application/octet-stream", server.getMimetype(".unknown"));
		});
	});
	describe('running process', function() {
		before(function() {
			cache = new CacheStore.CacheStore();
			// use default values for all code except for cache
			configStubHas = sinon.stub(config, "has");
			configStubGet = sinon.stub(config, "get");
			configStubHas.returns(false);
			configStubHas.withArgs('HttpServer.pages.useCache').returns(true);
			configStubGet.withArgs('HttpServer.pages.useCache').returns(true);

			// set mock filesystem with two files
			statFileSyncStub = sinon.stub(fs, "statSync");
			readFileSyncStub = sinon.stub(fs, "readFileSync");
			watchFileStub = sinon.stub(fs, "watchFile");
			readFileSyncStub.throws("File not found");
			readFileSyncStub.withArgs("index.html").returns(stubContent_indexhtml);
			readFileSyncStub.withArgs("index.js").returns(stubContent_indexjs);
			statFileSyncStub.withArgs("index.html").returns({ mtime : stubContent_mtime});
		});
		beforeEach('clear cache', function() {
			cache.clear();
		});
		after(function() {
			configStubGet.restore();
			configStubHas.restore();
			readFileSyncStub.restore();
			statFileSyncStub.restore();
			watchFileStub.restore();
		});
		it('should load and preache a proper index.html and not default.aspx', function() {
			var server = new http.cachingHttpServer(config, cache);
			assert.equal(server.getUseCache(), true);

			server.loadFile("index.html");
			assert.equal(true, server.inCache("index.html"));
			assert.equal(false, server.inCache("default.aspx"));
		});
		it('should load and preache a proper index.html and properties (incl mime type) should match', function() {
			var server = new http.cachingHttpServer(config, cache);
			var data = server.getFile ("index.html");
			var props = server.getProps ("index.html");
			
			console.log("X"+props.headers['Etag']);
			assert.equal (stubContent_indexhtml, data);
			assert.equal (props.headers['Etag'], 'fc56dab891c04987bdcfb190e5a18184');
		});
	});
});
