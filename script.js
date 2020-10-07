import {myjson} from './data.js'

/////////////////
// Set up map //
///////////////
const map = L.map('map', {
    center: [44.429283, 26.103541],
    zoom: 17,
    minZoom: 16,
    maxZoom: 18
});

const basemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd'
}).addTo(map);

///////////////////
// Buffer stuff //
/////////////////

// Function to get buffer distance
// Create empty layer to hold buffer on click
var bufferLayer = L.geoJSON("", {
    fillColor: "#18FFFF",
    fillOpacity: 0.35,
    weight: 0
}).addTo(map);


var geojsonMarkerOptions = {
    radius: 50,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 0.5,
    fillOpacity: 0.5
};

function coordToCircle(latlng, feature) {
    let leafletLatLng = L.latLng(latlng[1], latlng[0]);
    let inView = map.getBounds().contains(leafletLatLng)
    if (!inView) {
        return;
    }
    const circle = L.circleMarker(leafletLatLng, geojsonMarkerOptions);
    if (feature) circle.bindPopup(feature.properties.name);

    return circle;
}

function circlesForPolygon(coords) {
    return coords.map(coord => coordToCircle(coord));
}

function getToAdd(layer) {


    let circles = [];
    switch (layer.feature.geometry.type) {
        case "Point":
            const circle = coordToCircle(layer.feature.geometry.coordinates);
            circles.push(circle)
            break;
        case "GeometryCollection":
            console.warn("unk geometry type", layer.feature.geometry.type);
            break;
        case "LineString":
            console.warn("unk geometry type", layer.feature.geometry.type);
            break;
        case "MultiLineString":
            console.warn("unk geometry type", layer.feature.geometry.type);
            break;
        case "MultiPoint":
            console.warn("unk geometry type", layer.feature.geometry.type);
            break;
        case "MultiPolygon":
            console.warn("multi poly", layer.feature.geometry.type);
            let polyPolyCircles = layer.feature.geometry.coordinates.flatMap(poly => poly.flatMap(circlesForPolygon));
            circles = [...circles, ...polyPolyCircles]
            break;
        case "Polygon":

            let coordinateCircles = layer.feature.geometry.coordinates.flatMap(circlesForPolygon);
            circles = [...circles, ...coordinateCircles]
            break;
        default:
            console.log("What to do with", layer.feature.geometry.type)

    }
    layer.bindPopup(`[${layer.feature.geometry.type}] ${layer.feature.properties.name}`);

    return circles
}

const geoJSON = L.geoJSON(myjson);
geoJSON.addTo(map);

function redrawCircles() {
    bufferLayer.clearLayers()
    // console.log(geoJSON)
    geoJSON.eachLayer(layer => {
        let whatToAdd = getToAdd(layer).filter(item => item);
        whatToAdd.flatMap(circles => circles)
            .forEach(circle => bufferLayer.addLayer(circle))
    })
}

map.on("moveend", redrawCircles)
map.on("zoomend", redrawCircles)
redrawCircles()

// toAdd.forEach(circle => {
//     if (circle._latlng) {
//         circle.addTo(map);
//     } else {
//         debugger
//     }
// })
