const pikudHaoref = require("pikud-haoref-api");
const colors = require("colors");
const moment = require("moment");

const fs = require("fs");
const readCitiesJSON = fs.readFileSync("cities.json");
const citiesJSON = JSON.parse(readCitiesJSON);

console.log("PIKUD HA'OREF ALERTS".yellow);
console.log("--------------------".yellow);
console.log();

const interval = 5000;
const recentlyAlertedCities = {};
let counter = 0;

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
        if (!recentlyAlertedCities[city] || recentlyAlertedCities[city] < now - 60) {
            newCities.push(city);
            recentlyAlertedCities[city] = now;
        }
    }

    return newCities;
}

function errorHandler(err) {
    const stringError = err.toString();

    if (stringError.indexOf("403 Forbidden") > -1) {
        console.log("ERROR: ".red + "403 Forbidden - Requires Israeli IP".yellow);
    }
}

const poll = function () {
    const options = {};

    pikudHaoref.getActiveAlert(function (err, alert) {
        setTimeout(poll, interval);

        if (err) {
            errorHandler(err);
            fs.appendFileSync("errors.txt", err + "\n\n");
            return;
        }

        const alertType = alert.type;
        if (alertType) {
            const alertTypeText = getAlertTypeByCategory(alertType);
            const timeStamp = moment().format("MMMM Do YYYY, h:mm:ss a");

            if (alertType === "none") {
                //console.log(alertTypeText.red);
            } else {
                const cities = extractNewCities(alert.cities);
                const instructions = alert.instructions;

                if (cities) {
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
                            counter++
                            console.log(counter + ") " + alertTypeText.red + " on " + timeStamp.yellow + " in " + city + " (" + cityOriginal + ")");
                            fs.appendFileSync("alerts.txt", alertTypeText + " on " + timeStamp + " in " + city + " (" + cityOriginal + ")\n");
                        }
                    }
                }
            }
        }
    }, options);
};

poll();
