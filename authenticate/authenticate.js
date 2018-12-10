const authenticate = (req, res, next) => {
    if (!req.cookies.auth) {
        res.redirect('/todo/login');
        return;
    };

    next();
};

module.exports = {
    authenticate
};