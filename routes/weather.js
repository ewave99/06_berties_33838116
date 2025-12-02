const express = require("express");
const router = express.Router();
const request = require("request");

router.get("/", (req, res, next) => {
    res.render("weather_search.ejs");
});

router.get("/search_result", (req, res, next) => {
    const searchText = req.sanitize(req.query.search_text);

    const apiKey = process.env.BB_WEATHER_API_KEY;
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${searchText}&units=metric&appid=${apiKey}`;

    request(url, (err, response, body) => {
        if (err)
            return next(err);
        
        // res.send(body);
        const weatherData = JSON.parse(body);
        if (weatherData === undefined || 
            weatherData.main === undefined || 
            weatherData.weather.length === 0)
            return res.send("No data found.");

        let weatherMsg = `It is ${weatherData.main.temp} degrees in ${weatherData.name}. <br>`
        weatherMsg += `The humidity now is: ${weatherData.main.humidity}. <br>`;
        weatherMsg += `The weather is: ${weatherData.weather[0].description}.`;
        res.send(weatherMsg);
    });
});

module.exports = router;