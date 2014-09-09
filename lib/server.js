var urlLib = require('url'),
    tools = require('./tools'),
    zmq = require('zmq');

// ZMQ event handlers
function onListen () {
  this.parent.emit('listen', this.url, this.parent);
}

function onAccept () {
  console.log(arguments);
  this.parent.emit('accept', this.url, this.parent);
}

function onError (error) {
  this.parent.emit('error', error, this.url, this.parent);
}

function onMessage (buffer) {

  var raw = buffer.toString(),
      data = JSON.parse(raw),
      meta = {};

  meta.bufferSize = buffer.length;
  meta.source = this.url;

  var response = this.parent.requestHandler(data, meta, raw);
  //response = this.parent.formatResponse(response, data);

  this.send(JSON.stringify(response));
}


var zmqServerTemplate = {
  listener: null,
  requestHandler: null,

  close: function () {
    this.listener.close();
  },

  bind: function (_callback) {
    this.requestHandler = _callback;

    var url = this.config.protocol + '://',
        port;

    if (! this.config.port && ! this.config.portRange) {
      throw {
        name: 'ServerBindException',
        message: 'You have to specify either:' +
        '\n  - a property "port" with a Number => port: 20000' +
        '\n  - a property "portRange" with an Array => portRange: [20000, 20002]\n\n'
      };
    }

    if (! this.config.port && this.config.portRange) {
      this.config.port = this.config.portRange[0];
    }

    if (this.config.bind) {
      url += this.config.bind + ':' + this.config.port;
    }
    else {
      url += '*' + ':' + this.config.port;
    }

    this.listener = new zmq.socket(tools.resolvePattern(this.config));
    this.listener.url = url;
    this.listener.parent = this;

    this.listener.monitor(500);

    this.listener.on('listen',  onListen);
    this.listener.on('accept',  onAccept);
    this.listener.on('error',   onError);
    this.listener.on('message', onMessage);

    try {
      this.listener.bindSync(url);
    }
    catch (ex) {
      if (ex.message === 'Address already in use') {
        this.emit('portAlreadyInUse', this.config.port, this.listener.url, this.listener.parent);
      }
    }
  }
};


module.exports = zmqServerTemplate;
