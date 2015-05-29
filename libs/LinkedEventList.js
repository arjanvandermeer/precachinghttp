"use strict";

exports.Event = function(avalue, adescription)
{
	var previous=false;
	var next=false;
	this.value = avalue;
	this.description = adescription;
	
	this.insertAfter = function ( event )
	{
		event.previous = this;
		event.next = this.next;
		this.next = event;
		return this;
	};
	this.insertBefore = function ( event )
	{
		event.next = this;
		event.previous = this.previous;
		this.previous = event;
		return this;
	};
	this.toString = function ( event )
	{
		return '['+this.value+'] : '+this.description+
			" <<"+(this.previous!==undefined?this.previous.value:'-')+
			" >>"+(this.next!==undefined?this.next.value:'-'); 
	};
}
exports.LinkedEventList = function()
{
	var last;
	var first;
	var counter = 0;
	var duplicateDescriptions = false;

	this.addEvent = function ( time, description )
	{
		var event = new exports.Event (time, description )
		this.add ( event );
		return event;
	}
	this.add = function ( event )
	{
//		if ( typeof ( event ) !== "Event" )
	//	{
		//	throw ("add only accepts object type of Event")
	//	}

		// this allows for race conditions
		if ( counter === undefined )
			counter=0;
		
		var deleteEvent;
		if ( !this.duplicateDescriptions )
		{
			deleteEvent = this.findDescription ( event.description );
		}

		if ( this.isEmpty() )
		{
			first = event;
			last = event;
			counter = 1;
		} else if ( event.value < first.value ) {
			first = first.insertBefore(event).previous;
			counter++;
		} else if ( event.value > last.value ) {
			last = last.insertAfter(event).next;
			counter++;
		} else {
			this.findFirstValue(event.value).insertBefore(event);
			counter++;
		}
		
		if ( deleteEvent !== undefined )
			this.remove ( deleteEvent );

		return counter;
	};
	this.isEmpty = function ( )
	{
		return first === undefined && last === undefined ;
	};
	this.findValue = function ( value )
	{
		if ( this.isEmpty () || value < first.value || value > last.value )
			return undefined;

		var event=first;

		while(event !== undefined && event.value !== value)
		{
			event = event.next;
		}
		return event;
	};
	this.remove = function ( element )
	{
			var myprevious = element.previous;
			var mynext = element.next;
			if ( myprevious !== undefined )
				element.previous.next = mynext;
			else
				first = mynext;
			
			if ( mynext !== undefined )
				element.next.previous = myprevious;
			else
				last = myprevious;
			
			counter--;
	};

	this.findFirstValue = function ( value )
	{
		if ( this.isEmpty ())
			return undefined;
		if ( value < first.value )
			return first;
		if ( value > last.value )
			return undefined;

		var event=first;

		while(event !== undefined && event.value < value)
		{
			event = event.next;
		}

		return event;
	};
/*
	this.findBeforeValue = function ( value )
	{
		var event=this.first;

		while(event !== undefined && event.value < value)
		{
			event = event.next;
		}
		if ( event === undefined )
			return this.last;
		// you found the first event
		if ( event.previous === undefined )
			return this.first;
		return event.previous;
	};
*/
	this.findDescription = function ( description )
	{
		var event=first;
		var x=0;
		while(event !== undefined && event.description !== description)
		{
			event = event.next;
		}
		return event;
	};
	this.get = function ( item )
	{
		if ( item < 0 || item > counter)
			return undefined;
	
		var event=first;
		var x=0;
		while(event !== undefined && x++<item)
		{
			event = event.next;
		}
		return event;
	};
	this.clear = function ()
	{
		counter=0;
		first = undefined;
		last = undefined;
	}
	this.head = function()
	{
		return first;
	}
	
	this.tail = function()
	{
		return last;
	}
	
	// allows (optionally) to give a "since" event
	//	var ev = eventList.findBeforeValue(3).next; 
	//  eventList.toArray ( ev ); 
	// will return an array with all events larger or equal to 3
	// with a bug that if the list starts with 3, you'll miss the first item

	this.toArray = function (eventFrom)
	{
		var list = [];
		
		var event;
		if ( eventFrom === undefined)
			event = first;
		else {
			event = eventFrom;
		}
		
		while ( event !== undefined )
		{
			list.push ( event );
			event = event.next;
		}
		return list;
	};
	this.size = function ()
	{
		if ( counter === undefined )
			counter = 0;
		return counter;
	}
}