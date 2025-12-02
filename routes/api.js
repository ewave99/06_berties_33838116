const express = require("express");
const router = express.Router();

router.get("/books", (req, res, next) => {
    let sqlQuery = "SELECT * FROM books";
    let conditions = [];
    let clauses = [];
    let params = [];

    if (req.query.search !== undefined) {
        const searchText = req.sanitize(req.query.search);
        console.log(searchText);
        conditions.push(`name LIKE '%${searchText}%'`);
    }

    if (req.query.minprice !== undefined) {
        const minPrice = req.sanitize(req.query.minprice);
        console.log(minPrice);
        if (minPrice === "" || isNaN(minPrice))
            return res.send("Invalid argument for minprice.");
        conditions.push("price >= ?");
        params.push(minPrice);
    }

    if (req.query.maxprice !== undefined) {
        const maxPrice = req.sanitize(req.query.maxprice);
        console.log(maxPrice);
        if (maxPrice === "" || isNaN(maxPrice))
            return res.send("Invalid argument for maxprice.");
        conditions.push("price <= ?");
        params.push(maxPrice);
    }

    if (req.query.sort !== undefined) {
        const sortField = req.sanitize(req.query.sort);
        console.log(sortField);
        if (sortField !== "name" && sortField !== "price" && sortField !== "id")
            return res.send("Invalid argument for sort.");
        clauses.push("ORDER BY ?");
        params.push(sortField);
    }

    if (conditions.length > 0)
        sqlQuery += " WHERE " + conditions.join(" AND ");
    if (clauses.length > 0)
        sqlQuery += " " + clauses.join(" ");
    console.log(sqlQuery);
    console.log(params);

    db.query(sqlQuery, params, (err, result) => {
        if (err) {
            res.json(err);
            next(err);
            return;
        }

        res.json(result);
    });
});

module.exports = router;