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

function getElement(type, text = null, children = null) {
  const ele = document.createElement(type);
  if (text) ele.innerHTML = text;
  if (children) children.forEach(child => ele.appendChild(child));

  return ele;
}

exports.getBranchNameElement = function(branchName = '') {
  // Should return the following structure
  // <div data-qa="pr-branches-and-state-styles">
  //   <div>
  //     <div>
  //       <span><span>Branch: ${branchName}</span></span>
  //       <div><span>${branchName}</span></div>
  //     </div>
  //   </div>
  //   <div>...</div>
  //   <div>...</div>
  // </div>

  const ele = getElement('div');
  ele.setAttribute('data-qa', 'pr-branches-and-state-styles');

  const branchNameEle = getElement('div', null, [
    getElement('div', null, [
      getElement('span', null, [getElement('span', `Branch: ${branchName}`)]),
      getElement('div', null, [getElement('span', branchName)]),
    ]),
  ]);

  ele.appendChild(branchNameEle);
  ele.appendChild(getElement('div'));
  ele.appendChild(getElement('div'));

  return ele;
};

exports.mockConsole = function() {
  console.error = jest.spyOn(console, 'error').mockImplementation(() => {});
  console.debug = jest.spyOn(console, 'debug').mockImplementation(() => {});
  console.log = jest.spyOn(console, 'log').mockImplementation(() => {});
};

exports.restoreConsoleMock = function() {
  console.log.mockRestore();
  console.debug.mockRestore();
  console.error.mockRestore();
};
