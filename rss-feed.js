var left = 960;

function getRSSFeed(feedSource, numberOfFeeds) {

    // Call AJAX.
    $.ajax({
        type: "POST",
        url: "RSSFeedService.asmx/GetRSSFeed",
        data: "{'feedSource': '" + feedSource + "', 'numberOfFeeds': '" + numberOfFeeds + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: createTicker,
        error: handleError
    });
}

function createTicker(msg) {

    // Fill ticker.
    $.each(msg.d, function () {

        $('#ticker').append('<a href="' + this.Link + '" target="_blank">' + this.Title + '</a>&nbsp;&nbsp;&nbsp;');
    });

    setTimeout(moveLeft, 30);
}

function handleError(msg) { }

function moveLeft() {

    $('#ticker').css("left", left + 'px');

    left -= 2;

    if (left < -1200) left = 960;

    setTimeout(moveLeft, 30);
}