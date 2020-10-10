var fs = require('fs');
const path = require('path');

const fetch = require("node-fetch");
var osmtogeojson = require('osmtogeojson');
const areasToFetch = require("./areasToFetch.json");
const destPath = "../geojson"

async function nameToId(name) {
    const url = "https://nominatim.openstreetmap.org/search?X-Requested-With=overpass-turbo&format=json&q=" + encodeURIComponent(name + ", Romania")
    const res = await fetch(url, {})
    const data = await res.json();
    let ref = data.filter(item => {
        return item.osm_type && item.osm_id && item.osm_type !== "node";
    })[0];
    let area_ref = 1 * ref.osm_id;
    if (ref.osm_type === "way") area_ref += 2400000000;
    if (ref.osm_type === "relation") area_ref += 3600000000;
    return area_ref;
}

async function getLocationJson(location) {
    const locationId = await nameToId(location)

    const res = await fetch("https://overpass-api.de/api/interpreter", {
        "referrer": "https://overpass-turbo.eu/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "data=%5Bout%3Ajson%5D%5Btimeout%3A600%5D%3B%0A%0Aarea(" + locationId + ")-%3E.searchArea%3B%0A%2F%2F+gather+results%0A(%0A++node%5B%22amenity%22%3D%22school%22%5D(area.searchArea)%3B%0A++node%5B%22amenity%22%3D%22kindergarten%22%5D(area.searchArea)%3B%0A++node%5B%22amenity%22%3D%22college%22%5D(area.searchArea)%3B%0A++node%5B%22amenity%22%3D%22university%22%5D(area.searchArea)%3B%0A++%0A++%0A++way%5B%22amenity%22%3D%22school%22%5D(area.searchArea)%3B%0A++way%5B%22amenity%22%3D%22kindergarten%22%5D(area.searchArea)%3B%0A++way%5B%22amenity%22%3D%22college%22%5D(area.searchArea)%3B%0A++way%5B%22amenity%22%3D%22university%22%5D(area.searchArea)%3B%0A++%0A++%0A++relation%5B%22amenity%22%3D%22school%22%5D(area.searchArea)%3B%0A++relation%5B%22amenity%22%3D%22kindergarten%22%5D(area.searchArea)%3B%0A++relation%5B%22amenity%22%3D%22college%22%5D(area.searchArea)%3B%0A++relation%5B%22amenity%22%3D%22university%22%5D(area.searchArea)%3B%0A++%0A++%0A++node%5B%22building%22%3D%22school%22%5D(area.searchArea)%3B%0A++way%5B%22building%22%3D%22school%22%5D(area.searchArea)%3B%0A++relation%5B%22building%22%3D%22school%22%5D(area.searchArea)%3B%0A++%0A++%0A)%3B%0A%2F%2F+print+results%0Aout+meta%3B%0A%3E%3B%0Aout+meta+qt%3B",
        "method": "POST",
        "mode": "cors"
    });

    return await res.json();
}

function log(start, action = `processing`, location) {
    const diff = (new Date().getTime() - start.getTime()) / 1000
    console.log(`[${diff} s] ${action}: ${location}`)
}

async function processLocation(location) {
    const start = new Date();

    log(start, `processing`, location);
    const data = await getLocationJson(location)

    log(start, `converting`, location);
    const converted = osmtogeojson(data);

    let filename = location
            .toLowerCase()
            .replace("ț", "t")
            .replace("ș", "s")
            .replace("â", "a")
            .replace("ă", "a")
            .replace("î", "i")
            .replace("-", "_")
            .replace(/[^_a-zA-Z]+/giu, "_")
        + ".geojson"
    ;
    log(start, `writing file`, filename);
    fs.writeFileSync(path.join(destPath, filename), JSON.stringify(converted, null, 2))

    log(start, `finish processing`, location);
    console.log("================================")
}

(async () => {
    try {
        fs.mkdirSync(destPath)
    } catch (e) {
    }
    for (let location of areasToFetch) {
        await processLocation(location);
    }

    console.log("done")
})()
//
