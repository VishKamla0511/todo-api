const express = require('express');
// const bodyparser = require('body-parser');
const cors =  require('cors')
const app = express();

app.use(express.json());

app.use(cors());

const user = require('./api/user');
const task = require('./api/task')

app.use('/user',user);
app.use('/task', task);

app.listen(3001, console.log('server started'));

