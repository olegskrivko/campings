tt.setProductInfo("Pet finder", "1.0");
let size = 50;
var map = tt.map({
  key: TOMTOMTOKEN,
  container: "map",
  center: campground.geometry.coordinates,
  zoom: 10,
});
map.addControl(new tt.FullscreenControl());
map.addControl(new tt.NavigationControl());

map.on("load", () => {
  let div = document.createElement("div");
  div.innerHTML = `<h3>${campground.title}</h3><p>${campground.location}</p>`;
  let popup = new tt.Popup({
    closeButton: false,
    offset: size,
    anchor: "bottom",
  }).setDOMContent(div);

  let border = document.createElement("div");
  border.className = "marker-border";

  let marker = new tt.Marker({
    element: border,
  })
    .setLngLat(campground.geometry.coordinates)
    .setPopup(popup);
  marker.addTo(map);
});
