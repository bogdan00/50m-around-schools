import {myjson} from './data.js'

const map = L.map('map', {
    center: [44.429283, 26.103541],
    zoom: 17,
    // minZoom: 16,
    maxZoom: 18
});

const basemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd'
}).addTo(map);

var bufferLayer = L.layerGroup();

var geojsonMarkerOptions = {
    radius: 100,
    fillColor: "#ff7800",
    color: "#000",
    weight: 0.5,
    opacity: 0.2,
    fillOpacity: 0.2,
    interactive: false
};

function getRadius(zoomLevel) {
    const startPx = 200;
    const startZoom = 18;

    return startPx / Math.pow(2, startZoom - zoomLevel)
}

function coordToCircle(latlng) {
    let leafletLatLng = L.latLng(latlng[1], latlng[0]);
    return L.circleMarker(leafletLatLng, {...geojsonMarkerOptions});
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
            circles = layer.feature.geometry.coordinates.flatMap(poly => poly.flatMap(circlesForPolygon));
            break;
        case "Polygon":
            circles = layer.feature.geometry.coordinates.flatMap(circlesForPolygon);
            break;
        default:
            console.log("What to do with", layer.feature.geometry.type)
    }
    circles = circles.filter(item => item)
    layer.bindPopup(`[${layer.feature.geometry.type}] ${layer.feature.properties.name}`);

    return circles
}

const geoJSON = L.geoJSON(myjson, {
    onEachFeature: function (feature, layer) {
        const allCircles = getToAdd(layer)
        const shouldIncludeCircles = []
        const MIN_DISTANCE_ALLOWED = 20;
        for (let i = 0; i < allCircles.length; i++) {
            const currentCircle = allCircles[i];
            let shouldInclude = true;
            for (let j = i + 1; j < allCircles.length; j++) {
                const otherCircle = allCircles[j]
                if (currentCircle.getLatLng().distanceTo(otherCircle.getLatLng()) < MIN_DISTANCE_ALLOWED) {
                    shouldInclude = false;
                    break;
                }
            }
            if (shouldInclude) {
                shouldIncludeCircles.push(currentCircle)
            }
        }
        layer.circles = shouldIncludeCircles;
    }
});
geoJSON.addTo(map);

function redrawCircles() {
    geoJSON.getLayers()
        .flatMap(layer => layer.circles)
        .forEach(circle => circle.setRadius(getRadius(map.getZoom())))
}

// map.on("moveend", redrawCircles)
map.on("zoomend", redrawCircles)

geoJSON.getLayers()
    .flatMap(layer => layer.circles)
    .map(circle => {
        circle.setRadius(getRadius(map.getZoom()))
        return circle
    })
    .forEach(circle => bufferLayer.addLayer(circle))

map.addLayer(bufferLayer)
