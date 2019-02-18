//var cookieNotAcceptedAgeString = "Kui tahate vanusekontrollist lahti saada, siis nõustuge küpsistega.";
$(document).ready(function () {
    $('.ui.menu .ui.dropdown').dropdown({
        on: 'click'
    });

    $('.ui.floating.multiple.dropdown.labeled.icon.button').dropdown({
        on: 'click'
    });

    $('.ui.menu a.item')
        .on('click', function () {
            $(this)
                .addClass('active')
                .siblings()
                .removeClass('active');
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
            },

        })
    });

    if (Cookies.get("age") !== "1") {
        confirmation()
    }
    /*else if (Cookies.get("cookieconsent_status") !== "allow") {
           confirmation()
       }*/
    /*else if(Cookies.get("cookieconsent_status")!=="allow" && Cookies.get("age")===0){
        confirmation(cookieNotAcceptedAgeString)
    }*/
});

function confirmation() {
    $('.ui.basic.modal').modal('show');

    document.getElementById("declineButton").onclick = function () {
        location.href = "/limpa";
    };

    document.getElementById("confirmButton").onclick = function () {
        Cookies.set("age", "1");
    }

}
