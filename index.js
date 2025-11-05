require('dotenv').config();
hostname = process.env.HOSTNAME
port = process.env.PORT

//import the necessary modules
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const handlebars_helper = require(`./views/hbs-helper.js`);
const routes = require('./routes/routes.js');
const mongoose = require('mongoose');
const db = require('./models/db.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();

//parse incoming requests with urlencoded payloads
app.use(express.urlencoded({ extended: false }));
//parse incoming json payload
app.use(express.json());
//set the file path containing the static assets
app.use(express.static(path.join(__dirname, 'public')));
//set the session middleware
app.use(
    session({
        secret: 'balai-yllana',
        resave: 'false',
        saveUninitialized: 'false',
        store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    })
);
//set hbs as the view engine
app.set('view engine', 'hbs');
//set the file path containing the hbs files
app.set('views', path.join(__dirname, 'views'));
//check if current user has logged in
app.use('/', (req, res, next) => {
    if (
        req.session.loggedIn ||
        req.path === '/login' ||
        req.path === '/authenticate'
    ) {
        next();
    } else {
        res.redirect('/login');
    }
});

app.use('/admin', (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect('/event-tracker/home');
    }
});

//set the file path of the paths defined in './routes/routes.js'
app.use('/', routes);
//set the file path containing the partial hbs files
hbs.registerPartials(path.join(__dirname, 'views/partials'));

//connect to the database
db.connect();

//bind the server to a port and a host
app.listen(port, function () {
    console.log('Server is running at: ');
    console.log('http://' + hostname + ':' + port);
});

module.exports = app;