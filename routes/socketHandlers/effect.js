'use strict';

const dbConnector = require('../../dbConnectors/databaseConnector');
const messenger = require('../../socketHelpers/messenger');

function handle(socket) {
  socket.on('glitch', (params) => {
    dbConnector.getEvent('glitch', (err, event) => {
      if (err) {
        return;
      } else if (event !== null && event.hasBeenUsed === true) {
        messenger.sendSelfMsg({
          socket,
          message: {
            text: ['Event has already been used'],
          },
        });

        return;
      }

      socket.emit('glitch', params);
      socket.broadcast.emit('glitch', params);
      dbConnector.setEventUsed('glitch', true, (err) => {
        if (err) {
          console.log('Failed to set event used');
        }

        console.log('set Event used!');
      });
    });
  });
}

exports.handle = handle;
