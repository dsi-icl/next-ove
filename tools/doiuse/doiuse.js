const Doiuse = require('doiuse/stream');
const execSync = require('child_process').execSync;
const fs = require('fs');

const files = execSync('find ./dist -print | egrep \'\\.css$|\\.scss$\'').toString().split('\n').filter(x => x !== '');
const usageInfos = {};

Promise.all(files.map(file => new Promise((resolve, reject) => {
  const executor = new Doiuse({
    browsers: [
      'last 2 Chrome versions',
      'last 2 Firefox versions',
      'last 2 Edge versions',
      'last 2 Safari versions',
    ]
  });

  fs
    .createReadStream(file)
    .pipe(/** @type {NodeJS.WritableStream} */executor)
    .on('data', info => {
      if (Object.keys(usageInfos).includes(info.feature)) return;
      usageInfos[info.feature] = info.message.slice(info.message.indexOf(": ") + 2);
    })
    .on('end', () => resolve())
    .on('error', () => reject());
}))).then(() => fs.writeFileSync(process.argv[2], JSON.stringify(usageInfos, undefined, 2))).catch(console.error);
