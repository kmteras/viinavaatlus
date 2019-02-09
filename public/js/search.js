$(document).ready(function () {
    $('#searchButton').on('click', function () {
        search();
    });

    $('#searchBox').keydown(function (event) {
        var keypressed = event.keyCode || event.which;
        if (keypressed == 13) {
            search();
        }
    });

    var updateButton = $('#updateButton');


    if (updateButton.length) {
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
    var sortResult = $.find("input[name=sortType]:checked");

    var sortType = 0;

    if (sortResult.length) {
        sortType = $.find("input[name=sortType]:checked")[0].value;
    }


    var url = "/otsi/" + $("#searchBox").val().toLowerCase() + "?sort=" + sortType;

    var stores = $.find("input[name=store]:checked");

    if (stores.length) {
        url += "&stores=";
    }

    for (var i = 0; i < stores.length; i++) {
        url += stores[i].value;
        if (i !== stores.length - 1) {
            url += ",";
        }
    }

    var categories = $.find("input[name=category]:checked");

    if (categories.length) {
        url += "&type=";
    }

    for (var i = 0; i < categories.length; i++) {
        url += categories[i].value;
        if (i !== categories.length - 1) {
            url += ",";
        }
    }

    window.location.href = url;
}
