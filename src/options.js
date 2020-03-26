const { retrieveSettings, saveSettings } = require('./store');

async function populateInputFields(labelElement, urlElement) {
  const { label, url } = await retrieveSettings();
  console.debug('Old settings', { label, url });

  labelElement.value = label;
  urlElement.value = url;
}

async function handleFormSubmit(labelElement, urlElement) {
  const label = labelElement.value.trim();
  const url = urlElement.value.trim();
  if (!label || !url) {
    alert('Label or URL field value is invalid!');
    return;
  }

  try {
    await saveSettings({ label, url });

    const message = 'Settings successfully updated';
    console.debug(message, { label, url });
    alert(message);
  } catch (error) {
    console.error(error);
    alert('An error occurred while saving settings! Try again.');
  }
}

async function handleDOMContentLoaded() {
  const form = document.querySelector('#settings-form');
  const labelElement = form.querySelector('#label');
  const urlElement = form.querySelector('#url');

  form.addEventListener('submit', event => {
    event.preventDefault();
    handleFormSubmit(labelElement, urlElement);
  });

  try {
    await populateInputFields(labelElement, urlElement);
  } catch (error) {
    console.error(error);
    alert('An error occurred while retrieving settings! Please reload the page.');
  }
}

document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
