// http://stackoverflow.com/questions/11495595/using-html-in-express-instead-of-jade

var fs = require('fs');
module.exports = function(path, options, fn){
    var cacheLocation = path + ':html';
    if(typeof module.exports.cache[cacheLocation] === "string"){
        return fn(null, module.exports.cache[cacheLocation]);
    }
    fs.readFile(path, 'utf8', function(err, data){
        if(err) { return fn(err); }
        return fn(null, module.exports.cache[cacheLocation] = data);
    });
}

htmlhandler = function ( req, res, next )
{
	console.log('in htmlhandler');
	  console.log('url '+req.originalUrl); // '/admin/new'
//	  console.log('base url '+req.baseUrl); // '/admin'
//	  console.log('path '+req.path); // '/new'
	  next();	
}
module.exports.cache = {};

