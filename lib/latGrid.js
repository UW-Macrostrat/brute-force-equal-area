var area = require('turf-area');
var _ = require('underscore');

module.exports = function(longitudeSpacing, latitudeSpacing, callback) {
  function makeFeature(geom) {
    return {
      "type": "Feature",
      "properties": {
        "id": getID(),
        "area": parseInt(area({
          "type": "Polygon",
          "coordinates": geom
        }) / 1000000)
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": geom
      }
    }
  }


  function getID() {
    id += 1
    return id
  }


  function calculateLatitude2(lat1, area) {
    lat1 = lat1 * Math.PI / 180;
    var areaTerm = area / (2 * Math.PI * Math.pow(radius, 2));
    var lat1Term = 1 - Math.sin(lat1);
    var joinTerm = areaTerm - lat1Term + 1;

    return Math.asin(joinTerm) * 180 / Math.PI;
  }


  function findLatitudes(latTarget) {
    var hemisphere = 2 * Math.PI * Math.pow(radius, 2);
    var areaTarget = hemisphere / latTarget;
    var outputCoords = [0];

    var latitude1 = 0;

    while (latitude1 < 89) {
      try {
        latitude1 = calculateLatitude2(latitude1, areaTarget);
        outputCoords.push(latitude1);
      } catch (error) {
        outputCoords.push(90);
        latitude1 = 90;
      }
    }

    return outputCoords;

  }

  function newFeature(minLng, minLat, maxLng, maxLat) {
    minLng = parseFloat(minLng);
    minLat = parseFloat(minLat);
    maxLng = parseFloat(maxLng);
    maxLat = parseFloat(maxLat);

    geojson.features.push(
      makeFeature([[
          [minLng, minLat],
          [minLng, maxLat],
          [maxLng, maxLat],
          [maxLng, minLat],
          [minLng, minLat]
      ]])
    )
  }

  var geojson = {
    "type":"FeatureCollection",
    "features": []
  }

  // Radius of earth in km
  var radius = 6371;

  var lng = 0;
  var id = 0;

  var lats = findLatitudes(latitudeSpacing);

  while (lng < 180) {
    for (var i = 0; i < lats.length; i++) {
      if (i < lats.length - 2) {
        // NE
        newFeature(lng, lats[i], lng + longitudeSpacing, lats[i + 1]);

        // NW
        newFeature(-lng, lats[i], -lng - longitudeSpacing, lats[i + 1]);

        // SE
        newFeature(lng, -lats[i], lng + longitudeSpacing, -lats[i + 1]);

        // SW
        newFeature(-lng, -lats[i], -lng - longitudeSpacing, -lats[i + 1]);
      }
    }

    lng += longitudeSpacing;
  }

  callback(geojson);
  //return geojson;
}
