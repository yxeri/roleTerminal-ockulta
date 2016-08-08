'use strict';

const mongoose = require('mongoose');
const logger = require('../../utils/logger');

const commandSchema = new mongoose.Schema({
  commandName: String,
  accessLevel: Number,
  visibility: Number,
  authGroup: String,
  category: String,
  timesUsed: Number,
}, { collection: 'commands' });

const Command = mongoose.model('Command', commandSchema);

function incrementCommandUsage(commandName) {
  const query = { commandName };
  const update = { $inc: { timesUsed: 1 } };

  Command.findOneAndUpdate(query, update).lean().exec((err) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to increment command usage'],
        err,
      });
    }
  });
}

function updateCommandVisibility(cmdName, value, callback) {
  const query = { commandName: cmdName };
  const update = { $set: { visibility: value } };
  const options = { new: true };

  Command.findOneAndUpdate(query, update, options).lean().exec(
    (err, cmd) => {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update command visibility'],
          err,
        });
      }

      callback(err, cmd);
    }
  );
}

function updateCommandAccessLevel(cmdName, value, callback) {
  const query = { commandName: cmdName };
  const update = { $set: { accessLevel: value } };
  const options = { new: true };

  Command.findOneAndUpdate(query, update, options).lean().exec(
    (err, cmd) => {
      if (err) {
        logger.sendErrorMsg({
          code: logger.ErrorCodes.db,
          text: ['Failed to update command access level'],
          err,
        });
      }

      callback(err, cmd);
    }
  );
}

function getAllCommands(callback) {
  const filter = { _id: 0 };

  Command.find({}, filter).lean().exec((err, commands) => {
    if (err || commands === null) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get all command'],
        err,
      });
    }

    callback(err, commands);
  });
}

function populateDbCommands(sentCommands) {
  const cmdKeys = Object.keys(sentCommands);
  const callback = (err) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['PopulateDb: [failure] Failed to update command'],
        err,
      });
    }
  };

  for (let i = 0; i < cmdKeys.length; i++) {
    const command = sentCommands[cmdKeys[i]];
    const query = { commandName: command.commandName };
    const options = { upsert: true };

    Command.findOneAndUpdate(query, command, options).lean().exec(callback);
  }
}

function getCommand(commandName, callback) {
  const query = { commandName };

  Command.findOne(query).lean().exec((err, command) => {
    if (err) {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.db,
        text: ['Failed to get command'],
        err,
      });
    }

    callback(err, command);
  });
}

exports.getCommand = getCommand;
exports.updateCommandVisibility = updateCommandVisibility;
exports.updateCommandAccessLevel = updateCommandAccessLevel;
exports.getAllCommands = getAllCommands;
exports.populateDbCommands = populateDbCommands;
exports.incrementCommandUsage = incrementCommandUsage;