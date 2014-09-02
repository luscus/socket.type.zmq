var service = {
      probe: {
        name: 'socket.zmq.receiver.test'
      },
      logger: {
        warning: console.log
      }
    },
    Socket = require('../lib/com.timocom.service.socket.zmq')(service);


var socketConfig = {
  "type": "zmq",
  "protocol": "tcp",
  "pattern": "req",
  "targets": ["localhost:44444"]
};

// curl -X POST -H "Content-Type: application/json" -d "{\"test\":42}" http://localhost:44444
var socket = Socket.instanciate(socketConfig);

if (socketConfig.pattern === 'req') {
  setInterval(function () {
    socket.send({"test":42});
  }, 1000);
}
