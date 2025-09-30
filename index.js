require('dotenv').config();
hostname = process.env.HOSTNAME
port = process.env.PORT

const path = require('path');
const express = require('express');
const hbs = require('hbs');
var handlebars_helper; //in the future, require(`./views hbs helper.js`) or something
const routes = require('./routes/routes.js'); //same as abpve
const mongoose = require('mongoose');
const db = require('./models/db.js'); //same here; !! change to const
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();


// Middleware setup

// Parse incoming requests with urlencoded payloads
app.use(express.urlencoded({ extended: false }));
// Parse incoming json payload
app.use(express.json());
// Set the file path containing the static assets
app.use(express.static(path.join(__dirname, 'public')));

// Set the session middleware
app.use(
    session({
        secret: 'Six Seven',
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({mongoUrl: process.env.DB_URL}),
    })
);

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