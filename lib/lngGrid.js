var area = require('turf-area');
var _ = require('underscore');

module.exports = function(latitudeSpacing, cellArea, callback) {

  function makeFeature(geom, area) {
    return {
      "type": "Feature",
      "properties": {
        "id": getID(),
        "area": area
      },
      "geometry": geom
    }
  }


  function getID() {
    id += 1
    return id
  }


  function buildLatitudePolygon(minLat, maxLat) {
      var minLng = -180;
      var maxLng = 180;

      // We add zeros here to make sure the winding order isn't ambiguous
      var polygon = {
        type: "Polygon",
        coordinates: [[
          [minLng, minLat],
          [minLng, maxLat],
          [0, maxLat],
          [maxLng, maxLat],
          [maxLng, minLat],
          [0, minLat],
          [minLng, minLat]
        ]]
      };

      return polygon;

  }


  function buildPolygon(minLat, maxLat, minLng, maxLng) {
      var polygon = {
        type: "Polygon",
        coordinates: [[
          [minLng, minLat],
          [minLng, maxLat],
          [maxLng, maxLat],
          [maxLng, minLat],
          [minLng, minLat]
        ]]
      };

      return polygon;
  }


  function sortAscending(a, b) {
    return a - b;
  }


  // Brute force to find the best longitude for a given band of latitude
  function bestLongitude(minLat, maxLat, spacing, targetArea) {
    // We handle longitudes in terms of a circle and convert to latlng when creating polygons
    var currentLng = 360;
    var currentArea = 9999999999999;

    // Attempts keeps track of longitudes that we have tried
    var attempts = [];

    // Not going for exact...just close enough
    while (Math.abs(currentArea - targetArea) > 0.00001) {

      // If our last attempt produced an area smaller than our target
      if (currentArea < targetArea) {

        // Try splitting the difference between the current longitude and the next largest already-tried longitude
        // ex: if 90 is too large, and 45 too small, try 67.5
        var above = attempts[attempts.indexOf(currentLng) + 1];
        currentLng = currentLng + ((above - currentLng)/2);

      } else {
        // If we haven't tried this longitude, the next attempt will be half the current
        if (attempts.indexOf(currentLng) < 1) {
          currentLng = currentLng / 2;

        } else {
        // If we have tried it, try splitting the difference between the current longitude and the next smallest already-tried longitude
          var below = attempts[attempts.indexOf(currentLng) - 1];
          currentLng = currentLng - (currentLng - below)/2
        }

      }

      // Record our current longitude and resort the attempts
      if (attempts.indexOf(currentLng) < 0) {
        attempts.push(currentLng);
        attempts.sort(sortAscending);
      }

      var cell = buildPolygon(minLat, maxLat, -180, (currentLng - 180));

      // in km2
      currentArea = parseInt(area(cell))/1000000;
    }


    return currentLng;
  }

  // Keep track of IDs
  var id = 0;

  // output
  var geojson = {
      "type":"FeatureCollection",
      "features": []
  }

  // First get latitudes
  var latitudes = _.range(-90, 90, latitudeSpacing);

  // Divide them up so that it is easier to create bands
  var startLat = latitudes.slice(0, latitudes.length - 1);
  var endLat = latitudes.slice(1, latitudes.length);

  // Get area of each latitudinal band
  var areas = new Array(startLat.length);

  for (var i = 0; i < areas.length; i++) {
    areas[i] = area(buildLatitudePolygon(startLat[i], endLat[i]));
  }

  // Find the unique cell size for each band
  var uniqueAreas = new Array(areas.length);

  for (var i = 0; i < areas.length; i++) {
    var cellArea_m = cellArea * 1000000;
    var remainder = areas[i] % cellArea_m;
    var nCells = Math.floor(areas[i] / cellArea_m);

    uniqueAreas[i] = (cellArea_m + (remainder / nCells))/1000000;
  }

  // Find the width of latitude needed to produce the equal area cells
  var lngSpacings = new Array(areas.length);
  for (var i = 0; i < areas.length; i++) {
    lngSpacings[i] = bestLongitude(startLat[i], endLat[i], latitudeSpacing, uniqueAreas[i]);
  }

  // Create polygons for each band
  for (var i = 0; i < lngSpacings.length; i++) {
    if (lngSpacings[i]) {
      var lng = -180;
      while (lng + lngSpacings[i] <= 181) {
        var geom = buildPolygon(startLat[i], endLat[i], lng, lng + lngSpacings[i]);
        var polygon = makeFeature(geom, area(geom)/1000000);
        geojson.features.push(polygon);
        lng += lngSpacings[i];
      }
    }
  }

  // Return the result
  callback(geojson);
  //return geojson;

}
