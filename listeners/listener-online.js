
var mappingManager = require('../mapping-manager');

var ListenerOnline = {
    onMessage : function(connection, message) {
        
        var data = JSON.parse(message.utf8Data);
        var roomHash = data.data.room;
        console.log('Current room: '+roomHash);
        console.log('Message "'+data.event+'" recieved');

        if (data.event == 'room:leaved') {
            mappingManager.remUserFromRoom(data.data.user, roomHash, connection);
        }

        if (data.event == 'room:switched') {
            mappingManager.addUserToRoom(data.data.user, roomHash, connection);
        }

        var listOfUsers = mappingManager.getUsersInRoom(roomHash);



        mappingManager.getConnectionsForRoom(roomHash).forEach(function(oneOfSubscribedConnections) {
            try {
                oneOfSubscribedConnections.sendUTF(JSON.stringify({
                    event: 'room:users',
                    data: listOfUsers
                }));
            } catch (e) {} // do nothing, this is a dead connection
            
        });
    }
    
};

module.exports = ListenerOnline;