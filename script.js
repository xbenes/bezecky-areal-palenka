(function () {

// guess base to run universally on both localhost and github pages
// and make sure it does not have trailing /
var base = (window.location.pathname || '').replace(/\/$/, '');

var htmlMapId = 'map'; // index.html binding
var htmlButtonsGroupClass = 'buttons'; // index.html binding

var minLon = 15.9988;
var maxLon = 16.1130;
var minLat = 50.4763;
var maxLat = 50.5045;
var minZoom = 13;
var maxZoom = 15;
var centerLat = (minLat + maxLat) / 2;
var centerLon = (minLon + maxLon) / 2;
var initZoom = 15;

var initialMapConfig = {
    x: centerLon,
    y: centerLat,
    zoom: initZoom
};

var trackDefinitions = [
    { filename: 'tracks/1-cerna.gpx',  color: '#000', title: 'Černá', length: '800m' },
    { filename: 'tracks/2-zluta.gpx',  color: '#d19801', title: 'Žlutá', length: '1500m' },
    { filename: 'tracks/3-svmodra.gpx',  color: '#9dc7ef', title: 'Světle modrá', length: '2000m' },
    { filename: 'tracks/4-zelena.gpx',  color: '#73945f', title: 'Zelená', length: '3000m' },
    { filename: 'tracks/5-tmmodra.gpx',  color: '#0657a8', title: 'Tmavě modrá', length: '5000m' },
    { filename: 'tracks/6-fialova.gpx',  color: '#502737', title: 'Fialová', length: '8000m' }
];

var buttonCreatorConfig = {
    contextClass: htmlButtonsGroupClass,
    buttonClass: 'track-button',
    visualClass: 'btn btn-sm btn-secondary',
    activeClass: 'btn-dark'
};

var lMap = createMap(htmlMapId, initialMapConfig);

addAllTracks(lMap, trackDefinitions).then(function(loadedTracks) {
    createButtonsForLoadedTracks(lMap, loadedTracks, buttonCreatorConfig);
});

function createMap(elementId, mapConfig) {
    var map = L.map('map', {
        center: [centerLat, centerLon],
        zoom: initZoom,
        maxBoundsViscosity: 1.0
    });

    var corner1 = L.latLng(minLat, minLon);
    var corner2 = L.latLng(maxLat, maxLon);
    var bounds = L.latLngBounds(corner1, corner2);
    map.setMaxBounds(bounds);
    map.setMinZoom(minZoom);
    map.setMaxZoom(maxZoom);

    // this would render directly against openstreetmap servers
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

    L.tileLayer(base + '/tiles/512/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: maxZoom
    }).addTo(map);

    // map.on('click', function(e) {
    //     console.log(`${e.latlng.lat} ${e.latlng.lng} ${map.getZoom()}`);
    // });

    return map;
}

function addAllTracks(map, tracks) {
    var trackPromises = tracks.map(function(track) {
        return addTrack(map, track);
    });

    return Promise.all(trackPromises);
}

function addTrack(map, track) {
    return fetch(track.filename).then(function(response) {
        return response.text();
    }).then(function(text) {
        var gpx = new L.GPX(text, {
            markers: {
                startIcon: undefined,
                endIcon: undefined,
                wptIcons: {},
                wptTypeIcons: {},
                pointMatchers: []
            },
            polyline_options: {
                color: track.color,
                weight: 4
            },
        });
        var gpxOutline = new L.GPX(text, {
            markers: {
                startIcon: undefined,
                endIcon: undefined,
                wptIcons: {},
                wptTypeIcons: {},
                pointMatchers: []
            },
            polyline_options: {
                color: "white",
                weight: 9,
                opacity: 0.8
            },
        });
        gpxOutline.addTo(map);
        gpx.addTo(map);
        return {
            gpx: gpx,
            gpxOutline: gpxOutline,
            definition: track
        };
    });
}

function createButtonsForLoadedTracks(map, loadedTracks, buttonDOMConfig) {
    var buttons = loadedTracks.map(function(loadedTrack) {
        return addTrackButton(map, loadedTrack, loadedTracks, buttonDOMConfig);
    });

    switchTrack(map, loadedTracks[0], buttons[0], loadedTracks, buttonDOMConfig);
}

function addTrackButton(map, loadedTrack, loadedTracks, buttonDOMConfig) {
    return createButton(
        getHTMLTrackTitle(loadedTrack.definition),
        buttonDOMConfig,
        function(event) {
            var button = event.currentTarget;
            switchTrack(map, loadedTrack, button, loadedTracks, buttonDOMConfig);
        }
    );
}

function switchTrack(map, loadedTrack, trackButton, loadedTracks, buttonDOMConfig) {
    activateTrack(map, loadedTrack, loadedTracks);
    activateButton(trackButton, buttonDOMConfig);
}

function activateTrack(map, loadedTrack, loadedTracks) {
    loadedTracks.forEach(function(loadedTrack) {
        disableTrack(map, loadedTrack);
    });
    enableTrack(map, loadedTrack);
}

function activateButton(button, buttonDOMConfig) {
    var buttonsSelector = joinWithSpace(
        dotPrefix(buttonDOMConfig.contextClass),
        dotPrefix(buttonDOMConfig.buttonClass)
    );
    var buttons = document.querySelectorAll(buttonsSelector);

    buttons.forEach(function(b) {
        b.classList.remove(buttonDOMConfig.activeClass);
    });
    button.classList.add(buttonDOMConfig.activeClass);
}

function createButton(html, buttonDOMConfig, onClickFn) {
    var button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = html;
    button.className = joinWithSpace(buttonDOMConfig.buttonClass, buttonDOMConfig.visualClass);
    button.onclick = onClickFn;

    var contextElement = document.querySelector(dotPrefix(buttonDOMConfig.contextClass));
    contextElement.appendChild(button);

    return button;
}

function enableTrack(map, track) {
    map.addLayer(track.gpxOutline);
    map.addLayer(track.gpx);
}

function disableTrack(map, track) {
    map.removeLayer(track.gpx);
    map.removeLayer(track.gpxOutline);
}

function getHTMLTrackTitle(track) {
    return '<div class="track-title">' +
        '<span class="track-title-section section-1">' + track.title + '</span> ' +
        '<span class="track-title-section section-2">' + track.length + '</span> ' +
        '<span class="track-title-section section-3">' + getHTMLTrackSign(track.color) + '</span> ' +
        '</div>';
}

function getHTMLTrackSign(color) {
    return '<div class="track-sign">' +
        '<div class="track-sign-top"></div>' +
        '<div class="track-sign-color" style="background: '+ color +'"></div>' +
        '<div class="track-sign-bottom"></div>' +
        '</div>';
}

function joinWithSpace(firstClass, secondClass) {
    return firstClass + ' ' + secondClass;
}

function dotPrefix(className) {
    return '.' + className;
}

})();
