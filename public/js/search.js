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

    var url = "/otsi/" + $("#searchBox").val().toLowerCase() + "?sort=" + sortType;

    var stores = $.find("input[name=store]:checked");

    url += "&stores=";

    for (var i = 0; i < stores.length; i++) {
        url += stores[i].value;
        if (i !== stores.length - 1) {
            url += ",";
        }
    }

    window.location.href = url;
}
