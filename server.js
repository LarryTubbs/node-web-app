const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const moment = require('moment');
var bodyParser = require('body-parser')

const w = require('./weather');

// environment setup
const port = process.env.PORT || 3000;

var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});
hbs.registerHelper('screamIt', (text) => {
    return text.toUpperCase();
});

// middleware
app.set('view engine', 'hbs');
app.use( (req, res, next) => {
    var now = new Date().toString();
    var log = `${now}: ${req.method} ${req.url}`;

    console.log(log);
    next();
});
// app.use( (req, res, next) => {
//     res.render('maint.hbs');
// });
app.use(express.static(__dirname + '/public'));

// routes
app.get('/likes', (req, res) => {
    res.send({
        name: 'Larry Tubbs',
        likes: [
            'Reading',
            'Node.js',
            'Theater'
        ]
    });
});

app.get('/', (req, res) => {
    res.render('home.hbs', {
        pageTitle: 'Home Page',
        welcomeMessage: 'Welcome to My Website'
    });
});


app.get('/about', (req, res) => {
    res.render('about.hbs', {
        pageTitle: 'About Page'
    });
});

app.get('/projects', (req, res) => {
    res.render('projects.hbs', {
        pageTitle: 'Projects Page'
    });
});

app.get('/weather', (req, res) => {
    res.render('weather.hbs', {
        pageTitle: 'Weather Lookup'
    });
});

app.post('/weather', (req, res) => {
    var weather = w.getWeather(req.body.address).then( (weatherInfo) => {
        res.render('weather.hbs', {
            pageTitle: 'Weather Lookup',
            weatherInfo: weatherInfo
        });
    }).catch((errorMessage) => {
        res.render('weather.hbs', {
            pageTitle: 'Weather Lookup',
            errorMessage: errorMessage
        });
    });   
});



app.get('/bad', (req, res) => {
    res.send({
        errorMessage: 'Something bad happened.'
    });
});

// startup the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
