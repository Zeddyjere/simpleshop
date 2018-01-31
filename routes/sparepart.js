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
var Profitloss = require("../models/profitandloss.js");
var Transaction = require("../models/transactions.js");
var Notification = require("../models/notifications.js");
var Sparepart = require("../models/sparepart.js");
var middleware = require("../middleware/index.js");

// The Routes

// Uploading a single sparepart
router.post("/cshops/:id/bikes/:bikeid/spareparts", middleware.isLoggedIn, function(req, res) {
	Bike.findById(req.params.bikeid, function(err, foundBike) {
		if(err) {
			console.log(err)
		} else {
			// create the sparepart
			Sparepart.create(req.body.sparepart, function(err, createdSparepart) {
				if(err) {
					console.log(err)
				} else {
					foundBike.spareparts.push(createdSparepart); 
					foundBike.save();
					
					// redirect
					res.redirect("/cshops/" + req.params.id + "/bikes/" + req.params.bikeid);
				}
			})
		}
	})
})

router.get("/cshops/:id/bikes/:bikeid/spareparts/:sparepartid/edit", middleware.isLoggedIn, function(req, res) {
    CShop.findById(req.params.id, function(err, foundCShop) {
        if(err) {
            console.log(err)
        } else {
            Bike.findById(req.params.bikeid, function(err, foundBike) {
                if(err) {
                    console.log(err)
                } else {
                    Sparepart.findById(req.params.sparepartid, function(err, foundSparepart) {
                        if(err) {
                            console.log(err) 
                        } else {
                            res.render("editpart", { cshop: foundCShop, bike: foundBike, sparepart: foundSparepart });
                        }
                    })
                }
            }) 
        }
    })
})

router.put("/cshops/:id/bikes/:bikeid/spareparts/:sparepartid/edit", middleware.isLoggedIn, function(req, res) {
    CShop.findById(req.params.id, function(err, foundCShop) {
        if(err) {
            console.log(err)
        } else {
            Sparepart.findByIdAndUpdate(req.params.sparepartid, req.body.sparepart, function(err, updatedSparepart) {
                if(err) {
                    console.log(err)
                } else {
                    User.findById(foundCShop.shopownerid, function(err, foundUser) {
                        if(err) {
                            console.log(err) 
                        } else {
                            // Create and Send notification to owner of the shop
                            var newNotification = new Notification({
                                body: req.body.theuser + " edited sparepart from " + foundCShop.shopname,
                                read: false
                            })
                            Notification.create(newNotification, function(err, createdNotification) {
                                if(err) {
                                    console.log(err)
                                } else {
                                    createdNotification.save();
                                    foundUser.notifications.push(createdNotification);
                                    foundUser.save();

                                    // Redirect
                                    res.redirect("/cshops/" + req.params.id + "/bikes/" + req.params.bikeid);
                                }
                            })
                        }
                    })  
                }
            })
        }
    })
})

router.delete("/cshops/:id/bikes/:bikeid/spareparts/:sparepartid/delete", middleware.isLoggedIn, function(req, res) {
    Sparepart.findByIdAndRemove(req.params.sparepartid, function(err) {
        if(err) {
            console.log(err)
        } else {
            res.redirect("/cshops/" + req.params.id + "/bikes/" + req.params.bikeid);
        }
    })
})

router.get("/cshops/:id/bikes/:bikeid/spareparts/:sparepartid/sellpart", middleware.isLoggedIn, function(req, res) {
    CShop.findById(req.params.id, function(err, foundCShop) {
        if(err) {
            console.log(err)
        } else {
            Bike.findById(req.params.bikeid, function(err, foundBike) {
                if(err) {
                    console.log(err)
                } else {
                    Sparepart.findById(req.params.sparepartid, function(err, foundSparepart) {
                        if(err) {
                            console.log(err)
                        } else {
                            res.render("sellpart", { cshop: foundCShop, bike: foundBike, sparepart: foundSparepart });
                        }
                    })
                }
            })
        } 
    })
})

