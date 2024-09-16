const path = require('path');
const express = require('express');
const { app, contentRoot } = require('./src/app');
const version = require(process.env.PACKAGE_VERSION_LOCATION ?? path.join(__dirname, '..', '..', 'package.json')).version;
const ApiRouter = require('./src/routers/api');
const SpecsRouter = require('./src/routers/specs');
const CoverageRouter = require('./src/routers/coverage');
const FeaturesRouter = require('./src/routers/features');
const PackagesRouter = require('./src/routers/packages');
const { components } = require('./src/components');

app.use('/api', ApiRouter);
app.use('/specs', SpecsRouter);
app.use('/coverage', CoverageRouter);
app.use('/features', FeaturesRouter);
app.use('/code', express.static(path.join(contentRoot, 'code')));
app.use('/types', express.static(path.join(contentRoot, 'types')));
app.use('/packages', PackagesRouter);
app.use('/compatibility/css/static', express.static(path.join(contentRoot, 'css')));

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/version', (_req, res) => res.send({ version }));
app.get('/components', (_req, res) => res.send(components));

app.listen(process.env.PORT ?? 8080, () => console.log(`Docs server listening on port ${process.env.PORT ?? 8080}`));
