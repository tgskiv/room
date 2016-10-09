var WebSocketServer = require('websocket').server;

var http, server;

var subscriberCommands = require('./listeners/listener-commands.js');
var subscriberOnline = require('./listeners/listener-online.js');
var extend = require('util')._extend;

var fs = require('fs');



// ============================================================================= SETTINGS
var defaults = {
    servKey: 'cert/server.key',
    servCrt: 'cert/server.crt',
    port: 8080,
    secure: false,
};
var nconf = require('nconf');
nconf.use('file', { file: './config.json' });
nconf.load();
var settings = nconf.get('settings');
settings = extend(settings, defaults);
// ============================================================================= /SETTINGS

if (settings.secure) {
    console.log('Entering secure mode');
    http = require('https');
    server = http.createServer({
        key: fs.readFileSync(settings.servKey),
        cert: fs.readFileSync(settings.servCrt)
    }, requestCallback);

} else {
    http = require('http');
    server = http.createServer(requestCallback);
}

function requestCallback(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
}

//console.log(server);
        
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}



wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    
    var connection = request.accept(null, request.origin); // request.origin = 127.0.0.24
    console.log((new Date()) + ' Connection accepted.');
    
    connection.on('message', function(message) {
        
        
        console.log('---------------------------------------------------------');

        switch (message.type) {
            case "utf8" : {

                break;
            }
            case "binary" : {
                break;
            }
        }

        subscriberOnline.onMessage(connection, message);
        subscriberCommands.onMessage(connection, message);

    });
    
    
    
    
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
    
    
});