router.put("/cshops/:id/bikes/:bikeid/spareparts/:sparepartid/sellpart", middleware.isLoggedIn, function(req, res) {
    Sparepart.findByIdAndUpdate(req.params.sparepartid, req.body.sparepart, function(err, leftSparepart) {
        if(err) {
            console.log(err)
        } else {
            var newProfitloss = new Profitloss({
                profitloss: req.body.profitloss
            });
            Profitloss.create(newProfitloss, function(err, createdProfitloss) {
                if(err) {
                    console.log(err)
                } else {
                    createdProfitloss.save();
                    leftSparepart.profitandloss.push(createdProfitloss);
                    leftSparepart.save();
                    // Redirect
                    CShop.findById(req.params.id, function(err, foundCShop) {
                        if(err) {
                            console.log(err)
                        } else {
                            foundCShop.profitloss.push(createdProfitloss);
                            foundCShop.save();
                            console.log(foundCShop)
                            // Create a Transaction 
                            var newTransaction = new Transaction({
                                customername: req.body.customername,
                                itemname: req.body.sparepart.partname,
                                quantity: req.body.itemquantity,
                                sellingprice: req.body.sparepart.unitsprice,
                                totalspent: req.body.sparepart.unitsprice * req.body.itemquantity
                            })
                            Transaction.create(newTransaction, function(err, createdTransaction) {
                                if(err) {
                                    console.log(err)
                                } else {
                                    // save transaction and push it to under shop found
                                    createdTransaction.save();
                                    foundCShop.shoptransactions.push(createdTransaction);
                                    foundCShop.save();

                                    // Find the owner of the shop
                                    User.findById(foundCShop.shopownerid, function(err, foundUser) {
                                        if(err) {
                                            console.log(err) 
                                        } else {
                                            // Create and Send notification to owner of the shop
                                            var newNotification = new Notification({
                                                body: req.body.theuser + " sold parts from " + foundCShop.shopname,
                                                read: false
                                            })
                                            Notification.create(newNotification, function(err, createdNotification) {
                                                if(err) {
                                                    console.log(err)
                                                } else {
                                                    createdNotification.save();
                                                    foundUser.notifications.push(createdNotification);
                                                    foundUser.save();

                                                    // Redirect
                                                    req.flash("success", "You successfully sold parts from your shop.");
                                                    res.redirect("/cshops/" + req.params.id + "/bikes/" + req.params.bikeid);
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

router.put("/cshops/:id/bikes/:bikeid/spareparts/:sparepartid/discardpart", middleware.isLoggedIn, function(req, res) {
    Sparepart.findByIdAndUpdate(req.params.sparepartid, req.body.sparepart, function(err, leftSparepart) {
        if(err) {
            console.log(err)
        } else {
            var newProfitloss = new Profitloss({
                profitloss: req.body.profitloss
            });
            Profitloss.create(newProfitloss, function(err, createdProfitloss) {
                if(err) {
                    console.log(err)
                } else {
                    createdProfitloss.save();
                    leftSparepart.profitandloss.push(createdProfitloss);
                    leftSparepart.save();
                    // Redirect
                    CShop.findById(req.params.id, function(err, foundCShop) {
                        if(err) {
                            console.log(err)
                        } else {
                            foundCShop.profitloss.push(createdProfitloss);
                            foundCShop.save();
                            // Create a Transaction 
                            var newTransaction = new Transaction({
                                customername: req.body.customername,
                                itemname: req.body.sparepart.partname,
                                quantity: req.body.itemquantity,
                                sellingprice: req.body.sparepart.unitsprice,
                                totalspent: req.body.totalspent
                            })
                            Transaction.create(newTransaction, function(err, createdTransaction) {
                                if(err) {
                                    console.log(err)
                                } else {
                                    // save transaction and push it to under shop found
                                    createdTransaction.save();
                                    foundCShop.shoptransactions.push(createdTransaction);
                                    foundCShop.save();

                                    User.findById(foundCShop.shopownerid, function(err, foundUser) {
                                        if(err) {
                                            console.log(err) 
                                        } else {
                                            // Create and Send notification to owner of the shop
                                            var newNotification = new Notification({
                                                body: req.body.theuser + " discarded parts from " + foundCShop.shopname,
                                                read: false
                                            })
                                            Notification.create(newNotification, function(err, createdNotification) {
                                                if(err) {
                                                    console.log(err)
                                                } else {
                                                    createdNotification.save();
                                                    foundUser.notifications.push(createdNotification);
                                                    foundUser.save();

                                                    // Redirect
                                                    req.flash("warning", "You discarded items from this shop.");
                                                    res.redirect("/cshops/" + req.params.id + "/bikes/" + req.params.bikeid);
                                                }
                                            })
                                        }
                                    })          
                                }
                            })
                        }
                    })
                }
            })

        }
    })
})

// Uploading multiple spareparts
router.get("/cshops/:id/bikes/:bikeid/uploadspareparts/template", middleware.isLoggedIn, function(req, res) {
	var fields = [
        'partname',
        'partnumber',
        'quantity',
        'unitbprice',
        'unitsprice'
    ];
 
    var csv = json2csv({ data: '', fields: fields });
 
    res.set("Content-Disposition", "attachment;filename=spareparts.csv");
    res.set("Content-Type", "application/octet-stream");
 
    res.send(csv);
})

router.post("/cshops/:id/bikes/:bikeid/uploadspareparts", function(req, res) {

	if (!req.files)
        return res.status(400).send('No files were uploaded.');
     
    var partFile = req.files.file;
 
    var parts = [];
         
    csv
     .fromString(partFile.data.toString(), {
         headers: true,
         ignoreEmpty: true
     })
     .on("data", function(data){
         data['_id'] = new mongoose.Types.ObjectId();
          
         parts.push(data);
     })
     .on("end", function(){

     	Bike.findById(req.params.bikeid, function(err, foundBike) {
     		if(err) {
     			console.log(err)
     		} else {
     			// upload-create spareparts here
     			Sparepart.create(parts, function(err, parts) {
					if(err) {
						console.log(err)
					} else {
						foundBike.spareparts.push.apply(foundBike.spareparts, parts);
						foundBike.save();

						// redirect
						res.redirect("/cshops/" + req.params.id + "/bikes/" + req.params.bikeid);
						
					}
				})
     		}
     	})
          
         
     });

})

module.exports = router;