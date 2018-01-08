var express = require("express");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("../models/user");
var Shop = require("../models/shop")
var middleware = require("../middleware/index.js");

// Stats and trends Routes
router.get("/stats", middleware.isLoggedIn, function(req, res) {
	User.findById(req.user._id)
	.populate("shopsowned")
	.exec(function(err, foundUser) {
		if(err) {
			console.log(err)
		} else {
			res.render("trends", { user: foundUser });
		}
	})
})

router.get("/stats/:id", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id)
	.populate({ path: "shopinventory", model: "Inventory", populate: { path: "profitandloss", model: "Profitloss" } })
	.exec(function(err, foundShop) {
		if(err) {
			console.log(err)
		} else {
			res.render("shopstats", { shop: foundShop })
		}
	})
})

module.exports = router