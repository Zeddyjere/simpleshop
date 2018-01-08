var express = require("express");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("../models/user");
var Notification = require("../models/notifications");
var Shop = require("../models/shop");
var middleware = require("../middleware/index.js");

router.get("/", function(req, res) {
	res.redirect("register");
})

router.get("/dashboard", middleware.isLoggedIn, function(req, res) {
	User.findById(req.user._id).populate("shopsowned").exec(function(err, foundUser){
		if(err) {
			console.log(err)
		} else {
			res.render("dashboard", {user: foundUser, successmessage: req.flash("success")});
		}
	})
})

router.get("/help", middleware.isLoggedIn, function(req, res) {
	res.render("help");
})

router.get("/notifications", middleware.isLoggedIn, function(req, res) {
	User.findById(req.user._id).populate("notifications").exec(function(err, foundUser) {
		if(err) {
			console.log(err)
		} else {
			res.render("notifications", { user: foundUser });
		}
	})
})

router.put("/notifications/:id", middleware.isLoggedIn, function(req, res) {
	Notification.findByIdAndUpdate(req.params.id, req.body.notification, function(err, updatedNotification) {
		if(err) {
			console.log(err)
		} else {
			res.redirect("/notifications")
		}
	})
})

router.get("/account", middleware.isLoggedIn, function(req, res) {
	User.findById(req.user._id).populate("shopsowned").exec(function(err, foundUser) {
		if(err) {
			console.log(err)
		} else {
			res.render("account", { user: foundUser } )
		}
	})	
})

router.get("/account/:id", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id).populate("staffmembers").exec(function(err, foundShop) {
		if(err) {
			console.log(err)
		} else {
			res.render("manageaccount", { shop: foundShop } )
		}
	})
})

router.put("/account/:id/statusupdate", middleware.isLoggedIn, function(req, res) {
	Shop.findByIdAndUpdate(req.params.id, req.body.shop, function(err, updatedShop) {
		if(err) {
			console.log(err)
		} else {
			res.redirect("/shops")
		}
	})
})

// AUTH
router.get("/register", function(req, res) {
	res.render("register", {errormessage: req.flash("error")});
})

router.post("/register", function(req, res) {
	var newUser = new User({
		username: req.body.username,
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		typeaccount: "Administrator",
		emailaddress: req.body.email
	});
	User.register(newUser, req.body.password, function(err, createdUser) {
		if(err) {
			req.flash("error", err.message);
			return res.redirect("/register");
		} 
		passport.authenticate("local")(req, res, function() {
			req.flash("success", "You have successfully joined simple shop. Look around and get started.");
            res.redirect("/dashboard");
        });
	})
})

router.get("/login", function(req, res) {
	res.render("login", {errormessage: req.flash("error"), successmessage: req.flash("success")});
})

router.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true
}) ,function(req, res) {
});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "You were logged out successfully.")
    res.redirect("/login");
});


module.exports = router;