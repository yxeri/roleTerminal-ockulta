'use strict';

const dbConnector = require('../../dbConnectors/databaseConnector');
const manager = require('../../socketHelpers/manager');
const databasePopulation = require('../../config/defaults/config').databasePopulation;
const logger = require('../../utils/logger');
const objectValidator = require('../../utils/objectValidator');

/**
 * Prepares a position
 * @param position
 * @returns {}
 */
function createUserPosition(user) {
  const position = user.position;
  const timestamp = new Date(position.timestamp);
  const locObj = {};
  const coords = {};

  coords.latitude = position.latitude;
  coords.longitude = position.longitude;
  coords.heading = position.heading;
  locObj.coords = coords;
  locObj.timestamp = timestamp;
  locObj.accuracy = position.accuracy;

  return locObj;
}

function handle(socket) {
  /**
   * Locate command. Returns location for one or more users
   * Emits locationMsg
   */
  socket.on('locate', (params) => {
    if (!objectValidator.isValidData(params, { user: { userName: true } })) {
      return;
    }

    manager.userAllowedCommand(socket.id, databasePopulation.commands.locate.commandName, (allowErr, allowed, user) => {
      if (allowErr || !allowed) {
        return;
      }

      const locationData = {};

      // Return all user locations
      if (params.user.userName === '*') {
        dbConnector.getAllUserLocations(params.user, (err, users) => {
          if (err || users === null) {
            logger.sendSocketErrorMsg(socket, logger.ErrorCodes.db, 'Failed to get user location', err);

            return;
          }

          for (const currentUser of users) {
            const userName = currentUser.userName;

            if (currentUser.position !== undefined) {
              locationData[userName] = createUserPosition(currentUser);
            }
          }

          socket.emit('locationMsg', locationData);
        });
      } else {
        dbConnector.getUserLocation(user, params.user.userName, (err, foundUser) => {
          if (err || foundUser === null) {
            logger.sendSocketErrorMsg(socket, logger.ErrorCodes.db, 'Failed to get user location', err);
          } else if (foundUser.position !== undefined) {
            const userName = foundUser.userName;
            locationData[userName] = createUserPosition(foundUser);

            socket.emit('locationMsg', locationData);
          } else {
            logger.sendSocketErrorMsg(socket, logger.ErrorCodes.notFound, `Unable to locate ${params.user.userName}`);
          }
        });
      }
    });
  });
}

exports.handle = handle;
