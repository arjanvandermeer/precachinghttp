"use strict";

var http = require("http"), 
url = require("url"), 
path = require("path"), 
fs = require("fs"), 
async = require("async");
var crypto = require('crypto');


exports.CacheStore = function()
{
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
	this.addWatch = function ( filename )
	{
		fs.watchFile( filename, function ( event, target) {
			try
			{
			   	this.loadFile(filename);
			} catch (err ) 
			{
				console.log(err.message);
				this.remove ( filename );
			}});
	};
	this.loadFile = function(filename, data){
		if (! this.has ( filename ))
			this.addWatch(filename);

		if ( data === undefined)
		{
			var file = fs.readFileSync(filename, "binary");
			this.set(filename, file);
			if (watchCallback!== undefined && typeof(watchCallback) === "function") 
			{
				watchCallback( filename );
			}
		} else {
			this.set(filename, data);
		}
	};
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
};
