import express from 'express';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.text());

app.all('*', (req, res) => {
  console.log(`${req.method} ${req.path}`);
  console.log(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});