const glob = require('glob');
const path = require('path');
const express = require('express');
const { components } = require('../components');
const { contentRoot } = require('../app');

const router = express.Router();

const specs = components.specs ? glob.globSync(path.join(contentRoot, 'specs', '*')).map(spec => ({
  href: `/${spec.replace('specs', 'specs/static').split('/').slice(-3).join('/')}`,
  label: spec.split('/').at(-1).split('_').at(0)
})) : [];

router.get('/available', (_req, res) => res.send(specs));
router.use('/static', express.static(path.join(contentRoot, 'specs')));

module.exports = router;
