const { handleDOMContentLoaded, handleFormSubmit } = require('../options');
const { setupForm, mockConsole, restoreConsoleMock } = require('./helpers');
const store = require('../store');

jest.mock('../store', () => {
  return {
    saveSettings: jest.fn(),
    retrieveSettings: jest.fn(() => ({ label: 'hi', url: 'json' })),
  };
});

beforeAll(() => {
  mockConsole();
});

afterAll(() => {
  jest.clearAllMocks();
  restoreConsoleMock();
});

describe('It should listen', () => {
  it('DOMContentLoaded', () => {
    expect(document.addEventListener).toHaveBeenCalledWith(
      'DOMContentLoaded',
      handleDOMContentLoaded,
    );
  });
});

describe('After the page load', () => {
  let elements;
  beforeEach(() => {
    elements = setupForm();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('should listen form submit event', async () => {
    await handleDOMContentLoaded();

    expect(elements.form.addEventListener).toHaveBeenCalledWith(
      'submit',
      expect.any(Function),
    );
  });

  it('should populate the input fields with the default settings', async () => {
    await handleDOMContentLoaded();

    expect(elements.labelInput.value).toBe('hi');
    expect(elements.urlInput.value).toBe('json');
  });

  it('should show an alert message when populating inputs failed', async () => {
    store.retrieveSettings.mockImplementationOnce(() => Promise.reject('Boom!'));

    await handleDOMContentLoaded();

    expect(alert).toHaveBeenCalledWith(
      'An error occurred while retrieving settings! Please reload the page.',
    );
  });
});

describe('Form submit', () => {
  let elements;
  beforeEach(() => {
    elements = setupForm();
    elements.labelInput.value = 'foo';
    elements.urlInput.value = 'bar';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('should show an alert message when the URL or label value is empty.', async () => {
    elements.labelInput.value = '';
    elements.urlInput.value = '';

    await handleFormSubmit(elements.labelInput, elements.urlInput);

    expect(alert).toHaveBeenCalledWith('Label or URL field value is invalid!');
    expect(store.saveSettings).not.toHaveBeenCalled();
  });

  it('should save updated settings', async () => {
    await handleFormSubmit(elements.labelInput, elements.urlInput);

    expect(store.saveSettings).toHaveBeenCalledWith({ label: 'foo', url: 'bar' });
    expect(alert).toHaveBeenCalledWith('Settings successfully updated');
  });

  it('should show an alert message when saving failed', async () => {
    store.saveSettings.mockImplementationOnce(() => Promise.reject('Boom!'));

    await handleFormSubmit(elements.labelInput, elements.urlInput);

    expect(alert).toHaveBeenCalledWith(
      'An error occurred while saving settings! Try again.',
    );
  });
});
