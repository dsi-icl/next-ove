import prompt from "prompt";
import fs from "node:fs";

type Details = {
  screens: string;
  displayCoefficient: string;
  columns: string;
  displayPrefix: string;
  rendererPrefix: string;
  filename?: string;
  zeroIndex: boolean;
}

const generateGeometry = (details: Details) => {
  const displays = [];
  const screens = parseInt(details.screens);
  const displayCoefficient = parseInt(details.displayCoefficient);
  const columns = parseInt(details.columns);

  const zi = (x: number) => details.zeroIndex ? x : x + 1;

  for (let i = 0; i < screens; i++) {
    displays.push({
      displayId: `${details.displayPrefix}${zi(i)}`,
      renderer: {
        deviceId: `${details.rendererPrefix}${zi(i % Math.floor(screens / displayCoefficient))}`,
        displayId: zi(Math.floor(i / columns) % displayCoefficient).toString(10)
      },
      row: zi(Math.floor(i / columns)),
      column: zi(i % columns)
    });
  }

  return displays;
};

const getDetails = (): Promise<Details> => {
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
  }) as unknown as Promise<Details>;
};

getDetails().then(details => {
  const displays = generateGeometry(details);

  if (details.filename === undefined || details.filename === null || details.filename === "") {
    console.log(JSON.stringify(displays, undefined, 2));
  } else {
    fs.writeFileSync(details.filename, JSON.stringify(displays, null, 2));
  }
}).catch(console.error);