var wsServer = require('./wsserver');
//var subscriberCommands = require('./listeners/listener-commands.js');
//var subscriberOnline = require('./listeners/listener-online.js');

var reception = require('./units/reception');
var commands = require('./units/commands');
var broadcasting = require('./units/broadcasting');

wsServer.start();

wsServer.on('message', function(data) {
    var connection = data.connection;    
    var message = data.message;

//    switch (message.type) {
//        case "utf8" : {
//
//            break;
//        }
//        case "binary" : {
//            break;
//        }
//    }

    // Assign and unassign connection to room, if requiested
    if (!reception.onMessage(connection, message)) {
        return;
    }
    
    // Executes commands
    if (!commands.onMessage(connection, message)) {
        return;
    }
    
    // Broadcasting messages
    if (!broadcasting.onMessage(connection, message)) {
        return;
    }
});

wsServer.on('closed', function(data) {
    reception.onClose(data.connection);
});

