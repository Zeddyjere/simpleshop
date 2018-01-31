var express = require("express");
var json2csv = require('json2csv');
var csv = require("fast-csv");
var fileUpload = require("express-fileupload");
var mongoose = require("mongoose");
var router = express.Router();
var CShop = require("../models/customshop.js");
var Inventory = require("../models/inventory.js"); 
var User = require("../models/user");
var middleware = require("../middleware/index.js");

// Routes 

// Adding a custom shop
router.post("/cshops", middleware.isLoggedIn, function(req, res) {
	User.findById(req.user._id, function(err, foundUser) {
		if(err) {
			console.log(err)
		} else {
			// Create the custom shop
			CShop.create(req.body.cshop, function(err, createdCShop) {
				if(err) {
					console.log(err)
				} else {
					createdCShop.save();
					foundUser.cshopsowned.push(createdCShop);
					foundUser.save();
					console.log(createdCShop);
					// Redirect to where you want after creating
					res.redirect("/shops");
				}
			})
		}
	})
})

router.get("/cshops/:id", middleware.isLoggedIn, function(req, res) {
	CShop.findById(req.params.id)
		.populate({ path: "bikes", model: "Bike", populate: { path: "spareparts", model: "Sparepart", populate: { path: "profitandloss", model: "Profitloss" } } })
		.exec(function(err, foundCShop) {
			if(err) {
				console.log(err)
			} else {
				res.render("viewcshop", { cshop: foundCShop } );
			}
	})
})

router.put("/cshops/:id", middleware.isLoggedIn, function(req, res) {
	CShop.findByIdAndUpdate(req.params.id, req.body.cshop, function(err, updateCShop) {
		if(err) {
			console.log(err)
		} else {
			res.redirect("/cshops/" + req.params.id);
		}
	})
})

router.delete("/cshops/:id", function(req, res) {
	CShop.findByIdAndRemove(req.params.id, function(err) {
		if(err) {
			console.log(err)
		} else {
			res.redirect("/shops")
		}
	})
})


module.exports = router;