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
    window.location.href = "/search/" + $("#searchBox").val();
}
