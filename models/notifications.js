var mongoose = require("mongoose");
var moment = require("moment");

var NotificationSchema = new mongoose.Schema({
	body: String,
	read: Boolean,
	datecreated: { type: String, default: moment().format('MMMM Do YYYY, h:mm:ss a') } 
}); 

module.exports = mongoose.model("Notification", NotificationSchema)