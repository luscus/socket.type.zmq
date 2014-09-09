// testing
var Socket = require('../../service.lib.socket/lib/Socket'),
    zmqLib = require('../lib/socket.type.zmq'),
    service = {
      name: 'zmqTest'
    },
    client = {
      name: 'client',
      type: 'zmq',
      protocol: 'tcp',
      pattern: 'requester'
    },
    server = {
      name: 'server',
      type: 'zmq',
      protocol: 'tcp',
      pattern: 'responder',
      portRange: [22000, 22001]
    };



var socket = new Socket(server);

socket.on('listen', function (url) {
  console.log('Process "' + process.pid + '" listening on ' + url);
})

zmqLib(socket);

socket.bind(function (data, meta, raw) {
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  console.log('resquest: ', data);
  return meta;
});
