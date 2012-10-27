var map;
var greenMarkers = [];
var allKiosks = [];
var imagesPath = "/cs/Images/axle-d-map/"; // On server.
// var imagesPath = "/Images/"; // On local machine.
var redMarker; // Regular kiosk (not branded).
var greenMarker; // Currently selected kiosk.
var blueMarker; // Marker for branded kiosks.
var yellowMarker; // Marker for competition.
var contentString;
var infowindow;
var settlements;
var kiosks;

// window.onload = loadScriptForGoogleMap;

function init() {
    loadAllKiosks();

    initKioskLocator();

    initRating();

    // initAutocompleteForProducts(); // DO NOT DELETE YET.
}

function loadScriptForGoogleMap() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=initMap";
    document.body.appendChild(script);
}

function loadAllKiosks() {

    // Call AJAX.
    $.ajax({
        type: "POST",
        url: "Stampa.asmx/LoadAllKiosks",
        data: {},
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: loadAllKiosksCompleted,
        error: handleAllKiosksError
    });
};

function loadAllKiosksCompleted(msg) {

    // Fill kiosks.
    $.each(msg.d, function () {

        var kiosk = new Kiosk(this.IdKiosk, this.IdSettlement, this.Code, this.Address, this.WorkingTimeMonToFri, this.WorkingTimeSaturday, this.WorkingTimeSunday, this.WorkingTimeDayOff, this.Latitude, this.Longitude, this.IsBranded, this.IsCompetition);

        allKiosks.push(kiosk);
    });

    loadScriptForGoogleMap();
}

function handleAllKiosksError(msg) {
    hideMapLoadingIndicator();
    showMapFailedNotification();

    alert('Kiosci se nisu mogli prikazati na mapi.\n\rProverite vezu sa internetom i pokušajte ponovo.');
}

function Kiosk(idKiosk, idSettlement, code, address, workingTimeMonToFri, workingTimeSaturday, workingTimeSunday, workingTimeDayOff, latitude, longitude, isBranded, isCompetition) {
    this.IdKiosk = idKiosk;
    this.IdSettlement = idSettlement;
    this.Code = code;
    this.Address = address;
    this.WorkingTimeMonToFri = workingTimeMonToFri;
    this.WorkingTimeSaturday = workingTimeSaturday;
    this.WorkingTimeSunday = workingTimeSunday;
    this.WorkingTimeDayOff = workingTimeDayOff;
    this.Latitude = latitude;
    this.Longitude = longitude;
    this.IsBranded = isBranded;
    this.IsCompetition = isCompetition;
}

function initKioskLocator() {

    // Initialize global variables (drop-downs controls).
    settlements = $("#settlements");
    kiosks = $("#kiosks");

    // Add event for changing a selected item.
    settlements.change(function () {

        // Reload kiosk's drop-down with new data based on settlement's selection.
        loadKiosks(settlements.val());
    });

    loadSettlements();
}

function loadSettlements() {
    displaySettlementBusyBox();
    displayKioskBusyIndicator();

    // Call AJAX.
    $.ajax({
        type: "POST",
        url: "Stampa.asmx/LoadSettlements",
        data: {}, // "{'settlementName': '" + $("#filterSettlements").val() + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: loadSettlementsCompleted,
        error: handleSettlementsError
    });
};

function loadSettlementsCompleted(msg) {

    // Clear combo first.
    $("select[id$=settlements] > option").remove();

    // Fill combo.
    $.each(msg.d, function () {
        settlements.append($("<option />")
                    .val(this.IdSettlement)
                    .text(this.Name));
    });

    // Default value: Beograd.
    settlements.val("33");

    hideSettlementBusyIndicator();

    // Load kiosks for Beograd.
    // loadKiosks(33);
}

function handleSettlementsError(msg) {
    hideSettlementBusyIndicator();

    alert('Podaci o naseljima se nisu mogli učitati.\n\rProverite vezu sa internetom i pokušajte ponovo.');
}

