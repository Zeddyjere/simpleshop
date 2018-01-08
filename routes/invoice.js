var express = require("express");
var router = express.Router();
var Shop = require("../models/shop.js");
var Inventory = require("../models/inventory.js"); 
var middleware = require("../middleware/index.js");
var User = require("../models/user");

router.get("/shops/:id/generateinvoice", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id).populate("shopinventory").exec(function(err, foundShop) {
		if(err) {
			console.log(err)
		} else {
			res.render("generateinvoice", { shop: foundShop });
		}
	})
})

module.exports = router;