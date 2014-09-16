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
      port: 22000
    };



var socket = new Socket(client);

zmqLib(socket);

socket.on('message', function (data, clusterSource) {
  console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
  console.log('response: ', data);
});

console.log('result',socket);

socket.connect(server.protocol+'://0.0.0.0:'+server.port);
socket.connect(server.protocol+'://0.0.0.0:'+22001);

setInterval(function () {
  socket.send({timestamp: new Date().toISOString()})
}, 1000);
