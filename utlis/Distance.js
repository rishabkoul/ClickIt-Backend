function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295; // Math.PI / 180
  var c = Math.cos;
  var a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function distanceSort(array, lat, lon) {
  array.sort(function (a, b) {
    let distanceA = distance(lat, lon, a.lat, a.lon);
    let distanceB = distance(lat, lon, b.lat, b.lon);

    if (distanceA < distanceB) {
      return -1;
    } else if (distanceA > distanceB) {
      return 1;
    } else {
      return 0;
    }
  });

  return array;
}

module.exports.distance = distance;
module.exports.distanceSort = distanceSort;
