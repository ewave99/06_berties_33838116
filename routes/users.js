// Import express, bcrypt and express-validator
const express = require("express")
const bcrypt = require('bcrypt');
const { check, validationResult } = require("express-validator");

function redirectLogin(req, res, next) {
    if (!req.session.userId)
        return res.redirect("./login");
    next();
}

function generateDateString() {
    const datetime = new Date();
    const year = datetime.getFullYear();
    const month = datetime.getMonth();
    const day = datetime.getDate();
    const hour = datetime.getHours();
    const min = datetime.getMinutes();
    const sec = datetime.getSeconds();

    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}

// Create a new router
const router = express.Router()

// The salt for the hashing algorithm
const saltRounds = 10;

// Render registration form page for a new user.
router.get('/register', function (req, res, next) {
    res.render('register.ejs', { hasError: false })
});

// Render login page for user.
router.get("/login", function (req, res, next) {
    res.render("login.ejs");
});

// Log the user out and destroy the current login-session
router.get("/logout", redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err)
            return res.redirect("./");
        res.send("You are now logged out. <a href='/'>Home</a>");
    });
});

// Render page that lists all the users in the 'users' table in our database.
router.get('/list', redirectLogin, function (req, res, next) {
    // Query database to get list of users.
    const sqlQuery = "SELECT username, first_name, last_name FROM users ORDER BY username ASC";
    // Execute the query.
    db.query(sqlQuery, (err, result) => {
        if (err)
            return next(err);
        res.render("list_users.ejs", {userData: result});
    });
});

router.get("/audit", redirectLogin, function (req, res, next) {
    // Query database to get list of login attempts.
    const sqlQuery = "SELECT username, login_datetime, successful FROM logins";
    // Execute the query
    db.query(sqlQuery, (err, result) => {
        if (err)
            return next(err);

        console.log(result[0].login_datetime);
        res.render("list_audits.ejs", {auditData: result});
    });
});

// Render the registration success page.
router.post('/registered', 
    [
        check("email").isEmail(), 
        check("username").isLength({ min: 5, max: 20 }),
        check("password").isLength({ min: 8 })
    ], 
    (req, res, next) => {
        // Check whether there are any errors with the form submission.
        const errors = validationResult(req);
        // console.log(errors.errors);
        if (!errors.isEmpty())
            return res.render("./register", {hasError: true, errors: errors.errors});

        // Save data in database
        const plainPassword = req.sanitize(req.body.password);
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            // Store hashed password in your database.
            const dbQuery = `INSERT INTO users (username, first_name, last_name, email, hashed_password)
            VALUES (?, ?, ?, ?, ?)`;
            // const {username, first, last, email} = req.body;
            const username = req.sanitize(req.body.username);
            const first = req.sanitize(req.body.first);
            const last = req.sanitize(req.body.last);
            const email = req.sanitize(req.body.email);
            const newRecord = [username, first, last, email, hashedPassword];

            if (err)
                return res.send(err);

            db.query(dbQuery, newRecord, (err, result) => {
                if (err)
                    return next(err);

                let message = `Hello, ${username}. You are now registered! We will send an email to you at ${email}.<br>`;
                message += `Your password is ${plainPassword} and your hashed password is ${hashedPassword}<br>`;
                message += "<a href='/'>Home</a>";
                res.send(message);
            })
        });                                                                        
    }
); 

// Process the user's login details and render either a success or failure page.
router.post("/loggedin", function (req, res, next) {
    // Select the hashed password from the database, where the username matches the username entered.
    const sqlQuery = "SELECT hashed_password FROM users WHERE username = ?";
    const username = req.sanitize(req.body.username);
    const plainPassword = req.sanitize(req.body.password);

    db.query(sqlQuery, [username], (err, result) => {
        if (err)
            // If username does not exist in database... Send an error message.
            return res.send(err);

        let hashedPassword = result[0].hashed_password;

        // Compare the user's password with the hashed password in the database.
        bcrypt.compare(plainPassword, hashedPassword, function (err, result) {
            const dateString = generateDateString();
            const successful = result;

            const sqlQuery = "INSERT INTO logins (username, login_datetime, successful) VALUES (?, ?, ?)";
            const params = [username, dateString, successful];

            if (err)
                return res.send(err);

            db.query(sqlQuery, params, (err, result) => {
                if (err)
                    return res.send(err);

                if (successful === true) {
                    req.session.userId = username;
                    return res.send("Login successful. <a href='/'>Home</a>");
                }

                res.send("Sorry, your login was unsuccessful. Password did not match. Attempt has been logged.");
            });
        });
    });
});

// Export the router object so index.js can access it
module.exports = router;