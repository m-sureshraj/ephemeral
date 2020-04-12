const { retrieveSettings, saveSettings } = require('../store');

describe('retrieveSettings', () => {
  afterAll(() => {
    jest.clearAllMocks();

    // reset
    chrome.runtime.lastError = null;
    chrome.storage.local.clear();
  });

  it('should return the default settings when the store is empty', async () => {
    const defaultSettings = {
      label: '🌎', // Globe emoji,
      url: '',
    };
    const settings = await retrieveSettings();

    expect(settings).toEqual(defaultSettings);
    expect(chrome.storage.local.get).toHaveBeenCalledWith(
      defaultSettings,
      expect.any(Function),
    );
  });

  it('should retrieve the saved settings', async () => {
    const updatedSettings = {
      label: 'foo',
      url: 'https://api.github.com',
    };
    await saveSettings(updatedSettings);
    const settings = await retrieveSettings();

    expect(settings).toEqual(updatedSettings);
  });

  it('should throw an error if a runtime error occurs while retrieving the settings', async () => {
    const failureReason = { message: 'something went wrong' };
    chrome.runtime.lastError = failureReason;

    await expect(retrieveSettings()).rejects.toEqual(failureReason);
  });
});

describe('saveSettings', () => {
  afterAll(() => {
    jest.clearAllMocks();

    // reset
    chrome.runtime.lastError = null;
    chrome.storage.local.clear();
  });

  it('should save the settings', async () => {
    const updatedSettings = {
      label: 'link please',
      url: 'https://github.com',
    };
    await saveSettings(updatedSettings);

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      updatedSettings,
      expect.any(Function),
    );
  });

  it('should throw an error if a runtime error occurs while saving the settings', async () => {
    const failureReason = { message: 'something went wrong' };
    chrome.runtime.lastError = failureReason;

    await expect(saveSettings({})).rejects.toEqual(failureReason);
  });
});
