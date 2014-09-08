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
    server = {};



var socket = new Socket(client);

zmqLib(socket);
console.log('result',socket);
