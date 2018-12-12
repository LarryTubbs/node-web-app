const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const moment = require('moment');
const axios = require('axios');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

const {authenticate} = require('./authenticate/authenticate.js');
const w = require('./weather');

// environment setup
const port = process.env.PORT || 3000;
const API_URL = process.env.API_URL || 'https://quiet-falls-97689.herokuapp.com';

var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
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

// add todo routes
app.get('/todo/home', authenticate, (req, res) => {
    // call get todos and render
    axios.get(API_URL+'/todos')
    .then((response) => {
        var todos;
        if (!req.cookies.SHOW_COMPLETED) {
            
            todos = response.data.todos.filter((todo) => {
                return todo.completed === false;
            });
        } else {
            todos = response.data.todos;
        };

        res.render('todo/home.hbs', {
            pageTitle: 'Todos',
            todos: todos
        });
    }).catch((e) => {
        res.render('todo/home.hbs', {
            pageTitle: 'Todos',
            errorMessage: e.message
        });
    });
});

app.post('/todo/add', authenticate, (req, res) => {
    var completed = false;
    if (req.body.completed) {
        completed = true;
    };

    axios.post(API_URL+'/todos', {
            text: req.body.todoText,
            completed: completed
        })
    .then((response) => {
        res.redirect('/todo/home');
    }).catch((e) => {
        res.render('todo/home.hbs', {
            pageTitle: 'Todos',
            errorMessage: e.message
        });
    });
});

app.post('/todo/update/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var completed = false;
    if (req.body.completed) {
        completed = true;
    };

    axios.patch(API_URL+'/todos/'+id, {
            text: req.body.todoText,
            completed: completed
        })
    .then((response) => {
        res.redirect('/todo/home');
    }).catch((e) => {
        res.render('todo/home.hbs', {
            pageTitle: 'Todos',
            errorMessage: e.message
        });
    });
});

app.post('/todo/delete/:id', authenticate, (req, res) => {
    var id = req.params.id;

    axios.delete(API_URL+'/todos/'+id)
    .then((response) => {
        res.redirect('/todo/home');
    }).catch((e) => {
        res.render('todo/home.hbs', {
            pageTitle: 'Todos',
            errorMessage: e.message
        });
    });
});

app.get('/todo/logout', authenticate, (req, res) => {
    axios.delete(API_URL+'/users/me/token')
    .then((response) => {
        res.clearCookie('auth');
        axios.defaults.headers.common['x-auth'] = "";
        res.render('todo/logout.hbs', {
            pageTitle: 'You have been successfully logged out.'
        });
    }).catch((e) => {
        console.log(e.message);
        res.clearCookie('auth');
        axios.defaults.headers.common['x-auth'] = "";
        res.render('todo/logout.hbs', {
            pageTitle: 'You have been successfully logged out.'
        });
    });
});

app.get('/todo/login', (req, res) => {
    res.render('todo/login.hbs', {
        pageTitle: "Login"
    })
});

app.post('/todo/login', (req, res) => {
    axios.post(API_URL+'/users/login', {
        email: req.body.email,
        password: req.body.password
    }).then((response) => {
        var token = response.headers['x-auth'];
        res.cookie('auth', token, {httpOnly: true});
        axios.defaults.headers.common['x-auth'] = token;
        res.redirect('/todo/home');
    }).catch((e) => {
        res.render('todo/login.hbs', {
            pageTitle: 'Login',
            errorMessage: e.message
        });
    });
});

app.get('/todo/register', (req, res) => {
    res.render('todo/register.hbs', {
        pageTitle: 'Register'
    });
});

app.post('/todo/register', (req, res) => {
    if (req.body.password === req.body.passwordAgain) {
        // register the user
        axios.post(API_URL+'/users', {
            email: req.body.email,
            password: req.body.password
        }).then((response) => {
            var token = response.headers['x-auth'];
            res.cookie('auth', token, {httpOnly: true});
            axios.defaults.headers.common['x-auth'] = token;
            res.redirect('/todo/home');
        }).catch((e) => {
            res.render('todo/register.hbs', {
                pageTitle: 'Register',
                errorMessage: e.message
            });
        });
    } else {
        res.render('todo/register.hbs', {
            pageTitle: 'Register',
            errorMessage: 'Passwords do not match!  Please try again.'
        });
    };
});

// startup the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
