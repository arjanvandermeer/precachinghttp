"use strict";

var assert = require("assert");
var LinkedEventList = require ("../LinkedEventList.js");

describe('LinkedEventList', function(){
  var eventList;
  describe('tests on empty LinkedList()', function(){
	  before ( function () {
		  eventList = new LinkedEventList.LinkedEventList();
	  });
	  beforeEach('clear EventList', function() {
		  eventList.clear();
	    });	 
    it('should unititalized be a size of 0', function(){
    	var eventListUninit = new LinkedEventList.LinkedEventList();
    	assert.equal(0, eventListUninit.size());
    	assert.equal(undefined,eventListUninit.first);
    	assert.equal(undefined,eventListUninit.last);
    });
    it('should have isEmpty working', function(){
    	assert.equal(0, eventList.size());
    	assert.equal(true, eventList.isEmpty());
    	
    	eventList.add(2,"first");
    	assert.equal(false, eventList.isEmpty());
    });
    it('should have a size of 5 in ascending order after adding 5 items in adjacent order', function(){
    	eventList.clear();
    	eventList.addEvent(10, "fifth");
    	eventList.addEvent(8, "fourth");
    	eventList.addEvent(6, "third");
    	eventList.addEvent(4, "second");
    	eventList.addEvent(2, "first");
    	assert.equal(5, eventList.size());
    	assert.equal(eventList.first.value,2);
    	assert.equal(eventList.last.value,10);
    });
    it('should have a size of 5 in ascending order after adding 5 items in random order', function(){
    	eventList.clear();
    	eventList.addEvent(6, "third");
    	eventList.addEvent(4, "second");
    	eventList.addEvent(10, "fifth");
    	eventList.addEvent(2, "first");
    	eventList.addEvent(8, "fourth");
    	assert.equal(5, eventList.size());
    	assert.equal(eventList.first.value,2);
    	assert.equal(eventList.last.value,10);
    });
  })
  describe('tests on LinkedList() filled with 2/4/6/8/10', function(){
	  before ( function () {
		  eventList = new LinkedEventList.LinkedEventList();
	  });
	  beforeEach('Initialize LinkedList with predefined pattern', function() {
		  eventList.clear();
			eventList.addEvent(2, "first");
			eventList.addEvent(4, "second");
			eventList.addEvent(6, "third");
			eventList.addEvent(8, "fourth");
			eventList.addEvent(10, "fifth");
	    });	 
    it('should have a size of 5 in ascending order after adding 5 items in ascending order', function(){
    	assert.equal(5, eventList.size());
    	assert.equal(eventList.first.value,2);
    	assert.equal(eventList.last.value,10);
    });
    it('should have a working clear function', function(){
    	eventList.clear();
    	assert.equal(0,eventList.size());
    	assert.equal(undefined,eventList.first);
    	assert.equal(undefined,eventList.last);
    });
    it('should have a size of 5 after adding 7 items, two with duplicate description and duplicateDescriptions set to false', function(){
    	eventList.duplicateDescriptions=false;
    	eventList.addEvent(3, "second");
    	eventList.addEvent(9, "fourth");
    	assert.equal(5, eventList.size());
    });
    it('should have a size of 7 after adding 7 items, two with duplicate description and duplicateDescriptions set to true', function(){
    	eventList.duplicateDescriptions=true;
    	eventList.addEvent(3, "second");
    	eventList.addEvent(9, "fourth");
    	assert.equal(7, eventList.size());
    });
    it('findFirstValue for third correctly returns the third item', function(){
    	var event = eventList.findFirstValue(6);
    	assert.equal(6, event.value);
    });
    it('findFirstValue for first correctly returns the first item', function(){
    	var event = eventList.findFirstValue(2);
    	assert.equal(2, event.value);
    });
    it('findFirstValue for lower than first value correctly returns the first item', function(){
    	var event = eventList.findFirstValue(0);
    	assert.equal(2, event.value);
    });
    it('findValue for third item correctly returns the third item', function(){
    	var event = eventList.findValue(6);
    	assert.equal(6, event.value);
    });
    it('findValue for non-existing item correctly returns no item', function(){
    	var event;
    	event = eventList.findValue(-2);
    	assert.equal(undefined, event);
    	event = eventList.findValue(12);
    	assert.equal(undefined, event);
    	event = eventList.findValue(5);
    	assert.equal(undefined, event);
    });

    it('findFirstValue for higher than last value correctly returns undefined', function(){
    	var event = eventList.findFirstValue(12);
    	assert.equal(undefined, event);
    });
    it('findDescription for third description correctly finds third item', function(){
    	var event = eventList.findDescription("third");
    	assert.equal(event.value, 6);
    });
    it('findDescription for no found description correctly finds no item', function(){
    	var event = eventList.findDescription("sixth");
    	assert.equal(undefined, event);
    });
    it('toArray returns an array with the same length', function(){
    	var events = [];
    	events = eventList.toArray();
    	assert.equal(5, events.length);
    });
    it('toArray with parameter returns an array with the appropriate length', function(){
    	var events = [];
    	// 2,4,6,8,10
    	var event = eventList.findFirstValue(5);
    	events = eventList.toArray(event);
    	assert.equal(3, events.length);
    	// 0
    });
    it('toArray with first elements returns an array with the full list', function(){
    	var events = [];
    	events = eventList.toArray(eventList.first);
    	assert.equal(5, events.length);
    	// 10
    });
    it('toArray with last elements returns an array with 1 length', function(){
    	var events = [];
    	events = eventList.toArray(eventList.last);
    	assert.equal(1, events.length);
    });
  });
});
