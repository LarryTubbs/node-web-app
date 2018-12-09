const authenticate = (req, res, next) => {
    if (!req.cookies.auth) {
        res.redirect('/todo/login');
        return Promise.reject();
    };

    next();
};

module.exports = {
    authenticate
};