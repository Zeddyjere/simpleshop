var mongoose = require("mongoose");
var moment = require("moment");

var BikeSchema = new mongoose.Schema({
	bikename: String, 
	bikemodel: String, 
	spareparts: [
		{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sparepart"
        }
	],
	datecreated: { type: String, default: moment().format("MMM Do YY") } 
})

module.exports = mongoose.model("Bike", BikeSchema);