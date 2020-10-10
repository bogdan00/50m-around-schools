This project is a little mashup used to display amneties from OpenStreetMaps visually. [View here](https://bogdan00.github.io/area-around-schools/) 

Steps to reproduce:
* visit https://overpass-turbo.eu/
* set screen to something reasonable, this will act as a filtering bounding box
* use query: 
```
[out:json][timeout:600];

{{geocodeArea:Romania}}->.searchArea;
// gather results
(
  node["amenity"="school"](area.searchArea);
  node["amenity"="kindergarten"](area.searchArea);
  node["amenity"="college"](area.searchArea);
  node["amenity"="university"](area.searchArea);
  
  
  way["amenity"="school"](area.searchArea);
  way["amenity"="kindergarten"](area.searchArea);
  way["amenity"="college"](area.searchArea);
  way["amenity"="university"](area.searchArea);
  
  
  relation["amenity"="school"](area.searchArea);
  relation["amenity"="kindergarten"](area.searchArea);
  relation["amenity"="college"](area.searchArea);
  relation["amenity"="university"](area.searchArea);
  
  
  node["building"="school"](area.searchArea);
  way["building"="school"](area.searchArea);
  relation["building"="school"](area.searchArea);
  
);
// print results
out meta;
>;
out meta qt;
```
which basically filters for those four amenities as a node/way/relation
* export as GeoJson
* use the excellent LeafletJS library for visualisation
 
