var mongoose = require("mongoose");
var moment = require("moment");

var SparepartSchema = new mongoose.Schema({
	partname: String, 
	partnumber: String, 
	quantity: Number,
	unitbprice: Number,
	unitsprice: Number,
	profitandloss: [
		{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profitloss"
        }
	],
	datecreated: { type: String, default: moment().format("MMM Do YY") } 
})

module.exports = mongoose.model("Sparepart", SparepartSchema);