var area = require('turf-area');
var _ = require('underscore');

module.exports = function(longitudeSpacing, latitudeSpacing, origin, callback) {
  function makeFeature(geom) {
    return {
      type: 'Feature',
      properties: {
        id: getID(),
        area: parseInt(area({
          type: 'Polygon',
          coordinates: geom
        }) / 1000000)
      },
      geometry: {
        type: 'Polygon',
        coordinates: geom
      }
    }
  }


  function getID() {
    id += 1;
    return id;
  }


  function calculateLatitude2(lat1, area) {
    lat1 = lat1 * Math.PI / 180;
    var areaTerm = area / (2 * Math.PI * Math.pow(radius, 2));
    var lat1Term = 1 - Math.sin(lat1);
    var joinTerm = areaTerm - lat1Term + 1;

    return Math.asin(joinTerm) * 180 / Math.PI;
  }


  function findLatitudes(latTarget) {
    // hemisphere === surface area of a hemisphere
    var hemisphere = 2 * Math.PI * Math.pow(radius, 2);
    // Area target === area of a band of latitude given our number of hemisphere cuts
    var areaTarget = hemisphere / latTarget;

    // Find the latitudes that we need to cut at
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


  function fillQuadrant(maxLat, maxLng) {
    var latitudes = [];
    var longitudes = [];

    var latDirection = maxLat > 0 ? 1 : -1;
    var lngDirection = maxLng > 0 ? 1 : -1;

    var currentLat = origin[1];
    var currentLng = origin[0];

    while (Math.abs(currentLat) < Math.abs(maxLat)) {
      latitudes.push(currentLat);
      currentLat += (latitudeSpacing * latDirection);
    }
    while (Math.abs(currentLng) < Math.abs(maxLng)) {
      longitudes.push(currentLng);
      currentLng += (longitudeSpacing * lngDirection);
    }

    for (var i = 0; i < latitudes.length; i++) {
      if (i < latitudes.length - 1) {
        for (var j = 0; j < longitudes.length; j++) {
          if (j < longitudes.length - 1) {
            newFeature(longitudes[j], latitudes[i], longitudes[j + 1], latitudes[i + 1])
          }
        }
      }
    }
  }


  var geojson = {
    type: 'FeatureCollection',
    features: []
  }

  // Radius of earth in km
  var radius = 6371;

  // Assign a unique id to each box
  var id = 0;

  // Default origin of 0,0 if none passed
  origin = (origin) ? origin : [0, 0];

  var quadrants = {
    'ne': {
      maxLat: 90,
      maxLng: 180
    },
    'nw': {
      maxLat: 90,
      maxLng: -180
    },
    'sw': {
      maxLat: -90,
      maxLng: -180
    },
    'se': {
      maxLat: -90,
      maxLng: 180
    }
  }

  // Fill each quadrant with boxes
  Object.keys(quadrants).forEach(function(quad) {
    fillQuadrant(quadrants[quad].maxLat, quadrants[quad].maxLng);
  });

  callback(geojson);

}
