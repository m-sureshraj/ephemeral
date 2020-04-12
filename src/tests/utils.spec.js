const { waitForElement, ping } = require('../utils');

describe('ping', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  const host = 'https://github.com';

  it('should thrown an error if the network request fails', async () => {
    fetch.mockRejectOnce(new Error('fake error message'));

    await expect(ping(host)).rejects.toThrow('fake error message');
  });

  it('should return true if the provided host is reachable', async () => {
    fetch.mockResponseOnce();

    const isHostReachable = await ping(host);

    expect(isHostReachable).toBe(true);
    expect(fetch.mock.calls[0][0]).toEqual(host);
  });

  it('should return false if the provided host is unreachable', async () => {
    fetch.mockResponseOnce({}, { status: 404 });

    const isHostReachable = await ping(host);

    expect(isHostReachable).toBe(false);
  });
});

describe('waitForElement', () => {
  const selector = '#foo';

  it('should wait and find the target element once it is available', async () => {
    const span = document.createElement('span');
    span.id = 'foo';

    setTimeout(() => {
      // To trigger the mutation observer we are adding a new element to the body
      document.body.appendChild(span);
    });
    const element = await waitForElement(selector);

    expect(element).toEqual(span);

    // reset
    document.body.removeChild(span);
  });

  it('should throw an error if timed out while waiting for the element', async () => {
    jest.useFakeTimers();

    const promise = waitForElement(selector);
    jest.runAllTimers();

    await expect(promise).rejects.toMatch('Timed out while waiting for the element');

    jest.clearAllTimers();
  });
});
