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

let alertsHostileAircraftIntrusion = [];
let timerHostileAircraftIntrusion = 0;

let soundAlertedMissiles = false;
let soundAlertedHostileAircraftIntrusion = false;

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
                        soundAlertedMissiles = false;
                    }
                }, 1000);
            }

            const cities = alert.cities.split("").reverse().join("");
            const instructions = alert.instructions;

            if (cities) {
                console.log("ROCKET ALERT".red + " on " + moment().format("MMMM Do YYYY, h:mm:ss a"));

                for (let i = 0; i < cities.length; i++) {
                    if (!alertsMissiles.includes(cities[i])) {
                        alertsMissiles.push(cities[i]);

                        console.log(cities[i].cyan);
                    }
                }

                //console.log("Instructions: " + instructions.yellow);
                console.log();
            }
        } else if (alert.type === "hostileAircraftIntrusion") {
            if (platform === "win32" && !soundAlertedHostileAircraftIntrusion) {
                soundAlertedHostileAircraftIntrusion = true;
                sound.play("E:\\Git\\rocket-alerts\\sound.mp3");
            }

            if (timerHostileAircraftIntrusion === 0) {
                const setinterval = setInterval(() => {
                    timerHostileAircraftIntrusion++;

                    if (timerHostileAircraftIntrusion >= 30) {
                        clearInterval(setinterval);
                        alertsHostileAircraftIntrusion = [];
                        timerHostileAircraftIntrusion = 0;
                        soundAlertedHostileAircraftIntrusion = false;
                    }
                }, 1000);
            }

            const cities = alert.cities.split("").reverse().join("");
            const instructions = alert.instructions;

            if (cities) {
                console.log("HOSTILE AIRCRAFT ALERT".red + " on " + moment().format("MMMM Do YYYY, h:mm:ss a"));

                for (let i = 0; i < cities.length; i++) {
                    if (!alertsHostileAircraftIntrusion.includes(cities[i])) {
                        alertsHostileAircraftIntrusion.push(cities[i]);

                        console.log(cities[i].cyan);
                    }
                }

                //console.log("Instructions: " + instructions.yellow);
                console.log();
            }
        } else {
            console.log(alert);
            console.log();
        }
    }, options);
};

poll();
