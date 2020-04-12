require('jest-fetch-mock').enableMocks();
require('jest-webextension-mock');

// `jest-webextension-mock` missed mocking a few web extensions APIs
chrome.webNavigation = {
  onCompleted: {
    addListener: jest.fn(),
  },
  onHistoryStateUpdated: {
    addListener: jest.fn(),
  },
};
chrome.runtime.openOptionsPage = jest.fn();

document.addEventListener = jest.fn();
window.alert = jest.fn();
