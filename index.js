//require modules
var express     = require('express'),
    app         = express(),
    mongoose    = require('mongoose'),
    bodyParser  = require('body-parser'),
    passport    = require('passport'),
    LocalStrategy = require('passport-local'),
    User        = require('./user');


//set up mongodb
mongoose.connect("mongodb://localhost/brokenAuthentication", {});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())

//Get the default DB connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Passport config
app.use(require("express-session")({
    secret: "The secret key is this sentence.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())),
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

///////////////////
//EXPLOIT POOR SECURITY
///////////////////


//user array to store user
//users can now be set up using form
// data = [
//     {
//         username: "jbloggs@mail.com",
//         password: "bloggs"
//     }
// ]


//checks if credentials are correct
// function checkUser(email, password){
//     return user.some(function(el){
//         return el.email === email && el.password === password;
//     });
// }

//handles login form on submit
// app.post('/login', function(req, res){
//     //get form data
//     var email = req.body.email;
//     var password = req.body.password;
//     //check if user is real
//     if(checkUser(email, password) === true){
//         //send to authenticated page
//         console.log('user details correct');
//         //send to index page 
//         res.redirect("/home");
//     } else{
//         //user details are incorrect
//         //send back to login form
//         res.redirect("/")
//     }
// });

///////////////////
//EXPLOIT POOR SECURITY ^^^^^
///////////////////



//check if user is logged in
//middleware
function isLoggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

//route to siplay homepage 
//uses midddleware to check if user is logged in
app.get('/home', isLoggedIn, function(req, res){
    res.render("index");
});

//register get route
app.get("/register", function(req, res){
    res.render('register');
});

//handles register user
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    console.log("new user being created")
    //creates new user in mongo
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.redirect('register');
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect('/home');
        });
    });
});

//handles passport login post route
app.post("/login", passport.authenticate("local",
{
    successRedirect: "/home",
    failureRedirect: "/"
}), function(req, res){
});

//handles logout route
app.get("/logout", function(req, res){
    req.logout();
    res.redirect('/');
});

//opening page of site - login form
app.get('/', function(req, res){
    res.render("login");
});


//creates server
app.listen(3000, function(){
    console.log('App has started on localhost 3000, URL: http://localhost:3000/');
});








