$(document).ready(function () {
    $('.ui.menu .ui.dropdown').dropdown({
        on: 'click'
    });
    $('.ui.menu a.item')
        .on('click', function () {
            $(this)
                .addClass('active')
                .siblings()
                .removeClass('active');
        });
    $('#searchButton').on('click', function () {
        search();
    });

    $('#searchBox').keydown(function (event) {
        var keypressed = event.keyCode || event.which;
        if (keypressed == 13) {
            search();
        }
    });
    window.addEventListener("load", function () {
        window.cookieconsent.initialise({
            "palette": {
                "popup": {
                    "background": "#eaf7f7",
                    "text": "#5c7291"
                },
                "button": {
                    "background": "#56cbdb",
                    "text": "#000000"
                }
            },
            "position": "top",
            "type": "opt-in",
            "content": {
                "message": "See lehekülg kasutab küpsiseid.",
                "dismiss": "Ei nõustu",
                "allow": "Luba küpsised"
            }
        })
    });
    window.onload=function(){
        swal("Kas sa oled vähemalt 18 aastane?", {
            buttons: {
                Ei: {
                    text: "Ei",
                    value: "Ei",
                },
                Jah: true,
            },
        })
            .then((value) => {
                switch (value) {

                    case "Ei":
                        window.location.replace("http://www.limonaad.ee");
                }
            });
    };

});

function search() {
    window.location.href = "/search/" + removeEstonianLetters($("#searchBox").val()).toLowerCase();
}


function removeEstonianLetters(string) {
    string = string.replace(/ä/g, "a");
    string = string.replace(/ö/g, "o");
    string = string.replace(/õ/g, "o");
    string = string.replace(/ü/g, "u");
    return string;
}

