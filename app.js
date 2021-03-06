const express 				  = require("express"),
 	  app 					  = express(),
 	  ejs 					  = require("ejs"),
 	  mongoose 				  = require("mongoose"),
 	  bodyParser 			  = require("body-parser"),
 	  methodOverride  		  = require("method-override"),
 	  User 					  = require("./models/user"),
 	  passport 				  = require("passport"),
 	  LocalStrategy 		  = require("passport-local"),
 	  passportLocalMongoose   = require("passport-local-mongoose"),
 	  json2csv 				  = require('json2csv'),
	  csv 					  = require("fast-csv"),
 	  fileUpload 			  = require("express-fileupload"),
 	  flash 				  = require("connect-flash"),
 	  DropDB 			      = require("./caution_dropdata.js") // Don't mess with this line bruh!

// Require routes 
const indexRoutes = require("./routes/index"),
 	  shopRoutes = require("./routes/shop"),
 	  inventoryRoutes = require("./routes/inventory"),
 	  staffRoutes = require("./routes/staff"),
 	  transactionRoutes = require("./routes/transactions"),
 	  invoiceRoutes = require("./routes/invoice"),
 	  statsRoutes = require("./routes/trends"),
 	  customShopRoutes = require("./routes/cshop"),
 	  bikeRoutes = require("./routes/bike"),
 	  sparepartRoutes = require("./routes/sparepart");

// connect to the database
// var dburl = "mongodb://localhost/simple-shop";
var dburl = "mongodb://zeddyjere:redzilla@ds245287.mlab.com:45287/simpleshop";

mongoose.connect(dburl, function(err, res) {
	if(err) {
		console.log("DB CONNECTION FAILED" + err);
	} else {
		console.log("DB CONNECTION SUCCESS" + res);
	}
});

// APP INIT
app.set("view engine", "ejs");
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(fileUpload());


// Passport Configuration
app.use(require("express-session")({
    secret: "Rusty is the cutest dog ever!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res, next) {
	User.findById(req.user).populate("notifications").exec(function(err, foundUser) {
		if(err) {
			console.log(err)
		} else {
			res.locals.currentUser = foundUser;
			next();
		}
	})  
    
});

app.use(indexRoutes);
app.use(shopRoutes);
app.use(customShopRoutes);
app.use(inventoryRoutes);
app.use(staffRoutes);
app.use(transactionRoutes);
app.use(invoiceRoutes);
app.use(statsRoutes);
app.use(bikeRoutes);
app.use(sparepartRoutes);


// App listen
app.listen(process.env.PORT || 5000, function() {
	console.log("The server is listening on port 5000");
})