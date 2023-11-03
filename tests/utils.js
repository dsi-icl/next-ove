export function validateTRPC(res, client) {
  client.assert(typeof res === 'object', 'Response is not an object');
  client.assert('result' in res, 'Missing result key from response');
  client.assert('data' in res.result, 'Missing data key from response');
  return res.result.data;
}

export function validateStatus(status, response, client) {
  client.test('Request executed successfully', () => {
    client.assert(response.status === status, `Unexpected response status: ${response.status}`);
  });
}

export function validateContentType(contentType, response, client) {
  client.test(`Response content-type is ${contentType}`, () => {
    const type = response.contentType.mimeType;
    client.assert(type === contentType, `Expected '${contentType}' but received ${type}`);
  });
}

export function validateKeys(keys, response, client, isTRPC) {
  client.test(`Response contains necessary keys`, () => {
    const res = isTRPC ? validateTRPC(response.body, client) : response.body;
    keys.forEach(k => {
      client.assert(k in res, `'${k}' missing from response`);
    });
  });
}

export function validateResponseType(type, response, client, isTRPC) {
  client.test("Response is valid type", () => {
    const resType = typeof (isTRPC ? validateTRPC(response.body, client) : response.body);
    client.assert(resType === type, `Expected ${type}, received: ${resType}`);
  });
}

export function validateArray(response, client, isTRPC) {
  client.test("Response is an array", () => {
    const res = isTRPC ? validateTRPC(response.body, client) : response.body;
    client.assert(Array.isArray(res), "Response is not an array");
  });
}