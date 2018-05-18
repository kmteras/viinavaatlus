var startTime = new Date().getTime();

setInterval(function() {
    var currentTime = new Date().getTime();
    var diff = currentTime - startTime;
    document.getElementById("time").innerHTML = "Olete viina vaadelnud " + Math.floor(diff / 1000) + " sekundit";
}, 1000);