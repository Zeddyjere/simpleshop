var express = require("express");
var json2csv = require('json2csv');
var csv = require("fast-csv");
var fileUpload = require("express-fileupload");
var mongoose = require("mongoose");
var router = express.Router();
var CShop = require("../models/customshop.js");
var Inventory = require("../models/inventory.js"); 
var User = require("../models/user.js");
var Bike = require("../models/bike.js");
var middleware = require("../middleware/index.js");

// The Routes

// Adding a single bike
router.post("/cshops/:id/bikes", middleware.isLoggedIn, function(req, res) {
	CShop.findById(req.params.id, function(err, foundCShop) {
		if(err) {
			console.log(err)
		} else {
			// Create the Bike
			Bike.create(req.body.bike, function(err, createdBike) {
				if(err) {
					console.log(err)
				} else {
					foundCShop.bikes.push(createdBike);
					foundCShop.save();
					// redirect
					res.redirect("/cshops/" + req.params.id);
				}
			})
		}
	})
})

router.get("/cshops/:id/bikes/:bikeid", middleware.isLoggedIn, function(req, res) {
	CShop.findById(req.params.id, function(err, foundCShop) {
		if(err) {
			console.log(err)
		} else {
			Bike.findById(req.params.bikeid).populate("spareparts").exec(function(err, foundBike) {
				if(err) {
					console.log(err)
				} else {
					res.render("viewbike", { bike: foundBike, cshop: foundCShop, successmessage: req.flash("success"), warningmessage: req.flash("warning") });
				}
			})
		}
	})
})

router.put("/cshops/:id/bikes/:bikeid", middleware.isLoggedIn, function(req, res) {
	Bike.findByIdAndUpdate(req.params.bikeid, req.body.bike, function(err, updatedBike) {
		if(err) {
			console.log(err)
		} else {
			res.redirect("/cshops/" + req.params.id + "/bikes/" + req.params.bikeid)
		}
	})
})

router.delete("/cshops/:id/bikes/:bikeid", middleware.isLoggedIn, function(req, res) {
	Bike.findByIdAndRemove(req.params.bikeid, function(err) {
		if(err) {
			console.log(err)
		} else {
			res.redirect("/cshops/" + req.params.id)
		}
	})
})

// Adding Multiple Bikes 
router.get("/cshops/:id/uploadbikes/template", middleware.isLoggedIn, function(req, res) {
	var fields = [
        'bikename',
        'bikemodel'
    ];
 
    var csv = json2csv({ data: '', fields: fields });
 
    res.set("Content-Disposition", "attachment;filename=bikes.csv");
    res.set("Content-Type", "application/octet-stream");
 
    res.send(csv);
})

router.post("/cshops/:id/uploadbikes", function(req, res) {

	if (!req.files)
        return res.status(400).send('No files were uploaded.');
     
    var bikeFile = req.files.file;
 
    var bikes = [];
         
    csv
     .fromString(bikeFile.data.toString(), {
         headers: true,
         ignoreEmpty: true
     })
     .on("data", function(data){
         data['_id'] = new mongoose.Types.ObjectId();
          
         bikes.push(data);
     })
     .on("end", function(){

     	CShop.findById(req.params.id, function(err, foundCShop) {
			if(err) {
				console.log(err)
			} else {
				// Create the bike here
				Bike.create(bikes, function(err, bikes) {
					if(err) {
						console.log(err)
					} else {
						foundCShop.bikes.push.apply(foundCShop.bikes, bikes);
						foundCShop.save();

						// redirect
						res.redirect("/cshops/" + req.params.id);
						
					}
				})
			}
		})
          
         
     });

})


module.exports = router;