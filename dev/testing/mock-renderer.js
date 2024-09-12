const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const port = 9081;
const state = { sectionCounter: 0, sections: {} };

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.delete('/sections/:sectionId', (req, res) => {
  console.log(req.params.sectionId);
  delete state.sections[req.params.sectionId];
  res.sendStatus(200);
});

app.post('/section', (req, res) => {
  console.log('Posting section:', JSON.stringify(req.body));
  state.sections[state.sectionCounter] = { id: state.sectionCounter, ...req.body };
  res.json({ id: state.sectionCounter++ });
});

app.get('/sections', (req, res) => {
  console.log('Getting sections:', JSON.stringify(state.sections));
  res.json(Object.values(state.sections));
});

app.delete('sections', (req, res) => {
  console.log('Clearing sections');
  state.sections = {};
  res.sendStatus(200);
});

app.get('/spaces/:observatory/geometry', (req, res) => {
  console.log(req.params.observatory);
  res.json({ w: 30720, h: 4320 });
});

app.listen(port, () => {
  console.log(`Mock renderer listening on port ${port}`);
});