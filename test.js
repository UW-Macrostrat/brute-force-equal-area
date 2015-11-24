var grids = require('./index');
var fs = require('fs');

grids.latitude(5, 12, function(latGrid) {
  fs.writeFileSync(__dirname + '/latitude_grid.geojson', JSON.stringify(latGrid));
});

grids.longitude(5, 500000, function(lngGrid) {
  fs.writeFileSync(__dirname + '/longitude_grid.geojson', JSON.stringify(lngGrid));
});


grids.variable(10, 10, [-89,43], function(grid) {
  fs.writeFileSync(__dirname + '/variable_grid.geojson', JSON.stringify(grid));
});
