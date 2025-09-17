require('dotenv').config();
hostname = process.env.HOSTNAME
port = process.env.PORT

const path = require('path');
const express = require('express');
const hbs = require('hbs');
var handlebars_helper; //in the future, require(`./views hbs helper.js`) or something
var routes;            //same as abpve
const mongoose = require('mongoose');
var db;                //same here; !! change to const
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();


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