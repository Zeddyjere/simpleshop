var express = require("express");
var router = express.Router();
var Shop = require("../models/shop.js");
var Inventory = require("../models/inventory.js"); 
var CShop = require("../models/customshop.js");
var middleware = require("../middleware/index.js");


router.get("/shops/:id/transactions", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id).populate("shoptransactions").exec(function(err, foundShop) {
		if(err) {
			console.log(err);
			console.log("The shop could not be found");
		} else {
			res.render("transactions", {shop: foundShop});
		}
	})
})

router.get("/cshops/:id/transactions", middleware.isLoggedIn, function(req, res) {
	CShop.findById(req.params.id).populate("shoptransactions").exec(function(err, foundCShop) {
		if(err) {
			console.log(err)
		} else {
			res.render("ctransactions", { cshop: foundCShop })
		}
	})
})

module.exports = router;