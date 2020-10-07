this project is a little mashup used to display amneties from OpenStreetMaps visually

Steps to reproduce:
* visit https://overpass-turbo.eu/
* set screen to something reasonable, this will act as a filtering bounding box
* use query: 
```
[out:xml][timeout:25];
// gather results
(
  node["amenity"="school"]({{bbox}});
  node["amenity"="kindergarten"]({{bbox}});
  node["amenity"="college"]({{bbox}});
  node["amenity"="university"]({{bbox}});
  
  
  way["amenity"="school"]({{bbox}});
  way["amenity"="kindergarten"]({{bbox}});
  way["amenity"="college"]({{bbox}});
  way["amenity"="university"]({{bbox}});
  
  
  relation["amenity"="school"]({{bbox}});
  relation["amenity"="kindergarten"]({{bbox}});
  relation["amenity"="college"]({{bbox}});
  relation["amenity"="university"]({{bbox}});
  
);
// print results
out meta;
>;
out meta qt;
```
which basically filters for those four amenities as a node/way/relation
* export as GeoJson
* use the excellent LeafletJS library for visualisation
 
