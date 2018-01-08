var mongoose = require("mongoose");
var moment = require("moment");

var InventorySchema = new mongoose.Schema({
	itemname: String, 
	itembprice: Number, 
	itemsprice: Number,
	quantity: Number,
	profitandloss: [
		{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profitloss"
        }
	],
	datecreated: { type: String, default: moment().format("MMM Do YY") } 
})

module.exports = mongoose.model("Inventory", InventorySchema);