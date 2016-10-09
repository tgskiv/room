
var mappingManager = require('../mapping-manager');

var ListenerOnline = {
    onMessage: function (connection, message) {

        var data = JSON.parse(message.utf8Data);
        var roomHash = data.data.room;

        switch (data.event) {
            case "": {

                break;
            }
        }

        mappingManager.getConnectionsForRoom(roomHash).forEach(function (oneOfSubscribedConnections) {

            // don't send same package to sender
            if (connection === oneOfSubscribedConnections)
                return;

            try {
                oneOfSubscribedConnections.sendUTF(JSON.stringify(data));
            } catch (e) {
            } // do nothing, this is a dead connection
        });

    }

};

module.exports = ListenerOnline;