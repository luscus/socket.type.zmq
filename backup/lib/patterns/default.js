var auroraConfig = require('com.timocom.aurora.config'),
    zmq = require('zmq'),
    sockets;

function open (socketConfig) {
  var socket = zmq.socket(socketConfig.pattern);
  connect(socketConfig, socket);

  return socket;
}

function close (socket) {
  return socket.close();
}


function resolveSocketUrl (socketConfig, targetHost) {
  socketConfig.host = socketConfig.host || '0.0.0.0';

  var protocol = socketConfig.protocol;

  switch (protocol) {
    case 'tcp':
      var port = (socketConfig.port) ? ':' + socketConfig.port : '';

      return targetHost || protocol + '://' + socketConfig.host + port;

    case 'inproc':
    case 'ipc':
      return targetHost || protocol + '://' + auroraConfig.dungeon_directories.sockets + '/' + socketConfig.id;

    default:
      throw new Error('ZMQ protocol "'+protocol+'" is unknown');
  }
}

function connect (socketConfig, socket) {
  if (socketConfig.targets && socketConfig.patternType === 'publisher') {
    for (var idx in socketConfig.targets) {
      var targetHost = socketConfig.targets[idx];

      //console.log('socketConfig.targets['+idx+']', socketConfig.targets[idx]);
      resolveConnection(socketConfig.pattern, socket, resolveSocketUrl(socketConfig, targetHost));
    }
  }
  else {
    resolveConnection(socketConfig.pattern, socket, resolveSocketUrl(socketConfig));
  }
}

function resolveConnection (pattern, socket, targetHost) {

  switch (pattern) {
    case 'rep':
    case 'pub':
    case 'pull':
      socket.bindSync(targetHost);
      break;

    case 'sub':
    case 'push':
    case 'req':
      socket.connect(targetHost);
      break;
  }
}



module.exports = function (serviceObject) {
  service = serviceObject;

  return {
    open: function (socketConfig) {
      return open(socketConfig);
    },
    close: function (socketConfig) {
      return close(socketConfig);
    },
    resolveSocketUrl: function (socketConfig) {
      return resolveSocketUrl(socketConfig);
    }
  };
};
