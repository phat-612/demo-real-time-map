var map = L.map("map").setView([51.505, -0.09], 13);
var marker = L.marker([10.7769, 106.7009]).addTo(map);
var currentRoute;
var previousLocation = null;
var routeLatLngs = [];

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

function moveMarker(lat, lng) {
  marker.setLatLng([lat, lng]);
  // Optionally move the map view
  // map.setView([lat, lng], map.getZoom());
}

function onLocationFound(e) {
  moveMarker(e.latlng.lat, e.latlng.lng);
}

function onLocationError(e) {
  alert(e.message);
}

map.on("locationfound", onLocationFound);
map.on("locationerror", onLocationError);

map.locate({ setView: true, maxZoom: 16 });

function findRoute(start, end) {
  fetch(
    `https://graphhopper.com/api/1/route?vehicle=car&locale=en&key=LijBPDQGfu7Iiq80w3HzwB4RUDJbMbhs6BU0dEnn&elevation=false&instructions=true&turn_costs=true&point=${start[0]}%2C${start[1]}&point=${end[0]}%2C${end[1]}`
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.paths && data.paths.length > 0) {
        const path = data.paths[0].points;

        // Giải mã chuỗi polyline
        routeLatLngs = polyline.decode(path);

        // Xóa tuyến đường hiện tại nếu có
        if (currentRoute) {
          map.removeLayer(currentRoute);
        }

        // Vẽ đường đi lên bản đồ
        currentRoute = L.polyline(routeLatLngs, {
          color: "blue",
          weight: 5,
        }).addTo(map);

        // Fit bản đồ với tuyến đường
        // map.fitBounds(currentRoute.getBounds());
      } else {
        alert("Không tìm thấy đường đi");
      }
    })
    .catch((error) => console.error("Error fetching route:", error));
}
function haversineDistance(coord1, coord2) {
  const R = 6371e3; // Bán kính Trái Đất tính bằng mét (6371 km)
  const lat1 = (coord1[0] * Math.PI) / 180;
  const lat2 = (coord2[0] * Math.PI) / 180;
  const deltaLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const deltaLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Khoảng cách tính bằng mét
}

function isOffRoute(currentLocation, routeLatLngs, threshold = 15) {
  for (let i = 0; i < routeLatLngs.length; i++) {
    const distance = haversineDistance(currentLocation, routeLatLngs[i]);
    if (distance < threshold) {
      return false;
    }
  }
  return true;
}

setInterval(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      var latlng = [position.coords.latitude, position.coords.longitude];
      moveMarker(latlng[0], latlng[1]);
      if (isOffRoute(latlng, routeLatLngs)) {
        findRoute(latlng, [10.046983, 105.767787]);
      }
      previousLocation = latlng;
    });
  } else {
    alert("Trình duyệt không hỗ trợ Geolocation!");
  }
}, 1000);
