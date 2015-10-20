# Brute Force Equal Area
Generates grids with equal area polygons

## Install

````
npm install https://github.com/UW-Macrostrat/brute-force-equal-area.git
````

## API

#### latitude(longitudeSpacing, latitudeSpacing, callback)

+ `longitudeSpacing` - divide bands of latitude by `x` degrees of longitude
+ `latitudeSpacing` - the number of times a hemisphere should be cut
+ `callback` - a function with a single parameter which is a GeoJSON `FeatureCollection` with the result

#### longitude(latitudeSpacing, cellArea, callback)

Given a latitude spacing and a target cell area, create an equal area grid.

+ `latitudeSpacing` - distance in degrees between bands of latitude. For example, `latitudeSpacing = 5` would produce
lines of latitude at 0, 5, 10, 15, 20...etc degrees.
+ `cellArea` - the target cell area in km^2. The actual result will vary depending on the band of latitude
+ `callback` - a function with a single parameter which is a GeoJSON `FeatureCollection` with the result


## Example usage

````
var bfea = require('brute-force-equal-area');

bfea.latitude(5, 12, function(latGrid) {
  fs.writeFileSync(__dirname + '/latitude_grid.geojson', JSON.stringify(latGrid));
});

bfea.longitude(5, 500000, function(lngGrid) {
  fs.writeFileSync(__dirname + '/longitude_grid.geojson', JSON.stringify(lngGrid));
});


````


## Authors
Andrew Zaffos, John Czaplewski
