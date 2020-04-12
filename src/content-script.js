const Logger = require('./logger');
const { waitForElement, ping } = require('./utils');
const { retrieveSettings } = require('./store');

let logger;
const selector = '[data-qa="pr-branches-and-state-styles"]';

function getTestEnvURL(branchName, url) {
  // Regex to replace square brackets with the branch name
  const regex = /(\[\])/gi;

  return url.replace(regex, branchName);
}

function createLinkElement(label, href, isEnvReachable) {
  const anchor = document.createElement('a');
  anchor.textContent = label;

  const attributes = {
    href,
    target: '_blank',
    rel: 'noreferrer noopener',
    style: 'display: flex; margin-left: 6px; text-decoration: none;',
  };

  if (!isEnvReachable) {
    attributes.title = 'Test environment not reachable';
    attributes.style += 'filter: grayscale(100%);';
  }

  return Object.assign(anchor, attributes);
}

function extractBranchName(element) {
  return element.firstChild.textContent;
}

function appendLink(linkElement) {
  const targets = document.querySelectorAll(selector);

  targets.forEach((target, index) => {
    if (index === 0) target.appendChild(linkElement);
    else target.appendChild(linkElement.cloneNode(true));
  });
}

async function addTestEnvLinkToThePage(branchNameElement, linkLabel, linkHref) {
  const branchName = extractBranchName(branchNameElement);
  const testEnvURL = getTestEnvURL(branchName, linkHref);
  logger.debug(`Test environment URL: ${testEnvURL}`);

  const isTestEnvReachable = await ping(testEnvURL);
  logger.debug(`Is test environment reachable: ${isTestEnvReachable}`);

  const link = createLinkElement(linkLabel, testEnvURL, isTestEnvReachable);
  appendLink(link);
  logger.debug('Link successfully added to the page');
}

async function processBackgroundNotification() {
  try {
    logger = new Logger();

    const { label, url } = await retrieveSettings();
    if (!url) {
      logger.warn(
        'Invalid URL! You must set test environment URL on the extension option page.',
      );
      return;
    }

    let branchNameElement = document.querySelector(selector);
    if (!branchNameElement) {
      logger.debug('Waiting for branch name element to appear');
      branchNameElement = await waitForElement(selector);
    }

    await addTestEnvLinkToThePage(branchNameElement, label, url);
  } catch (error) {
    logger.error(error);
  } finally {
    logger.disconnect();
  }
}

chrome.runtime.onMessage.addListener(processBackgroundNotification);

// For testing purpose
module.exports = {
  selector,
  processBackgroundNotification,
};
