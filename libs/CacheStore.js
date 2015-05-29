"use strict";

var http = require("http"), 
url = require("url"), 
path = require("path"), 
fs = require("fs"), 
async = require("async");
var crypto = require('crypto');


exports.CacheStore = function()
{
	// TODO : Rewrite to private properties, rather than public variables
	
	var myStore = [];
	var myProps = [];
	var watchCallback;
	
	this.setProps = function ( filename, props )
	{
		myProps[filename]=props;
	}
	this.getProps = function ( filename )
	{
		return myProps[filename];
	}
	this.loadFile = function(filename, data){
		// set a callback if not in cache yet
		if (! this.has ( filename ))
			this.addWatch(filename);

		if ( data === undefined)
		{
			data = fs.readFileSync(filename, "binary");
		}

		this.set(filename, data);

		// if a callback function was defined, call it now
		// TODO should be async
		
		if (watchCallback!== undefined && typeof(watchCallback) === "function") 
		{
			watchCallback( filename );
		}

		return data;
	};
	this.addWatch = function ( filename )
	{
		fs.watchFile( filename, function ( event, target) {
			try
			{
				console.log("reload filename "+filename);
			   	this.loadFile(filename);
			} catch (err ) 
			{
				console.log(err.message);
				this.remove ( filename );
			}}.bind(this));
	};
	this.getWatch = function ()
	{
		return watchCallback;
	}
	this.setWatch = function ( callback )
	{
		if (callback!= undefined && typeof(callback) === "function") 
		{
			watchCallback = callback;
		}
	};
	this.has = function(key) {
		return (typeof myStore[key] !== "undefined");
	}
	this.get = function(key) {
		return myStore[key];
	}
	this.set = function(key, val) {
		myStore[key] = val;
	}
	this.remove = function(key) {
		delete myStore[key];
		delete myProps[key];
	}
	this.clear = function ()
	{
		myStore=[];
		myProps=[];
		watchCallback = undefined;
	}
	this.size = function () 
	{
		return myStore.length;
	}
	this.isEmpty = function ()
	{
		return myStore.length==0;
	}
};
