var WebSocketServer = require('websocket').server;
var httpModule, webServer;
var extend = require('util')._extend;
var fs = require('fs');
var EventEmitter = require('events');
var serverEmitter = new EventEmitter();

var settings = {
    servKey: 'cert/server.key',
    servCrt: 'cert/server.crt',
    port: 8085,
    secure: false,
}




function requestCallback(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
}


function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}

function loadConfig() {
    var nconf = require('nconf');
    nconf.use('file', { file: './config.json' });
    nconf.load();
    var loadedSettings = nconf.get('settings');
    
    settings = extend(settings, loadedSettings);
}

function initServer() {
    
    if (settings.secure) {
        console.log('Entering secure mode');
        httpModule = require('https');
        webServer = httpModule.createServer({
            key: fs.readFileSync(settings.servKey),
            cert: fs.readFileSync(settings.servCrt)
        }, requestCallback);

    } else {
        httpModule = require('http');
        webServer = httpModule.createServer(requestCallback);
    }


    webServer.listen(settings.port, function() {
        console.log((new Date()) + ' Server is listening on port '+settings.port);
    });

    webServer.on('error', function(error) {
        if (error.code === 'EADDRINUSE') {
            console.error("Port "+settings.port+" is in use.");
        } else {
            console.error('Error', error);
        }
    });

    wsServer = new WebSocketServer({
        httpServer: webServer,
        // You should not use autoAcceptConnections for production 
        // applications, as it defeats all standard cross-origin protection 
        // facilities built into the protocol and the browser.  You should 
        // *always* verify the connection's origin and decide whether or not 
        // to accept it. 
        autoAcceptConnections: false
    });

    wsServer.on('request', function(request) {
        if (!originIsAllowed(request.origin)) {
            // Make sure we only accept requests from an allowed origin 
            request.reject();
            console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
            return;
        }

        var connection = request.accept(null, request.origin);
        connection.user = {
            login: request.httpRequest.getHeader('username'),
            uid: request.httpRequest.getHeader('uid')
        };
        
        console.log((new Date()) + ' Connection accepted.');
        
        serverEmitter.emit('opened', connection);

        connection.on('message', function(message) {
            console.log('Message received');
            
            serverEmitter.emit('message', {
                connection: connection,
                message: message
            });
        });

        connection.on('close', function(reasonCode, description) {
            serverEmitter.emit('closed', {
                connection: connection,
                reasonCode: reasonCode,
                description: description
            });
            
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
    });
    
}




function setListener(event, callback) {
    serverEmitter.on(event, callback);
}


function start() {
    loadConfig();
    initServer();
}

module.exports = {
    start: start,
    on: setListener
}