// Create a new router
const express = require("express");
const router = express.Router();

router.get('/search', function(req, res, next) {
    res.render("search.ejs");
});

router.get('/search-result', function (req, res, next) {
    //searching in the database
    res.send("You searched for: " + req.query.keyword);
});

router.get('/list', function(req, res, next) {
    // query database to get all the books
    let sqlquery = "SELECT * FROM books";
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err)
            next(err);
        console.log(result);
        res.render("list.ejs", {availableBooks: result});
    });
});

router.get("/addbook", (req, res, next) => res.render("addbook.ejs"));

router.post('/bookadded', function (req, res, next) {
    // SQL query to save data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";

    // Execute the query
    let newrecord = [req.body.book_title, req.body.book_price];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err)
            next(err);
        else
            res.send(`This book is added to database, name: ${req.body.book_title}, price: £${req.body.book_price}.`);
    });
})

// Export the router object so index.js can access it
module.exports = router;
