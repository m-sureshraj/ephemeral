const Logger = require('../logger');

describe('Logger', () => {
  let logger;
  beforeEach(() => {
    logger = new Logger();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should open a long-lived channel to send log messages to the background', () => {
    expect(logger.channel.name).toBe('content-script-logger');
    expect(chrome.runtime.connect).toHaveBeenCalledWith({
      name: 'content-script-logger',
    });
  });

  it('should send debugging messages to the background', () => {
    const debugMessage = 'Hola, Bingo';
    logger.debug(debugMessage);

    expect(logger.channel.postMessage).toHaveBeenCalledWith({
      type: 'debug',
      message: debugMessage,
    });
  });

  it('should send warning messages to the background', () => {
    const warning = 'Hola, Bingo';
    logger.warn(warning);

    expect(logger.channel.postMessage).toHaveBeenCalledWith({
      type: 'warn',
      message: warning,
    });
  });

  it('should send runtime error object to the background', () => {
    const error = new Error('something went wrong!');
    logger.error(error);

    expect(logger.channel.postMessage).toHaveBeenCalledWith({
      type: 'error',
      error: logger.serializer(error),
    });
  });

  it('should send error messages (text) to the background', () => {
    const error = 'something went wrong';
    logger.error(error);

    expect(logger.channel.postMessage).toHaveBeenCalledWith({
      type: 'error',
      error: '"something went wrong"',
    });
  });

  it('should serialize an error object', () => {
    const stringifySpy = jest.spyOn(JSON, 'stringify');

    const error = new Error('something went wrong!');
    const serializedMessage = logger.serializer(error);

    expect(stringifySpy).toHaveBeenCalledWith(error, ['name', 'message', 'stack'], 4);
    expect(JSON.parse(serializedMessage)).toEqual({
      name: 'Error',
      message: 'something went wrong!',
      stack: expect.any(String),
    });
  });

  it('should close the channel', () => {
    // `jest-webextension-mock` library does not have a mock for `disconnect` event
    logger.channel.disconnect = jest.fn();
    logger.disconnect();

    expect(logger.channel.disconnect).toHaveBeenCalled();
  });
});
