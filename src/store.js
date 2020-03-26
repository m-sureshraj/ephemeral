// Note: We are using `local` version of the storage

const defaultSettings = {
  label: '🌎', // Globe emoji,
  url: '',
};

exports.retrieveSettings = function() {
  // Just returning `chrome.storage.local.get` not reliable
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(defaultSettings, settings => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      resolve(settings);
    });
  });
};

exports.saveSettings = function(updateSettings) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(updateSettings, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      resolve();
    });
  });
};
