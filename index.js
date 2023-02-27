require('./utils');
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;

// Database
const database = include('databaseConnection');
const db_utils = include('database/db_utils');
const db_queries = include('database/queries');
const success = db_utils.printMySQLVersion();

const port = process.env.PORT || 3000;

const app = express();

const expireTime = 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)

//Users and Passwords (in memory 'database')
var users = []; 

/* secret information section */
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@cluster0.dyx5jlr.mongodb.net/?retryWrites=true&w=majority`,
	crypto: {
		secret: mongodb_session_secret
	}
});

app.use(session({ 
    secret: node_session_secret,
	store: mongoStore, //default is memory store 
	saveUninitialized: false, 
	resave: true
}));

app.use('/todo', sessionValidation);
app.use('/admin', adminAuthorization);

app.get('/', (req,res) => { // Homepage
    if (req.session.authenticated) {
        res.redirect('/loggedin');
    } else {
        res.render("index")
    }
}); 

app.get('/signup', (req,res) => { // Get Signup
    if (req.session.authenticated) {
        res.redirect('/loggedin');
    } else {
        var userMsg = req.query.userMsg;
        var passMsg = req.query.passMsg;
        var emailMsg = req.query.emailMsg;
        res.render("signup", {userMsg: userMsg, emailMsg: emailMsg, passMsg: passMsg})
    }
});

app.post('/createUser', async (req,res)=> { // Post Signup
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    var hashedPassword = bcrypt.hashSync(password, saltRounds);

    if (email && password && username) {
        var success = await db_queries.createUser({ user: username, email: email, hashedPassword: hashedPassword });

        if (success) {
            res.redirect("/"); // User successfully created
        }
        else {
            var createMsg = "Account already exists";
            res.redirect(`/signup?createMsg=${createMsg}`)
        }

    } else {
        if(!username) {
            var userMsg = "Please enter a username.";
        }
        if (!password) {
            var passMsg = "Please enter a password.";
        }
        if (!email) {
            var emailMsg = "Please enter an email.";
        }

        res.redirect(`/signup?userMsg=${userMsg}&emailMsg=${emailMsg}&passMsg=${passMsg}`)
    }
});


app.get('/login', (req,res) => { // Get Login
    if (req.session.authenticated) {
        res.redirect('/loggedin');
    } else {
        var userMsg = req.query.userMsg;
        var passMsg = req.query.passMsg;
        res.render("login" , {userMsg: userMsg, passMsg: passMsg})
    }
});

app.post('/loginUser', async (req,res) => { // Post Login
    var username = req.body.username;
    var password = req.body.password;

    if(!username || !password) {
        if(!username) {
            var userMsg = "Please enter a username."
        }
        if (!password) {
            var passMsg = "Please enter a password."
        }
        res.redirect(`/login?userMsg=${userMsg}&passMsg=${passMsg}`)
    } else {
        var results = await db_queries.getUser({user:username});
    
        if (results) {
            if(results.length == 1) {
                if (bcrypt.compareSync(password, results[0].password)) {
                    req.session.authenticated = true;
                    req.session.username = username;
                    req.session.cookie.maxAge = expireTime;
                    req.session.user_type = results[0].type;
                    req.session.user_id = results[0].user_id;
                    res.redirect('/loggedin');
                    return;
                } else {
                    var userMsg = "Invalid login credentials."
                    res.redirect(`/login?userMsg=${userMsg}`)
                }
            } else {
                //user and password combination not found
                console.log('Invalid number of users found: ' + results.length);
                res.redirect("/login");
            }
        } else {
            var userMsg = "Invalid login credentials."
            res.redirect(`/login?userMsg=${userMsg}`)
        }
    }

});

app.get('/loggedin', (req,res) => { // Members Page
    if (req.session.user_type == 'admin') {
        res.redirect('/admin')
    } else {
        res.redirect('/todo')
    }
});


app.get('/todo', async (req,res) => { // Members Page
    var todoItems = await db_queries.getTodos({user_id: req.session.user_id});
    var username = req.session.username;

    res.render("todo", {username: username, todoItems: todoItems})
});

app.get('/admin', async (req,res) =>{ // Members Page
    var userItems = await db_queries.getUsersAdmin();
    var username = req.session.username;
    res.render("admin", {username: username, users: userItems});
});

app.get(`/admin/user/:id`, async (req,res) => {
    var todoItems = await db_queries.getTodos({user_id: req.params.id});
    var viewUser = await db_queries.getUsersAdminID({user_id: req.params.id});
    var loggedInAdmin = req.session.username;

    res.render("adminUserTodo", {username: loggedInAdmin, todoItems: todoItems, viewUser: viewUser.username});
})

app.post('/sign-out', (req,res) => {
    req.session.destroy();
    res.redirect("/")
});

app.post('/createTodo', async (req, res) => {
    var description = req.body.description;

    var success = await db_queries.createTodo({ description: description, user_id: req.session.user_id});
    // TODO: AJAX CALL
    res.redirect('/todo') 
})

function isValidSession(req) {
	if (req.session.authenticated) {
		return true;
	}
	return false;
}

function sessionValidation(req, res, next) {
	if (!isValidSession(req)) {
		req.session.destroy();
		res.redirect('/login');
		return;
	}
	else {
		next();
	}
}

function isAdmin(req) {
    if (req.session.user_type == 'admin') {
        return true;
    }
    return false;
}

function adminAuthorization(req, res, next) {
	if (!isAdmin(req)) {
        res.status(403);
        res.render("errorMessage", {error: "Not Authorized"});
        return;
	}
	else {
		next();
	}
}

app.use(express.static(__dirname + "/public"));

app.get("*", (req,res) => { // 404 Catch All
	res.status(404);
	res.render("404")
});

app.listen(port, () => {
	console.log("Node application listening on port " + port);
}); 