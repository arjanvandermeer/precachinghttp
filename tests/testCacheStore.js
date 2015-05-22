"use strict";

var assert = require("assert");
var sinon = require("sinon");
var fs = require("fs");
require("blanket");
var CacheStore = require ("../libs/CacheStore.js");

describe('Cache Store', function(){
  var cache = new CacheStore.CacheStore();
  describe('tests on empty CacheStore()', function(){
	  before ( function () {
		  cache = new CacheStore.CacheStore ();
	  });
	  beforeEach('clear CacheStore', function() {
		  cache.clear();
	    });	 
    it('should unititalized be a size of 0', function(){
    	
    	var cacheUninit= new CacheStore.CacheStore();
    	assert.equal(0, cache.size());
    	assert.equal(undefined, cache.getProps("abc"));
    	assert.equal(undefined, cache.getWatch());
    });
    it('should have isEmpty working', function(){
    	assert.equal(0, cache.size());
    	assert.equal(true, cache.isEmpty());
    });
  });
  describe('tests on mocked filesystem CacheStore()', function(){
	  var readFileSyncStub;
	  var watchFileStub;
	  
	  var stubContent_indexhtml = "<html><head></head><body>In index.html</body></html>";
	  var stubContent_indexjs = "alert('In index.js');";
	  
	  before ( function () {
		  readFileSyncStub = sinon.stub(fs, "readFileSync");
		  watchFileStub = sinon.stub(fs, "watchFile");
		  
		  readFileSyncStub.throws("File not found");
		  readFileSyncStub.withArgs("index.html").returns(stubContent_indexhtml);
		  readFileSyncStub.withArgs("index.js").returns(stubContent_indexjs);

		  cache = new CacheStore.CacheStore ();
	  });
	  after ( function () {
		  readFileSyncStub.restore();
		  watchFileStub.restore();
	  });
	  beforeEach('clear EventList', function() {
		  cache.clear();
		  cache.loadFile("index.html");
		  cache.loadFile("index.js");
	  });	 
	it('should have a working loadFile function', function()
    {
    	var indexjs = cache.get("index.js");
    	var indexhtml = cache.get("index.html");
    	assert.equal(stubContent_indexhtml, indexhtml);
    	assert.equal(stubContent_indexjs, indexjs);
    });
    it('should be able to set and read props', function()
    {
		cache.setProps ("index.html", {prop1:'prop1-value', prop2:'prop2-value'});
    	assert.equal('prop1-value', cache.getProps("index.html").prop1);
    	assert.equal('prop2-value', cache.getProps("index.html").prop2);
    });
    it('should be able to remove entry and props', function()
    	    {
				cache.setProps ("index.html", {prop1:'prop1-value', prop2:'prop2-value'});
				cache.remove("index.html");
    	    	assert.equal(undefined, cache.get("index.html"));
    	    	assert.equal(undefined, cache.getProps("index.html"));
    	    });
    it('should be able to set and get a watcher', function()
    {
  	  var watchFileMethod = sinon.stub();
    	cache.setWatch(watchFileMethod);
    	assert.equal ( watchFileMethod, cache.getWatch());
    });
    it('watcher should get called at least once when reloading file', function()
	    {
			var myCallback = { method: function () {return true;}};
			var callbackSpy = sinon.spy(myCallback, "method");
	    	cache.setWatch(myCallback.method);
		  cache.loadFile("index.html");

	    	assert(callbackSpy.called);
	    });
    it('watcher should get called at least once on fs trigger', function()
	    {
    		// create stub for the filesystem watcher, which will immediately callback 
    		watchFileStub.withArgs("index.html").callsArgAsync(2);

    		// create callbackk and spy for the callback
			var myCallback = { method: function () {console.log("in callback");return true;}};
			var callbackSpy = sinon.spy(myCallback, "method");
	    	cache.setWatch(myCallback.method);

//	    	cache.loadFile("index.html");
	    	
	    	assert(callbackSpy.calledOnce);
	    });
  });
});
