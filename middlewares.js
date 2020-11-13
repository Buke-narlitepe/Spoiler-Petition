// make sure user is actually logged in
module.exports.loggedInCheck = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("/login");
    } else {
        next();
    }
};

module.exports.loggedOutCheck = (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/");
    } else {
        next();
    }
};

// THIS WILL PREVENT US FROM CLICKJACKING
module.exports.preventClickJacking = (req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
};

// So we can access it from handlebars templates
module.exports.addCsrfTokenToLocals = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();

    next();
};

// So we can access it from handlebars templates
module.exports.addSessionToLocals = (req, res, next) => {
    res.locals.session = req.session;
    next();
};
