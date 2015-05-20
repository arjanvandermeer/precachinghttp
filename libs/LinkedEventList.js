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
//		if ( typeof ( event ) !== Event )
	//		{
		//	}

		// this allows for race conditions
		if ( this.counter === undefined )
			this.counter=0;
		
		var deleteEvent;
		if ( !this.duplicateDescriptions )
		{
			deleteEvent = this.findDescription ( event.description );
		}
		if ( this.isEmpty() )
		{
			this.first = event;
			this.last = event;
			this.counter = 1;
		} else if ( event.value < this.first.value ) {
			this.first = this.first.insertBefore(event).previous;
			this.counter++;
		} else if ( event.value > this.last.value ) {
			this.last = this.last.insertAfter(event).next;
			this.counter++;
		} else {
			this.findFirstValue(event.value).insertBefore(event);
			this.counter++;
		}
		
		if ( deleteEvent !== undefined )
			this.remove ( deleteEvent );

		return this.counter;
	};
	this.isEmpty = function ( )
	{
		return this.first === undefined && this.last === undefined ;
	};
	this.findValue = function ( value )
	{
		if ( this.isEmpty () || value < this.first.value || value > this.last.value )
			return undefined;

		var event=this.first;

		while(event !== undefined && event.value !== value)
		{
			event = event.next;
		}
		return event;
	};
	this.remove = function ( element )
	{
		try
		{
			var previous = element.previous;
			var next = element.next;
			if ( previous !== undefined )
				element.previous.next = next;
			else
				this.first = next;
			
			if ( next !== undefined )
				element.next.previous = previous;
			else
				this.last = previous;
			
			this.counter--;
		} catch (err )
		{
			console.log(err);
		}
	};

	this.findFirstValue = function ( value )
	{
		if ( this.isEmpty ())
			return undefined;
		if ( value < this.first.value )
			return this.first;
		if ( value > this.last.value )
			return undefined;

		var event=this.first;

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
		var event=this.first;
		var x=0;
		while(event !== undefined && event.description !== description)
		{
			event = event.next;
		}
		return event;
	};
	this.get = function ( item )
	{
		if ( item < 0 || item > this.counter)
			return undefined;
	
		var event=this.first;
		var x=0;
		while(event !== undefined && x++<item)
		{
			event = event.next;
		}
		return event;
	};
	this.clear = function ()
	{
		this.counter=0;
		this.first = undefined;
		this.last = undefined;
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
			event = this.first;
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
		if ( this.counter === undefined )
			this.counter = 0;
		return this.counter;
	}
}


