const urlToMatch = 'https://bitbucket.org/[a-z]+/[a-z-]+/pull-requests/\\d+';

function notify(tabId) {
  chrome.tabs.sendMessage(tabId, {});
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
  console.log(payload);
}

// Fired when the frame's history was updated to a new URL. (e.g. client side routing)
chrome.webNavigation.onHistoryStateUpdated.addListener(handleHistoryStateUpdate, {
  url: [{ urlMatches: urlToMatch }],
});

// Fired when a document, including the resources it refers to, is completely loaded and initialized
// E.g. Full page reload
chrome.webNavigation.onCompleted.addListener(handleWebNavigationComplete, {
  url: [{ urlMatches: urlToMatch }],
});

// Listening incoming messages from the content script
chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(handleMessageFromContentScript);
});
