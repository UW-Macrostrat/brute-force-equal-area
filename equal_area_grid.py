import json
import copy
import math

def makeFeature():
  return {
    "type": "Feature",
    "properties": {
      "id": getID()
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": []
    }
  }


def getID():
    global id
    id += 1
    return id


def calc_lat2(lat1, area):
    lat1 = lat1 * math.pi / 180
    area_term = area/(2 * math.pi * radius**2)
    lat1_term = 1 - math.sin(lat1)
    join_term = area_term - lat1_term + 1
    lat2 = math.asin(join_term)
    lat2 = lat2 * 180 / math.pi

    return lat2


def find_lats(lat_target):
    hemisphere = 2 * math.pi * radius**2
    area_target = hemisphere / lat_target
    output_coords = [0]

    latitude1 = 0

    while latitude1 < 89:
        try:
            latitude1 = calc_lat2(latitude1, area_target)
            output_coords.append(latitude1)
        except:
            output_coords.append(90)
            latitude1 = 90

    return output_coords


def newFeature(min_lng, min_lat, max_lng, max_lat):
    feature = makeFeature()
    feature["geometry"]["coordinates"] = [[
        [min_lng, min_lat],
        [min_lng, max_lat],
        [max_lng, max_lat],
        [max_lng, min_lat],
        [min_lng, min_lat]
    ]]
    geojson["features"].append(feature)



geojson = {
    "type":"FeatureCollection",
    "features": []
}

# Divide bands of latitude every x degrees of longitude
longitude_spacing = 5

# Radius of earth in km
radius = 6371

# Counters
lng = 0
id = 0

# Get a list of latitudes to iterate over
## Input value is the number of bands of latitude a hemisphere should be divided into
lats = find_lats(12)

while lng < 180:
    for latidx, lat in enumerate(lats):

        if latidx <= len(lats) - 2:
            # NE
            newFeature(lng, lat, lng + longitude_spacing, lats[latidx + 1])

            # NW
            newFeature(-lng, lat, -lng - longitude_spacing, lats[latidx + 1])

            # SE
            newFeature(lng, -lat, lng + longitude_spacing, -lats[latidx + 1])

            #SW
            newFeature(-lng, -lat, -lng - longitude_spacing, -lats[latidx + 1])

    # Increment
    lng += longitude_spacing

# Write the geojson out
with open("grid.geojson", "w") as out_geojson:
    json.dump(geojson, out_geojson)
