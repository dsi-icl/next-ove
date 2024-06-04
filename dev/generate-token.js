const prompt = require('prompt');
const fetch = require("node-fetch");

const fixedEncodeURI = str =>
  encodeURI(str).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16));

/** @type { () => Promise<{username: string, password: string, host: string}> } */
const getDetails = () => {
  prompt.start();
  prompt.message = 'Enter Core URL, username and password:\n';
  prompt.delimiter = '';
  return prompt.get({
    properties: {
      host: {
        message: 'Core URL:',
        required: true
      },
      username: {
        message: 'username:',
        required: true
      },
      password: {
        message: 'password:',
        required: true,
        hidden: true
      },
    }
  });
};

const run = async () => {
  const {host, username, password} = await getDetails();
  const encoded = fixedEncodeURI(btoa(`${username}:${password}`));

  const token = await (await fetch(`${host}/login`, { headers: {Authorization: `Basic ${encoded}`}, method: "POST" })).json().access;
  console.log(token);
};

run().catch(console.error);
