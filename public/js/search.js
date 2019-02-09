$(document).ready(function () {
    $('#searchButton').on('click', function () {
        search();
    });

    var updateButton = $('#updateButton');

    $('#searchBox').keydown(function (event) {
        var keypressed = event.keyCode || event.which;
        if (keypressed == 13) {
            search();
        }
    });

    if (updateButton) {
        search = updateSearch;
        updateButton.on('click', function () {
            search();
        })
    }

});

function search() {
    window.location.href = "/otsi/" + $("#searchBox").val().toLowerCase();
}

function updateSearch() {
    var sortType = $.find("input[name=sortType]:checked")[0].value;

    window.location.href = "/otsi/" + $("#searchBox").val().toLowerCase() + "?sort=" + sortType;
}
