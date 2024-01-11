/** @type {(log: ReturnType<typeof jest.fn>) =>
 *  {time: number, instantiations: number}}
 */
import {readFileSync, writeFileSync} from 'atomically';
import fs from 'fs';

global.formatOutput = log => {
  const results = log
    .mock
    .calls
    .map(x => x[0])
    .filter(o => o.includes('Result: '))
    .map(o => o.match(/Result: ([\d|.]+)/)[1]);
  return {
    time: parseFloat(results[0]),
    instantiations: parseInt(results[1])
  };
};

global.init = () => {
  console.log = jest.fn();
  console.group = jest.fn();
  console.error = jest.fn();
};

const exists = (path) => {
  try {
    fs.statSync(path);
    return true;
  } catch (e) {
    return false;
  }
};

global.readFile = () => {
  const filePath = './benchmarks.json';
  const defaultAsset = JSON.stringify({});

  if (!exists(filePath) && defaultAsset !== null) {
    writeFileSync(filePath, defaultAsset);
  }

  return JSON.parse(readFileSync(filePath).toString());
};