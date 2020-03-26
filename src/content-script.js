const Logger = require('./logger');
const { waitForElement, ping } = require('./utils');
const { retrieveSettings } = require('./store');

let logger;
const selector = '[data-qa="pr-branches-and-state-styles"]';

function getEphemeralURL(branchName, url) {
  // Regex to replace square brackets with branch name
  const regex = /(\[\])/gi;

  return url.replace(regex, branchName);
}

function createEphemeralLinkElement(label, href, isHostReachable) {
  const anchor = document.createElement('a');
  anchor.textContent = label;

  const attributes = {
    href,
    target: '_blank',
    rel: 'noreferrer noopener',
    style: 'display: flex; margin-left: 6px; text-decoration: none;',
  };

  if (!isHostReachable) {
    attributes.title = 'Ephemeral host is not reachable';
    attributes.style += 'filter: grayscale(100%);';
  }

  return Object.assign(anchor, attributes);
}

function extractBranchName(element) {
  return element.firstChild.textContent;
}

function appendEphemeralLink(linkElement) {
  const targets = document.querySelectorAll(selector);

  targets.forEach((target, index) => {
    if (index === 0) target.appendChild(linkElement);
    else target.appendChild(linkElement.cloneNode(true));
  });
}

async function addEphemeralLinkToThePage(branchNameElement, linkLabel, linkHref) {
  const branchName = extractBranchName(branchNameElement);
  const ephemeralURL = getEphemeralURL(branchName, linkHref);
  logger.debug(`Ephemeral URL: ${ephemeralURL}`);

  const isEphemeralHostReachable = await ping(ephemeralURL);
  logger.debug(`Is ephemeral host reachable: ${isEphemeralHostReachable}`);

  const ephemeralLink = createEphemeralLinkElement(
    linkLabel,
    ephemeralURL,
    isEphemeralHostReachable,
  );
  appendEphemeralLink(ephemeralLink);
  logger.debug('Link successfully added to the page');
}

async function processBackgroundNotification() {
  try {
    logger = new Logger();

    const { label, url } = await retrieveSettings();
    if (!url) {
      logger.warn(
        'Invalid URL! You must set ephemeral URL on the extension option page.',
      );
      return;
    }

    let branchNameElement = document.querySelector(selector);
    if (!branchNameElement) {
      logger.debug('Waiting for branch name element to appear');
      branchNameElement = await waitForElement(selector);
    }

    await addEphemeralLinkToThePage(branchNameElement, label, url);
  } catch (error) {
    logger.error(error);
  } finally {
    logger.disconnect();
  }
}

// fixme: process one notification at a time
chrome.runtime.onMessage.addListener(processBackgroundNotification);
