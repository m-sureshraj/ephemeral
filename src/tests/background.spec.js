const {
  handleInstalled,
  handleHistoryStateUpdate,
  pullRequestPageUrl,
  handleWebNavigationComplete,
  handleOnConnect,
  handleMessageFromContentScript,
} = require('../background');
const { mockConsole, restoreConsoleMock } = require('./helpers');

beforeAll(() => {
  mockConsole();
});

afterAll(() => {
  restoreConsoleMock();
});

describe('It should listen', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('runtime.onInstalled', () => {
    expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalledTimes(1);
    expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalledWith(handleInstalled);
  });

  it('webNavigation.onHistoryStateUpdated', () => {
    expect(chrome.webNavigation.onHistoryStateUpdated.addListener).toHaveBeenCalledTimes(
      1,
    );
    expect(chrome.webNavigation.onHistoryStateUpdated.addListener).toHaveBeenCalledWith(
      handleHistoryStateUpdate,
      {
        url: [{ urlMatches: pullRequestPageUrl }],
      },
    );
  });

  it('webNavigation.onCompleted', () => {
    expect(chrome.webNavigation.onCompleted.addListener).toHaveBeenCalledTimes(1);
    expect(chrome.webNavigation.onCompleted.addListener).toHaveBeenCalledWith(
      handleWebNavigationComplete,
      {
        url: [{ urlMatches: pullRequestPageUrl }],
      },
    );
  });

  it('runtime.onConnect', () => {
    expect(chrome.runtime.onConnect.addListener).toHaveBeenCalledTimes(1);
    expect(chrome.runtime.onConnect.addListener).toHaveBeenCalledWith(handleOnConnect);
  });
});

describe('Extension installation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should open the options page after a successful installation', () => {
    handleInstalled({ reason: 'install' });

    expect(chrome.runtime.openOptionsPage).toHaveBeenCalled();
  });

  it('should not open the options page for other than "install" event', () => {
    handleInstalled({ reason: 'some-event' });

    expect(chrome.runtime.openOptionsPage).not.toHaveBeenCalled();
  });
});

describe('Message passing', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should listen incoming messages from the content script', () => {
    handleOnConnect(chrome.runtime);

    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(
      handleMessageFromContentScript,
    );
    expect(chrome.runtime.onMessage.hasListener(handleMessageFromContentScript)).toBe(
      true,
    );
  });

  it('should log the incoming messages for debugging', () => {
    const payload = 'bingo';
    handleMessageFromContentScript(payload);

    expect(console.log).toHaveBeenCalledWith(payload);
  });
});

describe('Notify', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const details = {
    tabId: 200,
  };

  it('should notify the tab when "onHistoryStateUpdated" event triggered', () => {
    handleHistoryStateUpdate(details);

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      details.tabId,
      {},
      expect.any(Function),
    );
  });

  it('should notify the tab when "webNavigation.onCompleted" event triggered', () => {
    handleWebNavigationComplete(details);

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      details.tabId,
      {},
      expect.any(Function),
    );
  });
});
