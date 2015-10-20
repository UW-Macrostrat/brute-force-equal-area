# Brute Force Equal Area
Generates grids with equal area polygons

## Install

````
npm install bruteForceEqualArea
````

## API

#### latitude(longitudeSpacing, latitudeSpacing)

+ `longitudeSpacing`
+ `latitudeSpacing` - the number of times a hemisphere should be cut

#### longitude(latitudeSpacing, cellArea)

Given a latitude spacing and a target cell area, create an equal area grid.

+ `latitudeSpacing` - distance in degrees between bands of latitude. For example, `latitudeSpacing = 5` would produce
lines of latitude at 0, 5, 10, 15, 20...etc degrees.
+ `cellArea` - the target cell area in km^2. The actual result will vary depending on the band of latitude


## Authors
Andrew Zaffos, John Czaplewski
