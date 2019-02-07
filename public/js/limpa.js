var startTime = new Date().getTime();

setInterval(function() {
    var currentTime = new Date().getTime();
    var diff = currentTime - startTime;
    var seconds = Math.floor(diff / 1000) % 60;
    var minutes = Math.floor(diff / 1000 / 60) % 60;
    var hours = Math.floor(diff / 1000 / 60 / 60);
    var text = "Olete Limpat vaadelnud ";
    var secondText = (seconds == 1) ? " sekund " : " sekundit ";
    var minuteText = (minutes == 1) ? " minut " : " minutit ";
    var hourText = (hours == 1) ? " tund " : " tundi ";
    if(hours > 0) {text += hours + hourText}
    if(minutes > 0 && seconds === 0) {text += minutes + minuteText}
    else if (minutes > 0) {text += minutes + minuteText + " ja "}
    if(seconds > 0) {text += seconds + secondText}
    document.getElementById("time").innerHTML = text;
}, 1000);