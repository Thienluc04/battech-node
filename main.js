const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const authRouter = require('./router/auth');
const postRouter = require('./router/post');
const topicRouter = require('./router/topic');
const authorRouter = require('./router/author');
const tagRouter = require('./router/tag');
const passRouter = require('./router/nodemailer');

mongoose
  .connect(
    'mongodb+srv://Thienluc:thienluc123@clusterbattech.mx0edn2.mongodb.net/battech-db'
  )
  .then(() => console.log('Connected!'));

app.use(
  cors({
    methods: 'GET, POST, PUT, DELETE',
    origin: '*',
  })
);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/topics', topicRouter);
app.use('/api/authors', authorRouter);
app.use('/api/tags', tagRouter);
app.use('/pass', passRouter);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
