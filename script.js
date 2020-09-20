slider = document.getElementById("speedInput");
output = document.getElementById("speedOutput");
output.innerHTML = slider.value;
slider.oninput = function () {
    output.innerHTML = this.value;
};

class DateTime {
    constructor(s) {
        this.year = parseInt(s.substring(0, 4));
        this.month = parseInt(s.substring(4, 6));
        this.day = parseInt(s.substring(6, 8));
        this.hours = parseInt(s.substring(8, 10));
    }
    get() {
        var year = this.year.toString();
        var month = this.month.toString();
        if (month.length == 1) {
            month = "0" + month;
        }
        var day = this.day.toString();
        if (day.length == 1) {
            day = "0" + day;
        }
        var hours = this.hours.toString();
        if (hours.length == 1) {
            hours = "0" + hours;
        }
        return year + month + day + hours + "00";
    }
    increment(x, unit) {
        for (var i = 0; i < x; i++) {
            if (unit == "h") this.hours += 1;
            else if (unit == "d") this.day += 1;
            else if (unit == "m") this.month += 1;
            if (this.hours >= 24) {
                this.hours = 0;
                this.day += 1;
            }
            if (this.day == 31 && (this.month == 9 || this.month == 5 || this.month == 11)) {
                this.day = 1;
                this.month += 1;
            }
            if (this.day == 29 && this.month == 2) {
                this.day = 1;
                this.month += 1;
            }
            if (this.day == 32) {
                this.day = 1;
                this.month += 1;
            }
            if (this.month == 13) {
                this.month = 1;
                this.year += 1;
            }
        }
    }
    decrement(x, unit) {
        for (var i = 0; i < x; i++) {
            if (unit == "h") this.hours -= 1;
            else if (unit == "d") this.day -= 1;
            else if (unit == "m") this.month -= 1;
            if (this.hours < 0) {
                this.hours = 23;
                this.day -= 1;
            }
            if (this.day == -1) {
                this.month -= 1;
                if (this.month == 9 || this.month == 5 || this.month == 11) {
                    this.day = 30;
                } else if (this.month == 2) {
                    this.day = 28;
                } else {
                    this.day = 31;
                }
            }
            if (this.month == -1) {
                this.year -= 1;
                this.month = 12;
            }
        }
    }
    getMonth() {
        switch (this.month) {
            case 1:
                return "Jan";
            case 2:
                return "Feb";
            case 3:
                return "Mar";
            case 4:
                return "Apr";
            case 5:
                return "May";
            case 6:
                return "Jun";
            case 7:
                return "Jul";
            case 8:
                return "Aug";
            case 9:
                return "Sep";
            case 10:
                return "Oct";
            case 11:
                return "Nov";
            case 12:
                return "Dec";
        }
        return "who knows";
    }
}

function get(url) {
    return new Promise(async (resolve, reject) => {
        fetch(url)
            .then((res) => res.json())
            .then((json) => {
                resolve(json);
            })
            .catch((err) => reject(err));
    });
}

function createLabels(t) {
    var ans = {
        days: [],
        times: [],
    };
    var weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // d = new Date();
    // var j = d.getDay();
    // var month = (d.getMonth() + 1).toString();
    // if (month.length == 1) month = "0" + month;
    // var day = d.getDate().toString();
    // if (day.length == 1) day = "0" + day;
    // var year = d.getFullYear().toString();
    // t = new DateTime(year + month + day + "0000");

    var diff = getHourDiff();
    if (diff < 0) {
        t.decrement(Math.abs(diff), "h");
    } else {
        t.increment(Math.abs(diff), "h");
    }
    for (var i = 0; i < 7; i++) {
        ans["days"].push(t.getMonth() + " " + t.day);
        if (diff < 0) {
            t.increment(Math.abs(diff), "h");
        } else {
            t.decrement(Math.abs(diff), "h");
        }
        for (var k = 0; k < 4; k++) {
            ans["times"].push(t.get());
            t.increment(6, "h");
        }
        if (diff < 0) {
            t.decrement(Math.abs(diff), "h");
        } else {
            t.increment(Math.abs(diff), "h");
        }
        // j++;
        // if (j == 7) j = 0;
    }
    return ans;
}

//returns the current UTC time in a string
function getUTC() {
    var d = new Date();
    var year = d.getUTCFullYear();
    var month = d.getUTCMonth() + 1;
    if (month < 10) month = "0" + month;
    else month = "" + month;
    var day = d.getUTCDate();
    if (day < 10) day = "0" + day;
    else day = "" + day;
    var hours = d.getUTCHours();
    if (hours < 10) hours = "0" + hours;
    else hours = "" + hours;
    return year + month + day + hours + "00";
}

