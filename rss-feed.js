var leftStartPosition = 960;
var left = 960;
var leftTurningPoint = 1200;
var step = 2;

function getRSSFeed(feedSource, numberOfFeeds) {

    // Call AJAX.
    $.ajax({
        type: "POST",
        url: "/cs/RSSFeedService.asmx/GetRSSFeed",
        data: "{'feedSource': '" + feedSource + "', 'numberOfFeeds': '" + numberOfFeeds + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: createTicker,
        error: handleError
    });
}

function createTicker(msg) {

    $('#ticker').width(2048);
    leftTurningPoint = 1200;

    // Fill ticker.
    $.each(msg.d, function () {

        $('#ticker').append('<a href="' + this.Link + '" target="_blank">' + this.Title + '</a>&nbsp;&nbsp;&nbsp;');
    });

    setTimeout(moveLeft, 30);
}

function createTrainTicker() {

    $('#ticker').width(960);
    leftTurningPoint = 1000;

    $('#ticker').css('background-image', 'url(/CS/images/stampa/deciji-kutak/vozic.png)');

    setTimeout(moveLeft, 30);
}

function handleError(msg) { }

function moveLeft() {

    $('#ticker').css("left", left + 'px');

    left -= step;

    if (left < -leftTurningPoint) left = leftStartPosition;

    setTimeout(moveLeft, 30);
}

function freeze() {
    step = 0;
}

function resume() {
    step = 2;
}