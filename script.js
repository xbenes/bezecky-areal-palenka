var htmlMapId = 'map'; // index.html binding
var htmlButtonsGroupClass = 'buttons'; // index.html binding

var initialMapConfig = {
    x: 16.0549649,
    y: 50.4876520,
    zoom: 15
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

var sMap = createMap(htmlMapId, initialMapConfig);

addAllTracks(sMap, trackDefinitions).then(function(loadedTracks) {
    createButtonsForLoadedTracks(loadedTracks, buttonCreatorConfig);
});

function createMap(elementId, mapConfig) {
    var center = SMap.Coords.fromWGS84(mapConfig.x, mapConfig.y);
    var map = new SMap(JAK.gel(elementId), center, mapConfig.zoom);
    map.addControl(new SMap.Control.Sync());
    map.addDefaultLayer(SMap.DEF_TURIST).enable();

    var mouse = new SMap.Control.Mouse(SMap.MOUSE_PAN | SMap.MOUSE_WHEEL | SMap.MOUSE_ZOOM);
    map.addControl(mouse);

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
        var xmlDoc = JAK.XML.createDocument(text);
        var options = { colors:[ track.color ] };
        var gpx = new SMap.Layer.GPX(xmlDoc, null, options);
        map.addLayer(gpx);
        return {
            gpx: gpx,
            definition: track
        };
    });
}

function createButtonsForLoadedTracks(loadedTracks, buttonDOMConfig) {
    var buttons = loadedTracks.map(function(loadedTrack) {
        return addTrackButton(loadedTrack, loadedTracks, buttonDOMConfig);
    });

    switchTrack(loadedTracks[0], buttons[0], loadedTracks, buttonDOMConfig);
}

function addTrackButton(loadedTrack, loadedTracks, buttonDOMConfig) {
    return createButton(
        getHTMLTrackTitle(loadedTrack.definition),
        buttonDOMConfig,
        function(event) {
            var button = event.currentTarget;
            switchTrack(loadedTrack, button, loadedTracks, buttonDOMConfig);
        }
    );
}

function switchTrack(loadedTrack, trackButton, loadedTracks, buttonDOMConfig) {
    activateTrack(loadedTrack, loadedTracks);
    activateButton(trackButton, buttonDOMConfig);
}

function activateTrack(loadedTrack, loadedTracks) {
    loadedTracks.forEach(disableTrack);
    enableTrack(loadedTrack);
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

function enableTrack(track) {
    track.gpx.enable();
}

function disableTrack(track) {
    track.gpx.disable();
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