function loadKiosks(idSettlement) {
    displayKioskBusyIndicator();

    // Clear kiosk's combo first.
    $("select[id$=kiosks] > option").remove();

    if (allKiosks) {
        for (i in allKiosks) {
            if (allKiosks[i].IdSettlement == idSettlement) {

                // Fill kiosks as combo.
                kiosks.append($("<option />")
                            .val(allKiosks[i].IdKiosk + '|' + allKiosks[i].Code + '|'
                                    + allKiosks[i].WorkingTimeMonToFri + '|' + allKiosks[i].WorkingTimeSaturday + '|'
                                    + allKiosks[i].WorkingTimeSunday + '|' + allKiosks[i].WorkingTimeDayOff + '|'
                                    + allKiosks[i].Latitude + '|' + allKiosks[i].Longitude + '|'
                                    + allKiosks[i].IsBranded + '|' + allKiosks[i].IsCompetition)
                            .text(allKiosks[i].Address));
            }
        }
    }

    hideKioskBusyIndicator();
};

function initRating() {
    $('#star').raty({
        click: function (score, evt) {
            alert('Vaša ocena je uspešno zabeležena.\n\rHvala na glasanju.');
        }
    });
}

function initAutocompleteForProducts() {
    $("#product").autocomplete({
        source: function (request, response) {
            $.ajax({
                type: "POST",
                url: "Stampa.asmx/LoadProducts",
                data: "{'name': '" + request.term + "'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    response($.map(data.d, function (item) {
                        return {
                            label: item.Name,
                            value: item.Name,
                            id: item.IdProduct
                        }
                    }));
                },
                error: function (data) {
                    alert('Podaci o proizvodima se nisu mogli učitati.\n\rProverite vezu sa internetom i pokušajte ponovo.');
                }
            });
        },
        minLength: 2,
        select: function (event, ui) { },
        open: function () {
            $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        },
        close: function () {
            $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
        }
    });

    $('#product').focus(function () {
        $(this).val('');
    });
    $('#product').focusout(function () {
        $(this).val('Pronađite proizvod / unesite naziv');
    });
}

function initMap() {
    // var myLatlng = new google.maps.LatLng(44.8256, 20.3914); // Beograd.
    var myLatlng = new google.maps.LatLng(44.1, 20.4); // Centar Srbije.

    var myOptions = {
        zoom: 7,
        center: myLatlng,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.HYBRID
    }

    hideMapLoadingIndicator();

    map = new google.maps.Map(document.getElementById("map"), myOptions);

    initMapCommonVariables();

    drawAllKiosksOnMap();

    loadKiosks(33);
}

function initMapCommonVariables() {
    redMarker = new google.maps.MarkerImage(imagesPath + "red-dot.png");
    greenMarker = new google.maps.MarkerImage(imagesPath + "green-dot.png");
    blueMarker = new google.maps.MarkerImage(imagesPath + "blue-dot.png");
    yellowMarker = new google.maps.MarkerImage(imagesPath + "yellow-dot.png");
    contentString = " ";
    infowindow = new google.maps.InfoWindow({ content: contentString });
}

function drawAllKiosksOnMap() {
    if (allKiosks) {
        for (i in allKiosks) {
            drawKioskOnMap(allKiosks[i]);
        }
    }
}

function zoomKioskOnMap() {
    if (map != null) {

        // Extract data from selected kiosk.
        var selectedKiosk = kiosks.val().split('|');

        var id = selectedKiosk[0];
        var code = selectedKiosk[1]
        var workingTimeMonToFri = selectedKiosk[2]
        var workingTimeSaturday = selectedKiosk[3]
        var workingTimeSunday = selectedKiosk[4]
        var workingTimeDayOff = selectedKiosk[5]
        var latitude = selectedKiosk[6];
        var longitude = selectedKiosk[7];
        var isBranded = selectedKiosk[8];
        var isCompetition = selectedKiosk[9];

        var address = kiosks.find('option:selected').text();

        // Display data in assistant info control.
        $('#kiosk-code').text(code);
        $('#kiosk-address').text(address);
        $('#kiosk-working-time-from-Monday-to-Friday').text(workingTimeMonToFri);
        $('#kiosk-working-time-on-Saturday').text(workingTimeSaturday);
        $('#kiosk-working-time-on-Sunday').text(workingTimeSunday);
        $('#kiosk-working-time-day-off').text(workingTimeDayOff);

        var kiosk = new Kiosk(id, null, code, address, workingTimeMonToFri, workingTimeSaturday, workingTimeSunday, workingTimeDayOff, latitude, longitude, isBranded, isCompetition);
        zoomToKiosk(kiosk);
    } else {
        alert('Mapa trenutno nije dostupna.');
    }
}

