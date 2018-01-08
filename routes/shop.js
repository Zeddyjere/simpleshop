var express = require("express");
var router = express.Router();
var Shop = require("../models/shop.js");
var Inventory = require("../models/inventory.js"); 
var User = require("../models/user");
var middleware = require("../middleware/index.js");

router.get("/shops", middleware.isLoggedIn, function(req, res) {
	User.findById(req.user._id).populate("shopsowned").exec(function(err, foundUser) {
		if(err) {
			console.log(err)
		} else {
			res.render("shops", {user: foundUser})
		}
	})
})

router.get("/shops/:id", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id)
		.populate({ path: "shopinventory", model: "Inventory", populate: { path: "profitandloss", model: "Profitloss" } })
		.populate("staffmembers")
		.exec(function(err, foundShop) {
			if(err) {
				console.log(err)
			} else {
				console.log(foundShop);
				res.render("viewshop", { shop: foundShop, successmessage: req.flash("success"), errormessage: req.flash("error") })
			}
	})
})

router.post("/shops", middleware.isLoggedIn, function(req, res) {
	User.findById(req.user._id, function(err, foundUser) {
		if(err) {
			console.log(err)
		} else {
			// Create the shop here
			Shop.create(req.body.shop, function(err, createdShop) {
				if(err) {
					console.log(err)
				} else {
					createdShop.save();
					foundUser.shopsowned.push(createdShop);
					foundUser.save();
					console.log(createdShop);
					// Redirect to where you want after creating
					res.redirect("/shops");
				}
			})
		}
	})

})

router.put("/shops/:id", middleware.isLoggedIn, function(req, res) {
	Shop.findByIdAndUpdate(req.params.id, req.body.shop, function(err, updatedShop){
		if(err) {
			console.log(err)
		} else {
			res.redirect("/shops/" + req.params.id)
		}
	})
})

router.delete("/shops/:id", middleware.isLoggedIn, function(req, res) {
	Shop.findByIdAndRemove(req.params.id, function(err) {
		if(err) {
			console.log(err)
		} else {
			res.redirect("/shops")
		}
	})
})

module.exports = router;