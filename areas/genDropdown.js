const areasToFetch = require("./areasToFetch.json");

const destPath = "geojson"
let out = "<select id='citySelect'>";
for (let location of areasToFetch) {


    const filename = destPath + "/" + (location + ".geojson")
        .toLowerCase()
        .replace("ț", "t")
        .replace("ș", "s")
        .replace("â", "a")
        .replace("ă", "a")
        .replace("î", "i")
        .replace("-", "_")
        .replace(" ", "_")
    ;
    let isDefault = "";
    if (location === "București") {
        isDefault = " selected='selected'"
    }
    out += `<option value='${filename}'${isDefault}>${location}</option>`;


}
out += "</select>";
console.log(out)
