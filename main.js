var map = L.map("map").setView([51.505, -0.09], 13);
var marker = L.marker([10.7769, 106.7009]).addTo(map);
var currentRoute;

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

function moveMarker(lat, lng) {
  marker.setLatLng([lat, lng]);
  map.setView([lat, lng], map.getZoom()); // Optionally move the map view
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
        const latlngs = polyline.decode(path);

        // Xóa tuyến đường hiện tại nếu có
        if (currentRoute) {
          map.removeLayer(currentRoute);
        }

        // Vẽ đường đi lên bản đồ
        currentRoute = L.polyline(latlngs, { color: "blue", weight: 5 }).addTo(
          map
        );

        // Fit bản đồ với tuyến đường
        map.fitBounds(currentRoute.getBounds());
      } else {
        alert("Không tìm thấy đường đi");
      }
    })
    .catch((error) => console.error("Error fetching route:", error));
}

setInterval(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      var latlng = [position.coords.latitude, position.coords.longitude];
      moveMarker(latlng[0], latlng[1]);
      findRoute(latlng, [10.046983, 105.767787]);
    });
  } else {
    alert("Trình duyệt không hỗ trợ Geolocation!");
  }
}, 1000);
