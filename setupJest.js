require('jest-fetch-mock').enableMocks();
require('jest-webextension-mock');

document.addEventListener = jest.fn();
window.alert = jest.fn();
