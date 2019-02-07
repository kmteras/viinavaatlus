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
            },

            onInitialise: function (status) {
                var type = this.options.type;
                var didConsent = this.hasConsented();
                if (type == 'opt-in' && didConsent) {
                    // enable cookies
                    Cookies.set("accepted",true);
                }
                if (type == 'opt-out' && !didConsent) {
                    // disable cookies
                }
            },

            onStatusChange: function(status, chosenBefore) {
                var type = this.options.type;
                var didConsent = this.hasConsented();
                if (type == 'opt-in' && didConsent) {
                    // enable cookies
                    Cookies.set("accepted",true);
                }
                if (type == 'opt-out' && !didConsent) {
                    // disable cookies
                    Cookies.remove("accepted");
                }
            },

            onRevokeChoice: function() {
                var type = this.options.type;
                if (type == 'opt-in') {
                    // disable cookies
                }
                if (type == 'opt-out') {
                    Cookies.set("accepted",true);
                }
            },
        })
    });
    if(Cookies.get("age")!=1){
        confirmation()
    }
});

function search() {
    window.location.href = "/search/" + removeEstonianLetters($("#searchBox").val()).toLowerCase();
}
function confirmation(){
    $('.ui.basic.modal')
        .modal('show')
    ;
    document.getElementById("declineButton").onclick = function () {
        Cookies.set("age",0);
        location.href = "/limpa";
    };
    document.getElementById("confirmButton").onclick=function () {
        Cookies.set("age",1);
    }
}


function removeEstonianLetters(string) {
    string = string.replace(/ä/g, "a");
    string = string.replace(/ö/g, "o");
    string = string.replace(/õ/g, "o");
    string = string.replace(/ü/g, "u");
    return string;
}

