'use strict';

function handle(socket) {
  socket.on('glitch', (params) => {
    socket.emit('glitch', params);
    socket.broadcast.emit('glitch', params);
  });
}

exports.handle = handle;
