const pikudHaoref = require("pikud-haoref-api");
const colors = require("colors");
const moment = require("moment");

console.log("ROCKET ALERT DETECTION STARTED".yellow);
console.log("------------------------------".yellow);

console.log();

const interval = 5000;

let alerts = [];
let timer = 0;

const poll = function () {
    const options = {};

    pikudHaoref.getActiveAlert(function (err, alert) {
        setTimeout(poll, interval);

        if (err) {
            return console.log("ERROR: ".red, err);
        }

        if (alert.type === "none") {
        } else if (alert.type === "missiles") {
            if (timer === 0) {
                const setinterval = setInterval(() => {
                    timer++;

                    console.log(timer);

                    if (timer >= 30) {
                        clearInterval(setinterval);
                        alerts = [];
                        timer = 0;
                    }
                }, 1000);
            }

            const cities = alert.cities;
            const instructions = alert.instructions;

            if (cities) {
                console.log("ROCKET ALERT".red + " on " + moment().format("MMMM Do YYYY, h:mm:ss a"));

                for (let i = 0; i < cities.length; i++) {
                    alerts.push(cities[i]);

                    if (!alerts.includes(cities[i])) {
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
