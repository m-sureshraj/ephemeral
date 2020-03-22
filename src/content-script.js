const Logger = require('./logger');
const { waitForElement, ping } = require('./utils');

const log = new Logger();
const selector = '[data-qa="pr-branches-and-state-styles"]';

function getEphemeralHost(subDomain) {
  return `https://${subDomain}.harver-dev.com`;
}

function createEphemeralLinkElement(href, isHostReachable) {
  const anchor = document.createElement('a');
  anchor.innerHTML = '&#127758;'; // Globe emoji

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

async function addEphemeralLinkToThePage(branchNameElement) {
  const branchName = extractBranchName(branchNameElement);
  const ephemeralHost = getEphemeralHost(branchName);
  log.debug(`Ephemeral host: ${ephemeralHost}`);

  const isEphemeralHostReachable = await ping(ephemeralHost);
  log.debug(`Is ephemeral host reachable: ${isEphemeralHostReachable}`);

  const ephemeralLink = createEphemeralLinkElement(
    ephemeralHost,
    isEphemeralHostReachable,
  );
  appendEphemeralLink(ephemeralLink);
  log.debug('Link successfully added to the page');
}

async function processBackgroundNotification() {
  let branchNameElement = document.querySelector(selector);

  try {
    if (!branchNameElement) {
      log.debug('Waiting for branch name element to appear');
      branchNameElement = await waitForElement(selector);
    }

    await addEphemeralLinkToThePage(branchNameElement);
  } catch (error) {
    log.error(error);
  } finally {
    log.disconnect();
  }
}

// fixme: process one notification at a time
chrome.runtime.onMessage.addListener(processBackgroundNotification);
