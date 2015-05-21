

# CachingHttp

Goal of this is to write a tightly coupled server and client library in which server pro-actively notifies client of (static) file changes and client can precache them.
The project uses [Service Workers](http://www.html5rocks.com/en/tutorials/service-worker/introduction/) on the client and a regular nodejs on the server. For push communication from server to client, [socket.io] (http://socket.io/) is used.
This is more intended as a toy than as a serious project, hence support for older browsers (using browser cache, long polling, etc) is not anticipated.

## Usage



## Developing



### Tools

NodeJS
Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
    

