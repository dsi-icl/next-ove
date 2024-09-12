const glob = require('glob');
const path = require('path');
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');

const docs = glob.globSync(path.join(__dirname, 'api', '*')).map(dir => ({
  header: dir.split('/').at(-1),
  files: glob.globSync(path.join(dir, '*')).map(x => ({
    href: `/${x.split('/').slice(-3).join('/').replace('api', 'open-api')}`,
    label: x.split('/').at(-1).split('.').at(0)
  }))
}));

const specs = glob.globSync(path.join(__dirname, 'specs', '*')).map(spec => ({
  href: `/${spec.split('/').slice(-2).join('/')}`,
  label: spec.split('/').at(-1).split('_').at(0)
}));

const coverage = glob.globSync(path.join(__dirname, 'coverage', '*')).map(dir => ({
  header: dir.split('/').at(-1),
  files: glob.globSync(path.join(dir, '*')).map(x => ({
    href: `/${x.split('/').slice(-3).join('/')}`,
    label: x.split('/').at(-1)
  }))
}));

const apis = docs.map(({header, files}) => ({
  header,
  files: files.map(({label}) => ({
    href: `/api-docs/?urls.primaryName=${encodeURIComponent(`${header}/${label}`)}`,
    label
  }))
}));

const swaggerUrls = docs.flatMap(({ header, files }) => files
  .map(({ href, label }) => ({
    url: href,
    name: `${header}/${label}`
  })));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(undefined, {swaggerUrls}));

app.get('/api/apis', (_req, res) => res.send(apis));
app.get('/api/specs', (_req, res) => res.send(specs));
app.get('/api/coverage', (_req, res) => res.send(coverage));

app.use('/open-api', express.static(path.join(__dirname, 'api')));
app.use('/specs', express.static(path.join(__dirname, 'specs')));
app.use('/code', express.static(path.join(__dirname, 'code')));
app.use('/types', express.static(path.join(__dirname, 'types')));
app.use('/coverage', express.static(path.join(__dirname, 'coverage')));

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(process.argv.at(2) ?? 8080, () => console.log(`Docs server listening on port ${process.argv.at(2) ?? 8080}`));
