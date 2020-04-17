const pullRequestPageUrl = 'https://bitbucket.org/[a-z]+/[a-z-]+/pull-requests/\\d+';

function notify(tabId) {
  chrome.tabs.sendMessage(tabId, {}, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
}

function handleHistoryStateUpdate(details) {
  const { tabId } = details;
  console.debug(`"onHistoryStateUpdated" event triggered on tab: ${tabId}`);
  notify(tabId);
}

function handleWebNavigationComplete(details) {
  const { tabId } = details;
  console.debug(`"onCompleted" event triggered on tab: ${tabId}`);
  notify(tabId);
}

function handleMessageFromContentScript(payload) {
  console.log(payload); // for debugging
}

function handleInstalled({ reason }) {
  if (reason === 'install') {
    console.debug('Extension "Ephemeral" successfully installed');
    chrome.runtime.openOptionsPage();
  }
}

function handleOnConnect(port) {
  port.onMessage.addListener(handleMessageFromContentScript);
}

// Fired when the frame's history was updated to a new URL. (e.g. client side routing)
chrome.webNavigation.onHistoryStateUpdated.addListener(handleHistoryStateUpdate, {
  url: [{ urlMatches: pullRequestPageUrl }],
});

// Fired when a document, including the resources it refers to, is completely loaded and initialized
// E.g. Full page reload
chrome.webNavigation.onCompleted.addListener(handleWebNavigationComplete, {
  url: [{ urlMatches: pullRequestPageUrl }],
});

// Listening incoming messages from the content script
chrome.runtime.onConnect.addListener(handleOnConnect);

chrome.runtime.onInstalled.addListener(handleInstalled);

// For testing purpose
module.exports = {
  handleHistoryStateUpdate,
  handleWebNavigationComplete,
  handleMessageFromContentScript,
  handleInstalled,
  handleOnConnect,
  pullRequestPageUrl,
};
