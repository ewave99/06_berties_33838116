// Create a new router
const express = require("express");
const router = express.Router();

// Render the search page.
router.get('/search', function(req, res, next) {
    res.render("search.ejs");
});

// Render the search result page.
router.get('/search_result', function (req, res, next) {
    //searching in the database
    // res.send("You searched for: " + req.query.search_text);

    // SQL query. PARTIAL NAME MATCH.
    let sqlQuery = `SELECT * FROM books WHERE name LIKE '%${req.query.search_text}%'`;

    // Perform the query
    db.query(sqlQuery, (err, result) => {
        if (err) next (err);
        res.render("search_result.ejs", {searchResults: result});
    });
});

// Render the page that lists all the books.
router.get('/list', function(req, res, next) {
    // query database to get all the books
    let sqlquery = "SELECT * FROM books";
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err)
            next(err);
        //console.log(result);
        // Pass the result of the SQL query to list.ejs, which will render them as a table.
        res.render("list.ejs", {availableBooks: result});
    });
});

// Render the page that lists books less than £20.
router.get("/bargainbooks", (req, res, next) => {
    // Our SQL query
    let sqlQuery = "SELECT * FROM books WHERE price < 20";
    // Execute the query
    db.query(sqlQuery, (err, result) => {
        if (err)
            next(err);
        // Pass result of query to bargainbooks.ejs, which will render the result as a table.
        res.render("bargainbooks.ejs", {availableBooks: result});
    });
});

// Render page where the user can add a book.
router.get("/addbook", (req, res, next) => res.render("addbook.ejs"));

// Render result page for adding a book.
router.post('/bookadded', function (req, res, next) {
    // SQL query to save data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";

    // Execute the query
    let newrecord = [req.body.book_title, req.body.book_price];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err)
            next(err);
        else
            // Show the user the book they added to the database.
            res.send(`This book is added to database, name: ${req.body.book_title}, price: £${req.body.book_price}.`);
    });
})

// Export the router object so index.js can access it
module.exports = router;