function kioskSearchCode_KeyUp() {
    if (window.event && window.event.keyCode == 13) {
        findKioskByCodeAndZoomItOnMap();
    }
}

function findKioskByCodeAndZoomItOnMap() {
    if (map != null) {

        // Take data from input field for kiosk code.
        var kioskCode = $('#kiosk-search-code').val().trim();

        if (kioskCode.length > 0) {
            if (kioskCode.indexOf("'") > -1) {
                alert('Apostrofi nisu dozvoljeni.');
                $('#kiosk-search-code').focus();
                return;
            } else if (kioskCode.indexOf("--") > -1) {
                alert('Nije dozvoljeno uneti dve crtice (--).');
                $('#kiosk-search-code').focus();
                return;
            } else {
                findKioskByCode(kioskCode);
            }
        } else {
            alert('Polje za unos ne sme biti prazno.');
            $('#kiosk-search-code').val('');
            $('#kiosk-search-code').focus();
        }
    } else {
        alert('Mapa trenutno nije dostupna.');
    }
}

function findKioskByCode(kioskCode) {
    displayKioskByCodeBusyIndicator();

    // Call AJAX.
    $.ajax({
        type: "POST",
        url: "Stampa.asmx/FindKioskByCode",
        data: "{'kioskCode': '" + kioskCode + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: findKioskByCodeCompleted,
        error: findKioskByCodeError
    });
}

function findKioskByCodeCompleted(msg) {
    hideKioskByCodeBusyIndicator();

    if (msg.d.length == 1) {

        // Show kiosk on map.
        $.each(msg.d, function () {

            // Display data in assistant info control.
            $('#kiosk-code').text(this.Code);
            $('#kiosk-address').text(this.Address);
            $('#kiosk-working-time-from-Monday-to-Friday').text(this.WorkingTimeMonToFri);
            $('#kiosk-working-time-on-Saturday').text(this.WorkingTimeSaturday);
            $('#kiosk-working-time-on-Sunday').text(this.WorkingTimeSunday);
            $('#kiosk-working-time-day-off').text(this.WorkingTimeDayOff);

            var kiosk = new Kiosk(this.Id, null, this.Code, this.Address, this.WorkingTimeMonToFri, this.WorkingTimeSaturday, this.WorkingTimeSunday, this.WorkingTimeDayOff, this.Latitude, this.Longitude, this.IsBranded, this.IsCompetition);
            zoomToKiosk(kiosk);
        });
    } else if (msg.d.length < 1) {
        alert('Ne postoji kiosk sa traženom šifrom.');
        $('#kiosk-search-code').focus();
    } else if (msg.d.length > 1) {
        alert('U sistemu je pronađeno ' + msg.d.length + ' kioska sa istom šifrom.\r\nObavestite administratora sistema.');
    }
}

function findKioskByCodeError(msg) {
    hideKioskByCodeBusyIndicator();

    // Notify user about error.
    alert('Kiosk nije pronađen.\n\rProverite vezu sa internetom i pokušajte ponovo.');
}

function zoomToKiosk(kiosk) {
    setInfoWindow(kiosk);

    var latLng = new google.maps.LatLng(kiosk.Latitude, kiosk.Longitude);

    map.panTo(latLng); // Pan to kiosk.
    map.setZoom(17); // Zoom to kiosk.
}

