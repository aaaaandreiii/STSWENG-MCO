require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('hbs');

const app = express();
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

hbs.registerPartials(path.join(__dirname, 'views/partials'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/home', (req, res) => {
         res.render('home', {
             events: [
                 { id: 1, title: "Sample Event 1", description: "test event." },
                 { id: 2, title: "Sample Event 2", description: "test even2." }
             ]
         });
     });
// default = login
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.listen(port, () => {
    console.log(`Frontend server running at http://${hostname}:${port}`);
});