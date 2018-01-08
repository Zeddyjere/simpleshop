var express = require("express");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("../models/user");
var middleware = require("../middleware/index.js");
var Shop = require("../models/shop.js");

// This is the staff register route
router.post("/shops/:id/registerstaff", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id, function(err, foundShop) {
		if(err) {
			console.log(err)
		} else {
			// Register the Staff
			var newUser = new User({
				username: req.body.username,
				firstname: req.body.firstname,
				lastname: req.body.lastname,
				typeaccount: "staff",
				emailaddress: req.body.email
			});
			User.register(newUser, req.body.password, function(err, createdUser) {
				if(err) {
					console.log(err);
					req.flash("error", "A user with the given username is already registered on Simple shop!");
					res.redirect("/shops/" + req.params.id);
				} else {
					// save the created User first and push the found shop to the shops they can access
					createdUser.shopsowned.push(foundShop);
					createdUser.save();
					foundShop.staffmembers.push(createdUser);
					foundShop.save();
					// Now redirect the creator to shops page
					req.flash("success", "You have successfully added a new staff member to this shop.");
					res.redirect("/shops/" + req.params.id);
				}
			})
		}
	})
})

router.delete("/shops/:id/registerstaff/:staffid", function(req, res) {
	Shop.findById(req.params.id, function(err, foundShop) {
		if(err) {
			console.log(err)
			console.log("The shop could not be found")
		} else {
			// Delete from user Schema
			User.findByIdAndRemove(req.params.staffid, function(err) {
				if(err) {
					console.log(err)
				} else {
					// Remove from the Shops Staff members
					var index = foundShop.staffmembers.indexOf(req.params.staffid);
					foundShop.staffmembers.splice(index, 1);
					foundShop.save();
					// redirect to shop
					res.redirect("/shops/" + req.params.id);
				}
			})
		}
	})
})

module.exports = router;