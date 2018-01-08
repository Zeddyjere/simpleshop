var mongoose = require("mongoose");
var moment = require("moment");

var TransactionSchema = new mongoose.Schema({
	customername: String, 
	itemname: String,
	quantity: Number,
	sellingprice: Number,
	totalspent: Number,
	dategenerated: { type: String, default: moment().format("MMM Do YY") } 
})

module.exports = mongoose.model("Transaction", TransactionSchema);