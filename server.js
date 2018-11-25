const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const moment = require('moment');

var app = express();

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});
hbs.registerHelper('screamIt', (text) => {
    return text.toUpperCase();
});

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use( (req, res, next) => {
    var now = new Date().toString();
    var log = `${now}: ${req.method} ${req.url}`;

    console.log(log);
    fs.appendFile(`server-${moment().format('MM-DD-YYYY')}.log`, log + '\n', (err) => {
        if (err) {
            console.log(`server-${moment().format('MM-DD-YYYY')}.log`);
        };
    });
    next();
})


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
        pageTitle: 'About Page',
    });
});

app.get('/bad', (req, res) => {
    res.send({
        errorMessage: 'Something bad happened.'
    });
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
