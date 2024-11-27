const prompt = require('prompt');
const fs = require('fs');

const generateGeometry = ({ screens, displayCoefficient, columns, displayPrefix, rendererPrefix, zeroIndex }) => {
  const displays = [];
  screens = parseInt(screens);
  displayCoefficient = parseInt(displayCoefficient);
  columns = parseInt(columns);

  /** @type{(x: number) => number} */
  const zi = x => zeroIndex ? x : x + 1;

  for (let i = 0; i < screens; i++) {
    displays.push({
      displayId: `${displayPrefix}${zi(i)}`,
      renderer: {
        deviceId: `${rendererPrefix}${zi(i % Math.floor(screens / displayCoefficient))}`,
        displayId: zi(Math.floor(i / columns) % displayCoefficient).toString(10)
      },
      row: zi(Math.floor(i / columns)),
      column: zi(i % columns)
    });
  }

  return displays;
};

const getDetails = () => {
  prompt.start();
  prompt.message = 'Enter geometry specification:\n';
  prompt.delimiter = '';
  return prompt.get({
    properties: {
      screens: {
        message: 'screens:',
        required: true
      },
      columns: {
        message: 'columns:',
        required: true
      },
      displayCoefficient: {
        message: 'displays per node:',
        required: true
      },
      displayPrefix: {
        message: 'optional display prefix:',
        required: false,
        default: ""
      },
      rendererPrefix: {
        message: 'optional renderer prefix:',
        required: false,
        default: ""
      },
      zeroIndex: {
        message: 'optional zero indexing:',
        default: false,
        type: 'boolean'
      },
      filename: {
        message: 'optional output file:',
        required: false
      }
    }
  });
};

getDetails().then(details => {
  const displays = generateGeometry(details);

  if (details.filename === undefined || details.filename === null || details.filename === "") {
    console.log(JSON.stringify(displays, undefined, 2));
  } else {
    fs.writeFileSync(details.filename, JSON.stringify(displays, null, 2));
  }
}).catch(console.error);