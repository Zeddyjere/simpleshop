var mongoose = require("mongoose");
var moment = require("moment");

var ProfitlossSchema = new mongoose.Schema({
	profitloss: Number, 
	dategenerated: { type: String, default: moment().format("MMM Do YY") } 
})

module.exports = mongoose.model("Profitloss", ProfitlossSchema);