const pikudHaoref = require("pikud-haoref-api");
const colors = require("colors");
const moment = require("moment");
const platform = process.platform;
let sound;

if (platform === "win32") {
    sound = require("sound-play");
}

console.log("ROCKET ALERT DETECTION STARTED".yellow);
console.log("------------------------------".yellow);

console.log();

const interval = 5000;

let alertsMissiles = [];
let timerMissiles = 0;
let timerMissilesEnabled = false;

let alertsHostileAircraft = [];
let timerHostileAircraft = 0;
let timerHostileAircraftEnabled = false;

let soundAlertedMissiles = false;
let soundAlertedHostileAircraft = false;

const poll = function () {
    const options = {};

    pikudHaoref.getActiveAlert(function (err, alert) {
        setTimeout(poll, interval);

        if (err) {
            return console.log("ERROR: ".red, err);
        }

        if (alert.type === "none") {
        } else if (alert.type === "missiles") {
            if (platform === "win32" && !soundAlertedMissiles) {
                soundAlertedMissiles = true;
                sound.play("E:\\Git\\rocket-alerts\\sound.mp3");
            }

            if (timerMissiles === 0) {
                const setinterval = setInterval(() => {
                    timerMissiles++;

                    if (timerMissiles >= 30) {
                        clearInterval(setinterval);
                        alertsMissiles = [];
                        timerMissiles = 0;
                        timerMissilesEnabled = false;
                        soundAlertedMissiles = false;
                    }
                }, 1000);
            }

            const cities = alert.cities;
            const instructions = alert.instructions;

            if (cities) {
                if (!timerMissilesEnabled) {
                    console.log("ROCKET ALERT".red + " on " + moment().format("MMMM Do YYYY, h:mm:ss a"));
                }

                for (let i = 0; i < cities.length; i++) {
                    const city = cities[i].split("").reverse().join("");

                    if (!alertsMissiles.includes(city)) {
                        alertsMissiles.push(city);

                        console.log(city);
                    }
                }

                if (!timerMissilesEnabled) {
                    console.log();
                }

                timerMissilesEnabled = true;
            }
        } else if (alert.type === "hostileAircraftIntrusion") {
            if (platform === "win32" && !soundAlertedHostileAircraft) {
                soundAlertedHostileAircraft = true;
                sound.play("E:\\Git\\rocket-alerts\\sound.mp3");
            }

            if (timerHostileAircraft === 0) {
                const setinterval = setInterval(() => {
                    timerHostileAircraft++;

                    if (timerHostileAircraft >= 30) {
                        clearInterval(setinterval);
                        alertsHostileAircraft = [];
                        timerHostileAircraft = 0;
                        timerHostileAircraftEnabled = false;
                        soundAlertedHostileAircraft = false;
                    }
                }, 1000);
            }

            const cities = alert.cities;
            const instructions = alert.instructions;

            if (cities) {
                if (!timerHostileAircraftEnabled) {
                    console.log("HOSTILE AIRCRAFT ALERT".red + " on " + moment().format("MMMM Do YYYY, h:mm:ss a"));
                }

                for (let i = 0; i < cities.length; i++) {
                    const city = cities[i].split("").reverse().join("");

                    if (!alertsHostileAircraft.includes(city)) {
                        alertsHostileAircraft.push(city);

                        console.log(city);
                    }
                }

                if (!timerHostileAircraftEnabled) {
                    console.log();
                }

                timerHostileAircraftEnabled = true;
            }
        } else {
            console.log("test", alert);
            console.log();
        }
    }, options);
};

poll();
