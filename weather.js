const moment = require('moment');
const axios = require('axios');

var calculateDirection = (wd) => {

    if (wd >= 0 && wd <= 11.25) {

        var dir = "N";

    }

    if (wd > 348.75 && wd <= 360) {

        var dir = "N";

    }

    if (wd > 11.25 && wd <= 33.75) {

        var dir = "NNE";

    }

    if (wd > 33.75 && wd <= 56.25) {

        var dir = "NE";

    }

    if (wd > 56.25 && wd <= 78.75) {

        var dir = "ENE";

    }

    if (wd > 78.75 && wd <= 101.25) {

        var dir = "E";

    }

    if (wd > 101.25 && wd <= 123.75) {

        var dir = "ESE";

    }

    if (wd > 123.75 && wd <= 146.25) {

        var dir = "SE";

    }

    if (wd > 146.25 && wd <= 168.75) {

        var dir = "SSE";

    }

    if (wd > 168.75 && wd <= 191.25) {

        var dir = "S";

    }

    if (wd > 191.25 && wd <= 213.75) {

        var dir = "SSW";

    }

    if (wd > 213.75 && wd <= 236.25) {

        var dir = "SW";

    }

    if (wd > 236.25 && wd <= 258.75) {

        var dir = "WSW";

    }

    if (wd > 258.75 && wd <= 281.25) {

        var dir = "W";

    }

    if (wd > 281.25 && wd <= 303.75) {

        var dir = "WNW";

    }

    if (wd > 303.75 && wd <= 326.25) {

        var dir = "NW";

    }

    if (wd > 326.25 && wd <= 348.75) {

        var dir = "NNW";

    }
    
    return dir;
};

var getWeather = (address) => {
    return new Promise((resolve, reject) => {
        if (address === '') {
            reject('You must provide an address.  See --help.');
        };
        
        var encodedAddr = encodeURIComponent(address);
        var geocodeURL = `http://www.mapquestapi.com/geocoding/v1/address?key=8QZrP4Tm2GyfGDJsaWuiurKa4AeP9kxc&location=${encodedAddr}`;
        var prettyAddr = '';
    
        axios.get(geocodeURL).then( (response) => {
            prettyAddr = `${response.data.results[0].locations[0].adminArea5}, ${response.data.results[0].locations[0].adminArea3}`;
            var lat = response.data.results[0].locations[0].latLng.lat;
            var lng = response.data.results[0].locations[0].latLng.lng;
            var weatherURL = `https://api.darksky.net/forecast/e29e17d59a7ea4d1e9fb20258895e3c7/${lat},${lng}?exclude=minutely,hourly`;
            return axios.get(weatherURL);    
        }).then( (response) => {
            var returnObj = {
                address: prettyAddr,
                dt: moment(response.data.currently.time*1000).format('M/D/YYYY h:m:ss a'),
                currentConditions: response.data.currently.summary,
                temp: Math.round(response.data.currently.temperature),
                apparentTemp: Math.round(response.data.currently.apparentTemperature),
                windDirection: calculateDirection(response.data.currently.windBearing),
                windSpeed: Math.round(response.data.currently.windSpeed),
                chanceOfRain: Math.round(response.data.currently.precipProbability),
                forcasts: []
            };
            response.data.daily.data.forEach((day) => {
                 var currentDate = {
                     day: moment(day.time*1000).format("dddd"),
                     conditions: day.summary,
                     lowTemp: Math.round(day.temperatureLow),
                     highTemp: Math.round(day.temperatureHigh),
                     chanceOfRain: Math.round(day.precipProbability)
                 }
                 returnObj.forcasts.push(currentDate);
            });
            resolve(returnObj);
        }).catch((e) => {
            if (e.code === 'ENOTFOUND') {
                reject('Error connecting to API servers.');
            } else { 
                reject(e.message);
            };
        });
    });
    
    
};

module.exports= {
    getWeather
}