function setInfoWindow(kiosk) {
    deleteGreenMarkers();

    var latLng = new google.maps.LatLng(kiosk.Latitude, kiosk.Longitude);

    var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: "ŠTAMPA KIOSK: " + kiosk.Address,
        icon: greenMarker,
        zIndex: google.maps.Marker.MAX_ZINDEX
    });

    google.maps.event.addListener(marker, 'click', function () {
        contentString = getInfoWindowContent(kiosk);

        infowindow.setContent(contentString);
        infowindow.open(map, marker);
    });

    greenMarkers.push(marker);
}

// Deletes all green markers in the array by removing references to them.
function deleteGreenMarkers() {
    if (greenMarkers && greenMarkers.length > 0) {
        for (i in greenMarkers) {
            greenMarkers[i].setMap(null);
        }
        greenMarkers.length = 0;
    }
}

function drawKioskOnMap(kiosk) {
    var latLng = new google.maps.LatLng(kiosk.Latitude, kiosk.Longitude);

    var iconMarker;
    if (kiosk.IsCompetition) {
        iconMarker = yellowMarker;
    } else {
        if (kiosk.IsBranded) {
            iconMarker = blueMarker;
        } else {
            iconMarker = redMarker;
        }
    }

    var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: "ŠTAMPA KIOSK: " + kiosk.Address,
        icon: iconMarker
    });

    google.maps.event.addListener(marker, 'click', function () {
        contentString = getInfoWindowContent(kiosk);

        infowindow.setContent(contentString);
        infowindow.open(map, marker);
    });
}

function getInfoWindowContent(kiosk) {
    var content = '<div>' +
                    '<div class="info-window-title">KIOSK INFO</div>' +
                    '<p><span class="kiosk-property">BROJ KIOSKA: </span><span class="kiosk-property-value">' + kiosk.Code + '</span></p>' +
                    '<p><span class="kiosk-property">ADRESA: </span><span class="kiosk-property-value">' + kiosk.Address + '</span></p>' +
                    '<p><span class="kiosk-property">PONEDELJAK-PETAK: </span><span class="kiosk-property-value">' + kiosk.WorkingTimeMonToFri + '</span></p>' +
                    '<p><span class="kiosk-property">SUBOTA: </span><span class="kiosk-property-value">' + kiosk.WorkingTimeSaturday + '</span></p>' +
                    '<p><span class="kiosk-property">NEDELJA: </span><span class="kiosk-property-value">' + kiosk.WorkingTimeSunday + '</span></p>' +
                    '<p><span class="kiosk-property">SLOBODAN DAN: </span><span class="kiosk-property-value">' + kiosk.WorkingTimeDayOff + '</span></p>' +
                    '<div>' +
                    '<table><tr><td><img alt="ŠTAMPA KIOSK" title="ŠTAMPA KIOSK" src="' + imagesPath + 'BG932-116x100.jpg" style="border: 1px solid #000;" hspace="0" vspace="0" /></td>' +
                    '<td><img alt="ŠTAMPA KIOSK" title="ŠTAMPA KIOSK" src="' + imagesPath + 'Kućica-piktogram-116x100.gif" style="border: 1px solid #000;" hspace="0" vspace="0" /></td>' +
                    '</div>' +
                    '</div>';

    return content;
}

function openFeedbackForm() {
    alert('Forma za unos utisaka je u pripremi.');
}

function displaySettlementBusyBox() {
    $('#settBusy').css("display", "inline");
}

function hideSettlementBusyIndicator() {
    $('#settBusy').css("display", "none");
}

function displayKioskBusyIndicator() {
    $('#kioskBusy').css("display", "inline");
}

function hideKioskBusyIndicator() {
    $('#kioskBusy').css("display", "none");
}

function displayKioskByCodeBusyIndicator() {
    $('#kioskByCodeBusy').css("display", "inline");
}

function hideKioskByCodeBusyIndicator() {
    $('#kioskByCodeBusy').css("display", "none");
}

function hideMapLoadingIndicator() {
    $('#mapLoading').css("display", "none");
}

function showMapFailedNotification() {
    $('#mapLoading').val('Mapa se nije mogla učitati. Molimo obavestite administratore sistema.');
}