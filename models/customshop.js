var mongoose = require("mongoose");
var moment = require("moment");

var CShopSchema = new mongoose.Schema({
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
	bikes: [
		{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bike"
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

module.exports = mongoose.model("CShop", CShopSchema);