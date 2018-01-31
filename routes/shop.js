var express = require("express");
var json2csv = require('json2csv');
var csv = require("fast-csv");
var fileUpload = require("express-fileupload");
var mongoose = require("mongoose");
var router = express.Router();
var Shop = require("../models/shop.js");
var Inventory = require("../models/inventory.js"); 
var User = require("../models/user");
var middleware = require("../middleware/index.js");


// Creating single shops
router.get("/shops", middleware.isLoggedIn, function(req, res) {
	User.findById(req.user._id).populate("shopsowned").populate("cshopsowned").exec(function(err, foundUser) {
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

// Creating multiple shops at once
router.get("/uploadshops", middleware.isLoggedIn, function(req, res) {
	User.findById(req.user._id, function(err, foundUser) {
		if(err) {
			console.log(err)
		} else {
			res.render("uploadshops", { user: foundUser });
		}
	})
})

router.get("/uploadshops/template", middleware.isLoggedIn, function(req, res) {
	var fields = [
        'shopname',
        'shopowner',
        'shopownerid',
        'shoptype',
        'active'
    ];
 
    var csv = json2csv({ data: '', fields: fields });
 
    res.set("Content-Disposition", "attachment;filename=shops.csv");
    res.set("Content-Type", "application/octet-stream");
 
    res.send(csv);
})

router.post("/uploadshops", function(req, res) {

	if (!req.files)
        return res.status(400).send('No files were uploaded.');
     
    var shopFile = req.files.file;
 
    var shops = [];
         
    csv
     .fromString(shopFile.data.toString(), {
         headers: true,
         ignoreEmpty: true
     })
     .on("data", function(data){
         data['_id'] = new mongoose.Types.ObjectId();
          
         shops.push(data);
     })
     .on("end", function(){

     	User.findById(req.user._id, function(err, foundUser) {
			if(err) {
				console.log(err)
			} else {
				// Create the shop here
				Shop.create(shops, function(err, shops) {
					if(err) {
						console.log(err)
					} else {

						foundUser.shopsowned.push.apply(foundUser.shopsowned, shops);
						foundUser.save();
						
						res.send(shops.length + ' shops have been successfully uploaded.');
					}
				})
			}
		})
          
         
     });

})

module.exports = router;