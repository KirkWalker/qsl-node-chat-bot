import { fileURLToPath } from 'url';
import { dirname, extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const formatDate = function(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-') + " " + strTime;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}


async function getTime() {
    const d = new Date();
    let time = d.getTime();
    return {current_time:d.toLocaleTimeString()}
}

async function getLocation() {
    const response = await fetch("https://ipapi.co/json/");
    const locationData = await response.json();
    //const res = JSON.stringify(locationData);
    return { 
    latitude: locationData.latitude, 
    longitude:locationData.longitude,
    city: locationData.city,
    region: locationData.region,
    region_code: locationData.region_code,
    country: locationData.country,
    country_name: locationData.country_name,
    country_code: locationData.country_code,
    };
    //return locationData;
}

async function getCurrentWeather(latitude, longitude) {
    try{
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=apparent_temperature`;
        const response = await fetch(url);
        const weatherData = await response.json();
        // console.log("latitude:", latitude);
        // console.log("longitude:", longitude);
        // console.log("weatherData url:", url);
        // console.log("weatherData result:", weatherData.hourly.apparent_temperature[4]);

        return {
            latitude: weatherData.latitude,
            longitude: weatherData.longitude,
            generationtime_ms:weatherData.generationtime_ms,
            utc_offset_seconds:weatherData.utc_offset_seconds,
            timezone: weatherData.timezone,
            timezone_abbreviation: weatherData.timezone_abbreviation,
            elevation:weatherData.elevation,
            hourly_units: { time: weatherData.hourly_units.time, apparent_temperature: weatherData.hourly_units.apparent_temperature },
            hourly: {
            time: [weatherData.hourly.time[4]],
                apparent_temperature: [weatherData.hourly.apparent_temperature[4]]
            }
        }
    } catch (err) {
        console.error(err)
        return "Fetch weather results failed, please try again."
    }
}

const tools = [
    {
        type: "function",
        function: {
        name: "getCurrentWeather",
        description: "Get the current weather in a given location",
        parameters: {
            type: "object",
            properties: {
            latitude: {
                type: "string",
            },
            longitude: {
                type: "string",
            },
            },
            required: ["longitude", "latitude"],
        },
        }
    },
    {
        type: "function",
        function: {
        name: "getLocation",
        description: "Get the user's location based on their IP address",
        parameters: {
            type: "object",
            properties: {},
        },
        }
    },
    {
        type: "function",
        function: {
        name: "getTime",
        description: "Get the current time of day",
        parameters: {
            type: "object",
            properties: {},
        },
        }
    },
];

export default {formatDate, random, getTime, getLocation, getCurrentWeather, tools}