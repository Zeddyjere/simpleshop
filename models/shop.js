var mongoose = require("mongoose");
var moment = require("moment");

var ShopSchema = new mongoose.Schema({
	shopname: String,
	shopowner: String,
	shopownerid: String,
	shoptype: String,
	staffmembers: [
		{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
	],
	shopinventory: [
		{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory"
        }
	],
	shoptransactions: [
		{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction"
        }
	],
	profitloss: Array,
	active: Boolean,
	datecreated: { type: String, default: moment().format("MMM Do YY") } 
})

module.exports = mongoose.model("Shop", ShopSchema);