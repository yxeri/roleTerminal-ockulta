'use strict';

const express = require('express');
const socketIo = require('socket.io');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const appConfig = require('rolehaven-config').app;
const dbConnector = require('./databaseConnector');
const databasePopulation = require('rolehaven-config').databasePopulation;
const app = express();

app.io = socketIo();

// view engine setup
app.set('views', path.join(__dirname, appConfig.publicBase, appConfig.viewsPath));
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.use(compression());

// Logging
app.use(morgan(appConfig.logLevel));

// Serve files from public path
app.use(express.static(path.join(__dirname, appConfig.publicBase)));

/*
 * Add all request paths and corresponding file paths to Express
 */
for (let i = 0; i < appConfig.routes.length; i++) {
  const route = appConfig.routes[i];

  app.use(route.sitePath, require(path.resolve(route.filePath))(app.io));
}

dbConnector.populateDbUsers(databasePopulation.users);
dbConnector.populateDbRooms(databasePopulation.rooms, databasePopulation.users.superuser);
dbConnector.populateDbCommands(databasePopulation.commands);

/*
 * Catches all exceptions and keeps the server running
 */
process.on('uncaughtException', function(err) {
  console.log('Caught exception', err);
  console.log(err.stack);
});

module.exports = app;
