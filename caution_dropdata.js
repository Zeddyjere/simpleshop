var mongoose = require("mongoose");
var User = require("./models/user");
var Shop = require("./models/user");
var Inventory = require("./models/inventory");
var Notification = require("./models/notifications");
var Profitandloss = require("./models/profitandloss");
var Transactions = require("./models/transactions");

// This function will remove all the information held on simpleshop
function dropDB() {
	// This code remove all the users in the entire Simple Shop App 
	User.remove({}, function(err) {
		if(err) {
			console.log(err)
			console.log("The users of simple shop could not be removed from the database");
		} else {
			console.log("All the users were removed from the simple shop Database!");
		}
	})

	// This code will remove all the shops in the entire Simple Shop App 
	Shop.remove({}, function(err) {
		if(err) {
			console.log(err)
			console.log("The shops in simple shop could not be removed from the database");
		} else {
			console.log("All the shops were removed from the simple shop Database!");
		}
	})

	// This code will remove all the inventory in the entire Simple Shop App 
	Inventory.remove({}, function(err) {
		if(err) {
			console.log(err)
			console.log("Inventory could not be removed from the database");
		} else {
			console.log("All the inventory was removed from the simple shop Database!");
		}
	})

	Notification.remove({}, function(err) {
		if(err) {
			console.log(err)
			console.log("Notification could not be removed from the database");
		} else {
			console.log("All the notifications were removed from the simple shop Database!");
		}
	})

	Profitandloss.remove({}, function(err) {
		if(err) {
			console.log(err)
			console.log("Profitandloss could not be removed from the database");
		} else {
			console.log("All the Profitandloss were removed from the simple shop Database!");
		}
	})

	Transactions.remove({}, function(err) {
		if(err) {
			console.log(err)
			console.log("Transactions could not be removed from the database");
		} else {
			console.log("All the Transactions were removed from the simple shop Database!");
		}
	})
}

module.exports = dropDB;

