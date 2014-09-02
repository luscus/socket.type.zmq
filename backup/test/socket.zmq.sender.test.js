var service = {
      probe: {
        name: 'socket.zmq.sender.test'
      },
      logger: {
        warning: console.log
      }
    },
    Socket = require('../lib/com.timocom.service.socket.zmq')(service);


var socketConfig = {
  "type": "zmq",
  "protocol": "tcp",
  "port": 44444,
  "pattern": "rep"
};

// curl -X POST -H "Content-Type: application/json" -d "{\"test\":42}" http://localhost:44444
var socket = Socket.instanciate(socketConfig);

socket.socket.on('message', function(buffer) {
  setTimeout(function () {
    console.log(Date.now())
  }, 1000);
});

if (socketConfig.pattern === 'sub') {
  setInterval(function () {
    socket.send({test:42});
  }, 1000);
}
