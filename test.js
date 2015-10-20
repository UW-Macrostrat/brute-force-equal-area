var grids = require('./index');
var fs = require('fs');

var latGrid = grids.latitude(5, 12);
var lngGrid = grids.longitude(5, 500000)

fs.writeFileSync(__dirname + '/latitude_grid.geojson', JSON.stringify(latGrid));
fs.writeFileSync(__dirname + '/longitude_grid.geojson', JSON.stringify(lngGrid));
