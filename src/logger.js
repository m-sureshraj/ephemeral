class Logger {
  constructor() {
    this.channel = chrome.runtime.connect({ name: 'content-script-logger' });
  }

  serializer(error) {
    return JSON.stringify(error, ['name', 'message', 'stack'], 4);
  }

  debug(message) {
    this.channel.postMessage({
      type: 'debug',
      message,
    });
  }

  error(error) {
    this.channel.postMessage({
      type: 'error',
      error: this.serializer(error),
    });
  }

  disconnect() {
    this.channel.disconnect();
  }
}

module.exports = Logger;
