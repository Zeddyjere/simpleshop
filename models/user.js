var mongoose = require("mongoose");
var moment = require("moment");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String, 
	password: String, 
	firstname: String, 
	lastname: String,
	typeaccount: String, 
	emailaddress: String,
	notifications: [
		{
			type: mongoose.Schema.Types.ObjectId,
            ref: "Notification"
		}
	],
	datecreated: { type: String, default: moment().format("MMM Do YY") },
	shopsowned: [
		{
			type: mongoose.Schema.Types.ObjectId,
            ref: "Shop"
		}
	]
})

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);