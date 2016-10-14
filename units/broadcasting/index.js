
var mappingManager = require('../../rooms');

var ListenerOnline = {
    onMessage: function (connection, message) {

        mappingManager.getConnectionsInSameRoom( connection ).forEach(function (everyConnection) {

            if (connection === everyConnection)
                return;

            try {
                everyConnection.sendUTF(
                    message.utf8Data
                );
            } catch (e) {
                /**
                 * @todo Don't allow to have dead connections
                 */
            } // do nothing, this is a dead connection
        });

        return true;
    }

};

module.exports = ListenerOnline;