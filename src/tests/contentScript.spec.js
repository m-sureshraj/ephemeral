const store = require('../store');
const utils = require('../utils');
const Logger = require('../logger');
const { processBackgroundNotification, selector } = require('../content-script');
const { getBranchNameElement } = require('./helpers');

jest.mock('../utils');
jest.mock('../store');
jest.mock('../logger');

describe('It should listen', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('runtime.onMessage', () => {
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(
      processBackgroundNotification,
    );
    expect(chrome.runtime.onMessage.hasListener(processBackgroundNotification)).toBe(
      true,
    );
  });
});

describe('Process background notification', () => {
  const settings = { label: 'foo', url: 'https://[].hello.com' };
  const branchName = 'feature-branch';
  let branchNameElement;

  beforeEach(() => {
    branchNameElement = getBranchNameElement(branchName);
    document.body.appendChild(branchNameElement);

    utils.waitForElement.mockImplementation(() => Promise.resolve(branchNameElement));
    store.retrieveSettings.mockImplementation(() => Promise.resolve(settings));
    utils.ping.mockImplementation(() => Promise.resolve(true));
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('should do nothing when the URL value is not set', async () => {
    store.retrieveSettings.mockImplementationOnce(() =>
      Promise.resolve({ label: '', url: '' }),
    );

    await processBackgroundNotification();
    const mockWarn = Logger.mock.instances[0].warn;

    expect(store.retrieveSettings).toHaveBeenCalled();
    expect(mockWarn).toHaveBeenCalledWith(
      'Invalid URL! You must set test environment URL on the extension option page.',
    );
  });

  it('should not wait for the branch name element if it is already found', async () => {
    await processBackgroundNotification();

    expect(utils.waitForElement).not.toHaveBeenCalled();
  });

  it('should wait for the branch name element to appear', async () => {
    document.body.innerHTML = '';

    await processBackgroundNotification();

    expect(utils.waitForElement).toHaveBeenCalledWith(selector);
  });

  it('should handle the error if timed out while waiting for the element', async () => {
    utils.waitForElement.mockImplementationOnce(() =>
      Promise.reject('Element not found!'),
    );
    document.body.innerHTML = '';

    await processBackgroundNotification();
    const mockError = Logger.mock.instances[0].error;

    expect(mockError).toHaveBeenCalledWith('Element not found!');
  });

  it('should add the test environment link to the page', async () => {
    await processBackgroundNotification();

    const linkElement = document.querySelector('a');

    expect(linkElement.textContent).toBe(settings.label);
    expect(linkElement.href).toBe(`https://${branchName}.hello.com/`);
    expect(linkElement.title).toBe('');
  });

  it('should gray out the link if the test environment is not reachable', async () => {
    // Make test environment unreachable
    utils.ping.mockImplementationOnce(() => Promise.resolve(false));

    await processBackgroundNotification();

    const linkElement = document.querySelector('a');

    expect(linkElement.title).toBe('Test environment not reachable');
    expect(linkElement.style.filter).toBe('grayscale(100%)');
  });

  it('should not add the link if an error occurred while checking test environment reachability', async () => {
    // Fail the reachability check
    utils.ping.mockImplementationOnce(() => Promise.reject('Boom!'));

    await processBackgroundNotification();

    const mockError = Logger.mock.instances[0].error;
    const linkElement = document.querySelector('a');

    expect(linkElement).toBeNull();
    expect(mockError).toHaveBeenCalledWith('Boom!');
  });

  it('should disconnect the logger after processing the notification', async () => {
    await processBackgroundNotification();
    const mockDisconnect = Logger.mock.instances[0].disconnect;

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
