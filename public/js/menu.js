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
