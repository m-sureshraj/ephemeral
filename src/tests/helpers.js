exports.setupForm = function() {
  const form = document.createElement('form');
  form.id = 'settings-form';
  form.addEventListener = jest.fn();

  const labelInput = document.createElement('input');
  labelInput.id = 'label';
  form.appendChild(labelInput);

  const urlInput = document.createElement('input');
  urlInput.id = 'url';
  form.appendChild(urlInput);

  document.body.appendChild(form);

  return {
    form,
    labelInput,
    urlInput,
  };
};

exports.getBranchNameElement = function(branchName = '') {
  const ele = document.createElement('span');
  ele.setAttribute('data-qa', 'pr-branches-and-state-styles');
  ele.textContent = branchName;

  return ele;
};

exports.mockConsole = function() {
  console.error = jest.spyOn(console, 'log').mockImplementation(() => {});
  console.debug = jest.spyOn(console, 'debug').mockImplementation(() => {});
  console.log = jest.spyOn(console, 'log').mockImplementation(() => {});
};

exports.restoreConsoleMock = function() {
  console.log.mockRestore();
  console.debug.mockRestore();
  console.error.mockRestore();
};
