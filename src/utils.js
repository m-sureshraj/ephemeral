exports.waitForElement = function(selector) {
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(findElement);
    observer.observe(document, { subtree: true, childList: true });

    const onTimeout = () => {
      observer.disconnect();
      reject('Timed out while waiting for the element');
    };

    const timeoutRef = setTimeout(onTimeout, 8000);

    function findElement(mutations, observer) {
      const ele = document.querySelector(selector);

      if (ele) {
        observer.disconnect();
        clearTimeout(timeoutRef);
        resolve(ele);
      }
    }
  });
};

exports.ping = async function(host) {
  const res = await fetch(host);

  return res.status === 200;
};
