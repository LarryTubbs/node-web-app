const express = require('express');

var app = express();

app.use(express.static(__dirname + '/public'));

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

app.get('/about', (req, res) => {
    res.send('About page.')
});

app.get('/bad', (req, res) => {
    res.send({
        errorMessage: 'Something bad happened.'
    });
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
