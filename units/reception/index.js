
var roomMapping = require('../../rooms');

var ListenerOnline = {
    onMessage : function(connection, message) {
        
        if (message.type !== "utf8") { return true; }
        
        var data = JSON.parse(message.utf8Data);
        var roomHash = data.data.room;
        
        console.log('Current room: '+roomHash);
        console.log('Message "'+data.event+'" recieved');

        if (data.event === 'room:leaved') {
            roomMapping.remConnectionFromRoom(roomHash, connection);
        }

        if (data.event === 'room:switched') {
            roomMapping.addConnectionToRoom(roomHash, connection);
        }

        var listOfUsers = roomMapping.getUsersInRoom(roomHash);


        roomMapping.getConnectionsForRoom( roomHash ).forEach(function( oneOfSubscribedConnections ) {
            try {
                oneOfSubscribedConnections.sendUTF(JSON.stringify({
                    event: 'room:users',
                    data: listOfUsers
                }));
            } catch (e) {} // do nothing, this is a dead connection
            
        });
        
        return false;
    },
    onClose: function(connection) {
        var room = roomMapping.getRoomByConnection(connection);
        if (room) {
            roomMapping.remConnectionFromRoom(room.getHash(), connection);
        }
        
        
    }
    
};

module.exports = ListenerOnline;