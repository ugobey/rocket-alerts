const parameters = process.argv;
let appMode = parameters[2];

if (appMode === undefined) {
    appMode = "prod";
}

require("dotenv").config();

const pikudHaoref = require("pikud-haoref-api");
const colors = require("colors");
const moment = require("moment");
const fs = require("fs");
const { Pool } = require("pg");

const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASS = process.env.POSTGRES_PASS;
const POSTGRES_HOST = process.env.POSTGRES_HOST;
const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE;
let POSTGRES_SSL = { rejectUnauthorized: false };
if (appMode === "dev") {
    POSTGRES_SSL = false;
}

const pool = new Pool({
    user: POSTGRES_USER,
    password: POSTGRES_PASS,
    host: POSTGRES_HOST,
    database: POSTGRES_DATABASE,
    port: 5432,
    ssl: POSTGRES_SSL,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
});

pool.on("error", (err, client) => {
    errorHandler("SQL Error : " + err);
    process.exit(-1);
});

function errorHandler(err) {
    const stringError = err.toString();

    if (stringError.indexOf("403 Forbidden") > -1) {
        console.log("ERROR: ".red + "403 Forbidden - Requires Israeli IP".yellow);
    } else {
        console.log("ERROR: ".red, err);
    }
}

const startMessage = "ROCKET ALERT DETECTION STARTED (" + appMode + ")";

console.log(startMessage.yellow);
console.log("-------------------------------------".yellow);
console.log();

const readCitiesJSON = fs.readFileSync("cities.json");
const citiesJSON = JSON.parse(readCitiesJSON);

const interval = 5000;
const recentlyAlertedCities = {};

function getAlertTypeByCategory(type) {
    switch (type) {
        case "missiles":
            return "Rocket Alert";
        case "general":
            return "General Alert";
        case "earthQuake":
            return "Earthquake Alert";
        case "radiologicalEvent":
            return "Radiological Alert";
        case "tsunami":
            return "Tsunami Alert";
        case "hostileAircraftIntrusion":
            return "Hostile Aircraft Alert";
        case "hazardousMaterials":
            return "Hazardous Materials Alert";
        case "terroristInfiltration":
            return "Terrorist Infiltration Alert";
        case "missilesDrill":
            return "Drill - Rocket Alert";
        case "generalDrill":
            return "Drill  - General Alert";
        case "earthQuakeDrill":
            return "Drill - Earthquake Alert";
        case "radiologicalEventDrill":
            return "Drill - Radiological Alert";
        case "tsunamiDrill":
            return "Drill - Tsunami Alert";
        case "hostileAircraftIntrusionDrill":
            return "Drill - Hostile Aircraft Alert";
        case "hazardousMaterialsDrill":
            return "Drill - Hazardous Materials";
        case "terroristInfiltrationDrill":
            return "Drill - Terrorist Infiltration Alert";
        default:
            return "No Alert";
    }
}

function extractNewCities(alertCities) {
    const newCities = [];
    const now = Math.floor(Date.now() / 1000);

    for (let city of alertCities) {
        if (!recentlyAlertedCities[city] || recentlyAlertedCities[city] < now - 60 * 3) {
            newCities.push(city);
            recentlyAlertedCities[city] = now;
        }
    }

    return newCities;
}

function datetimeStamp(type, date) {
    const dt = new Date(date);

    if (type && type === "sql") {
        return moment(dt).format("YYYY-MM-DDTHH:mm:ss.SSS");
    } else {
        return moment(dt).format("MMMM Do YYYY, h:mm:ss a");
    }
}

const poll = async function () {
    const options = {};

    pikudHaoref.getActiveAlert(async function (err, alert) {
        setTimeout(poll, interval);

        if (err) {
            errorHandler(err);
            return;
        }

        const alertType = alert.type;
        if (alertType) {
            const alertTypeText = getAlertTypeByCategory(alertType);
            const dateNow = Date.now();
            const timeStamp = datetimeStamp("regular", dateNow);

            if (alertType === "none") {
                //console.log(alertTypeText.red);
            } else {
                const cities = extractNewCities(alert.cities);
                const instructions = alert.instructions;

                if (cities) {
                    const client = await pool.connect();
                    const timeStampSQL = datetimeStamp("sql", dateNow);

                    for (let i = 0; i < cities.length; i++) {
                        const cityOriginal = cities[i].split("").reverse().join("");
                        let city = cities[i];

                        for (let c = 0; c < citiesJSON.length; c++) {
                            if (citiesJSON[c].value === city) {
                                city = citiesJSON[c].name_en;
                                break;
                            }
                        }

                        if (city) {
                            console.log(alertTypeText.red + " on " + timeStamp.yellow + " in " + city + " (" + cityOriginal + ")");

                            const insertAlertsQuery = ` 
                                INSERT INTO alerts 
                                (
                                    alert_type,
                                    city, 
                                    cityoriginal, 
                                    datetime
                                )
                                VALUES 
                                (
                                    $1, 
                                    $2, 
                                    $3, 
                                    $4
                                )
                            `;

                            const insertAlertsValues = [alertType, city, cityOriginal, timeStampSQL];
                            await client.query(insertAlertsQuery, insertAlertsValues);
                        }
                    }

                    client.release();
                }
            }
        }
    }, options);
};

poll();
