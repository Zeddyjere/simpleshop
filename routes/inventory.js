var express = require("express");
var router = express.Router();
var Shop = require("../models/shop.js");
var Inventory = require("../models/inventory.js"); 
var Transaction = require("../models/transactions.js");
var Notification = require("../models/notifications.js")
var Profitloss = require("../models/profitandloss.js");
var middleware = require("../middleware/index.js");
var User = require("../models/user");

router.get("/myinventory", middleware.isLoggedIn, function(req, res) {
	User.findById(req.user._id).populate("shopsowned").exec(function(err, foundUser) {
		if(err) {
			console.log(err)
		} else {
			res.render("myinventory", {user: foundUser})
		}
	})
})

router.get("/shops/:id/inventory", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id).populate({ path: "shopinventory", model: "Inventory", populate: { path: "profitandloss", model: "Profitloss" } }).exec(function(err, foundShop) {
		if(err) {
			console.log(err)
		} else {
			res.render("viewinventory", {shop:foundShop})
		}
	})
})

router.get("/shops/:id/sellinventory", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id).populate("shopinventory").exec(function(err, foundShop) {
		if(err) {
			console.log(err)
		} else {
			res.render("sellinventory", {shop: foundShop, successmessage: req.flash("success"), warningmessage: req.flash("warning")})
		}
	})
})

router.get("/shops/:id/sellinventory/:inventoryid", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id, function(err, foundShop) {
		if(err) {
			console.log(err)
		} else {
			Inventory.findById(req.params.inventoryid, function(err, foundInventory) {
				if(err) {
					console.log(err)
				} else {
					res.render("sellinventory2", {shop: foundShop, inventory: foundInventory});
				}
			})
		}
	})
})

router.put("/shops/:id/sellinventory/:inventoryid/sell", middleware.isLoggedIn, function(req, res) {
	Inventory.findByIdAndUpdate(req.params.inventoryid, req.body.inventory, function(err, leftInventory) {
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
					leftInventory.profitandloss.push(createdProfitloss);
					leftInventory.save();
					// Redirect
					Shop.findById(req.params.id, function(err, foundShop) {
						if(err) {
							console.log(err)
						} else {
							foundShop.profitloss.push(createdProfitloss);
							foundShop.save();
							console.log(foundShop)
							// Create a Transaction 
							var newTransaction = new Transaction({
								customername: req.body.customername,
								itemname: req.body.inventory.itemname,
								quantity: req.body.itemquantity,
								sellingprice: req.body.inventory.itemsprice,
								totalspent: req.body.inventory.itemsprice * req.body.itemquantity
							})
							Transaction.create(newTransaction, function(err, createdTransaction) {
								if(err) {
									console.log(err)
								} else {
									// save transaction and push it to under shop found
									createdTransaction.save();
									foundShop.shoptransactions.push(createdTransaction);
									foundShop.save();

									// Find the owner of the shop
									User.findById(foundShop.shopownerid, function(err, foundUser) {
										if(err) {
											console.log(err) 
										} else {
											// Create and Send notification to owner of the shop
											var newNotification = new Notification({
												body: req.body.theuser + " sold inventory from " + foundShop.shopname,
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
													req.flash("success", "You successfully sold inventory from your shop. Go to shop overview to see changes.");
													res.redirect("/shops/" + req.params.id + "/sellinventory");
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

router.put("/shops/:id/sellinventory/:inventoryid/discard", middleware.isLoggedIn, function(req, res) {
	Inventory.findByIdAndUpdate(req.params.inventoryid, req.body.inventory, function(err, leftInventory) {
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
					leftInventory.profitandloss.push(createdProfitloss);
					leftInventory.save();
					// Redirect
					Shop.findById(req.params.id, function(err, foundShop) {
						if(err) {
							console.log(err)
						} else {
							foundShop.profitloss.push(createdProfitloss);
							foundShop.save();
							// Create a Transaction 
							var newTransaction = new Transaction({
								customername: req.body.customername,
								itemname: req.body.inventory.itemname,
								quantity: req.body.itemquantity,
								sellingprice: req.body.inventory.itemsprice,
								totalspent: req.body.totalspent
							})
							Transaction.create(newTransaction, function(err, createdTransaction) {
								if(err) {
									console.log(err)
								} else {
									// save transaction and push it to under shop found
									createdTransaction.save();
									foundShop.shoptransactions.push(createdTransaction);
									foundShop.save();

									User.findById(foundShop.shopownerid, function(err, foundUser) {
										if(err) {
											console.log(err) 
										} else {
											// Create and Send notification to owner of the shop
											var newNotification = new Notification({
												body: req.body.theuser + " discarded inventory from " + foundShop.shopname,
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
													req.flash("warning", "You discarded inventory from this shop.");
													res.redirect("/shops/" + req.params.id + "/sellinventory");
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

router.get("/shops/:id/inventory/:inventoryid", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id).populate("shopinventory").exec(function(err, foundShop) {
		if(err) {
			console.log(err)
		} else {
			Inventory.findById(req.params.inventoryid, function(err, foundInventory) {
				if(err) {
					console.log(err)
				} else {
					res.render("editinventory", {shop: foundShop, inventory: foundInventory});
				}
			})
		}
	})	
})

router.post("/shops/:id/inventory", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id, function(err, foundShop) {
		if(err) {
			console.log(err)
		} else {
			// Create the Inventory
			Inventory.create(req.body.inventory, function(err, createdInventory) {
				if(err) {
					console.log(err)
				} else {
					createdInventory.save();
					foundShop.shopinventory.push(createdInventory);
					foundShop.save();

					// Create and Send notification to owner of shop
					User.findById(foundShop.shopownerid, function(err, foundUser) {
						if(err) {
							console.log(err) 
						} else {
							// Create and Send notification to owner of the shop
							var newNotification = new Notification({
								body: req.body.theuser + " added inventory to " + foundShop.shopname,
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
									res.redirect("/shops/" + req.params.id + "/inventory")
								}
							})
						}
					})	
				}
			})
		}
	})	
})

router.put("/shops/:id/inventory/:inventoryid", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id, function(err, foundShop) {
		if(err) {
			console.log(err)
		} else {
			Inventory.findByIdAndUpdate(req.params.inventoryid, req.body.inventory, function(err, updatedInventory) {
				if(err) {
					console.log(err)
				} else {
					User.findById(foundShop.shopownerid, function(err, foundUser) {
						if(err) {
							console.log(err) 
						} else {
							// Create and Send notification to owner of the shop
							var newNotification = new Notification({
								body: req.body.theuser + " edited inventory from " + foundShop.shopname,
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
									res.redirect("/shops/" + req.params.id + "/inventory");
								}
							})
						}
					})	
				}
			})
		}
	})

})

router.delete("/shops/:id/inventory/:inventoryid", middleware.isLoggedIn, function(req, res) {
	Shop.findById(req.params.id, function(err, foundShop) {
		if(err) {
			console.log(err)
		} else {
			Inventory.findByIdAndRemove(req.params.inventoryid, function(err) {
				if(err) {
					console.log(err)
				} else {
					User.findById(foundShop.shopownerid, function(err, foundUser) {
						if(err) {
							console.log(err) 
						} else {
							// Create and Send notification to owner of the shop
							var newNotification = new Notification({
								body: req.body.theuser + " deleted inventory from " + foundShop.shopname,
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
									res.redirect("/shops/" + req.params.id + "/inventory")
								}
							})
						}
					})	
				}
		 	})
		}
	})
})

module.exports = router;