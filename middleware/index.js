// All the middleware goes in here
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Log in First!");
    res.redirect("/login");
};

module.exports = middlewareObj;