async function getRecent() {
    // url = "https://tools.airfire.org/websky/v1/api/runs/standard/GFS-0.15deg/";
    // data = await get(url);
    // return data["run_urls"][0];
    var time = "2020091912";
    return "https://haze.airfire.org/bluesky-daily/output/standard/GFS-0.15deg/" + time;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

//returns hour difference between GMT and user's local time
function getHourDiff() {
    var d = new Date();
    var diff = d.toString().split(" ")[5].substring(3);
    var num = parseInt(diff.substring(1, 3));
    if (diff.charAt(0) == "-") return -num;
    return num;
}

//returns closest 6 hour time interval in the future (DateTime)
function calcStartingTime(t) {
    var hourDiff = getHourDiff();
    if (hourDiff < 0) {
        t.decrement(Math.abs(hourDiff), "h");
    } else {
        t.increment(Math.abs(hourDiff), "h");
    }
    while (t.hours % 6 != 0) {
        t.increment(1, "h");
    }
    if (hourDiff < 0) {
        t.increment(Math.abs(hourDiff), "h");
    } else {
        t.decrement(Math.abs(hourDiff), "h");
    }
    return t;
}

//creates the google map
async function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: {
            lat: 39,
            lng: -97,
        },
        disableDefaultUI: true,
    });
    t = calcStartingTime(new DateTime(getUTC()));
    var info = createLabels(new DateTime(t.get()));
    var dateLabels = Array.from(document.querySelectorAll("h3"));
    var i = 0;
    dateLabels.forEach((label) => {
        label.innerHTML = info["days"][i];
        i++;
    });
    var timeLabels = Array.from(document.querySelectorAll(".timeButton"));
    i = 0;
    timeLabels.forEach((label) => {
        label.id = info["times"][i];
        i++;
    });

    var overlays = await createOverlays(map, new DateTime(t.get()));

    overlays[t.get()].setMap(map);
    var currentOverlay = t.get();
    document.getElementById(currentOverlay).classList.add("active");
    buttons = Array.from(document.getElementsByClassName("timeButton"));
    var forward = document.getElementById("forward");
    var back = document.getElementById("back");
    if (currentOverlay == info["times"][0]) {
        back.classList.add("inactive");
    }
    buttons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            if (e.target.id == currentOverlay) return;
            document.getElementById(currentOverlay).classList.remove("active");
            if (forward.classList.contains("inactive")) forward.classList.remove("inactive");
            if (back.classList.contains("inactive")) back.classList.remove("inactive");
            e.target.classList.add("active");
            overlays[currentOverlay].setMap(null);
            overlays[e.target.id].setMap(map);
            currentOverlay = e.target.id;
            if (currentOverlay == info["times"][info["times"].length - 1]) {
                forward.classList.add("inactive");
            } else if (currentOverlay == info["times"][0]) {
                back.classList.add("inactive");
            }
        });
    });
    forward.addEventListener("click", (e) => {
        if (forward.classList.contains("inactive")) return;
        if (back.classList.contains("inactive")) back.classList.remove("inactive");
        document.getElementById(currentOverlay).classList.remove("active");
        overlays[currentOverlay].setMap(null);
        currentTime = new DateTime(currentOverlay);
        currentTime.increment(6, "h");
        currentOverlay = currentTime.get();
        document.getElementById(currentOverlay).classList.add("active");
        overlays[currentOverlay].setMap(map);
        if (currentOverlay == info["times"][info["times"].length - 1]) {
            document.getElementById("forward").classList.add("inactive");
        }
    });
    back.addEventListener("click", (e) => {
        if (forward.classList.contains("inactive")) forward.classList.remove("inactive");
        if (back.classList.contains("inactive")) return;
        document.getElementById(currentOverlay).classList.remove("active");
        overlays[currentOverlay].setMap(null);
        currentTime = new DateTime(currentOverlay);
        currentTime.decrement(6, "h");
        currentOverlay = currentTime.get();
        document.getElementById(currentOverlay).classList.add("active");
        overlays[currentOverlay].setMap(map);
        if (currentOverlay == info["times"][0]) {
            document.getElementById("back").classList.add("inactive");
        }
    });
    var play = document.getElementById("play");
    var stop = document.getElementById("stop");
    play.addEventListener("click", async (e) => {
        if (play.classList.contains("inactive")) return;
        stop.classList.remove("inactive");
        play.classList.add("inactive");
        forward.classList.add("inactive");
        back.classList.add("inactive");
        var stopBool = false;
        for (var i = 0; i < info["times"].length; i++) {
            if (stopBool) break;
            overlays[currentOverlay].setMap(null);
            document.getElementById(currentOverlay).classList.remove("active");
            currentOverlay = info["times"][i];
            document.getElementById(currentOverlay).classList.add("active");
            overlays[currentOverlay].setMap(map);
            stop.addEventListener("click", (e) => {
                stopBool = true;
            });
            console.log("output", parseInt(output.innerHTML));
            var timeToSleep = parseInt(500 * (1 / parseFloat(output.innerHTML)));
            console.log("timeToSleep", timeToSleep);
            await sleep(timeToSleep);
            stop.removeEventListener("click", (e) => {});
        }
        play.classList.remove("inactive");
        if (currentOverlay != info["times"][info["times"].length - 1])
            forward.classList.remove("inactive");
        if (currentOverlay != info["times"][0]) back.classList.remove("inactive");
        stop.classList.add("inactive");
    });
}

//creates the ground overlays for the smoke
async function createOverlays(map, t) {
    var overlays = {};
    const imageBounds = {
        north: 91,
        south: 23,
        east: -50.0,
        west: -170.0,
    };
    var cont = true;
    var recent = "2020091912";
    var base =
        "https://haze.airfire.org/bluesky-daily/output/standard/GFS-0.15deg/" +
        recent +
        "/combined/graphics/three_hour/1GreyColorBar/three_hour_";
    var url = "";
    var i = 0;
    while (i < 28) {
        url = base + t.get() + ".png";
        await fetch(url, {
            mode: "no-cors",
        }).then((res) => {
            // console.log(t.get());
            overlays[t.get()] = new google.maps.GroundOverlay(url, imageBounds);
            t.increment(6, "h");
            i++;
        });
    }
    return overlays;
}
