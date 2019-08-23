let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let mongoose = require('mongoose');
let cors = require('cors');

let indexRouter = require('./routes/index');
let apiRouter = require('./routes/api');
let usersRouter = require('./routes/users');

let app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/wms', {useNewUrlParser: true})
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/users', usersRouter);

module.exports = app;
