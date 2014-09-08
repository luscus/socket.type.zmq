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

  bind: function (_callback) {
    this.requestHandler = _callback;

    var url = this.config.protocol + '://';

    if (this.config.bind) {
      url += this.config.bind;
    }
    else {
      url += '*';
    }

    url += ':' + this.config.port;

    this.listener = new zmq.socket(tools.resolvePattern(this.config));
    this.listener.url = url;
    this.listener.parent = this;

    this.listener.monitor(500);

    this.listener.on('listen',  onListen);
    this.listener.on('accept',  onAccept);
    this.listener.on('error',   onError);
    this.listener.on('message', onMessage);

    this.listener.bindSync(url);
  }
};


module.exports = zmqServerTemplate;
