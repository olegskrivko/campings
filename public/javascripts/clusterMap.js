var map = tt.map({
  key: TOMTOMTOKEN,
  container: "map",
  center: [-103.128666, 40.505814],
  zoom: 3,
  // dragPan: !isMobileOrTablet()
});
map.addControl(new tt.FullscreenControl());
map.addControl(new tt.NavigationControl());

var markersOnTheMap = {};
var eventListenersAdded = false;

// var points = [
//   {
//     coordinates: [-0.13389631465156526, 51.510387047712356],
//     properties: {
//       id: 1,
//       name: "Checkpoint A",
//     },
//   },
//   {
//     coordinates: [-0.11281231063600217, 51.51807866942707],
//     properties: {
//       id: 2,
//       name: "Checkpoint B",
//     },
//   },
//   {
//     coordinates: [0.04410606135789408, 51.60606293106869],
//     properties: {
//       id: 3,
//       name: "Checkpoint C",
//     },
//   },
//   {
//     coordinates: [0.06813865412814835, 51.6009452260123],
//     properties: {
//       id: 4,
//       name: "Checkpoint D",
//     },
//   },
//   {
//     coordinates: [0.05028587092436965, 51.596253489653066],
//     properties: {
//       id: 5,
//       name: "Checkpoint E",
//     },
//   },
//   {
//     coordinates: [0.026939923659398346, 51.59412072198555],
//     properties: {
//       id: 6,
//       name: "Checkpoint F",
//     },
//   },
//   {
//     coordinates: [0.04822593439902789, 51.58729519243778],
//     properties: {
//       id: 7,
//       name: "Checkpoint G",
//     },
//   },
//   {
//     coordinates: [0.0598989080363026, 51.58516200412868],
//     properties: {
//       id: 8,
//       name: "Checkpoint H",
//     },
//   },
//   {
//     coordinates: [-0.1484370070708394, 51.51355434335747],
//     properties: {
//       id: 9,
//       name: "Checkpoint I",
//     },
//   },
//   {
//     coordinates: [-0.14116666086630403, 51.516268992925035],
//     properties: {
//       id: 10,
//       name: "Checkpoint J",
//     },
//   },
//   {
//     coordinates: [-0.14698293783399663, 51.50857706561709],
//     properties: {
//       id: 11,
//       name: "Checkpoint K",
//     },
//   },
//   {
//     coordinates: [-0.1389855570008649, 51.512649424212185],
//     properties: {
//       id: 12,
//       name: "Checkpoint L",
//     },
//   },
//   {
//     coordinates: [-0.1484370070708394, 51.51581656256633],
//     properties: {
//       id: 13,
//       name: "Checkpoint M",
//     },
//   },
//   {
//     coordinates: [-0.1542532840487354, 51.51400679618595],
//     properties: {
//       id: 14,
//       name: "Checkpoint N",
//     },
//   },
//   {
//     coordinates: [-0.17024804570488072, 51.516268992925035],
//     properties: {
//       id: 15,
//       name: "Checkpoint O",
//     },
//   },
//   {
//     coordinates: [-0.16006956101645642, 51.50857706561709],
//     properties: {
//       id: 16,
//       name: "Checkpoint P",
//     },
//   },
// ];

// var geoJson = {
//   type: "FeatureCollection",
//   features: points.map(function (point) {
//     return {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: point.coordinates,
//       },
//       properties: point.properties,
//     };
//   }),
// };

function refreshMarkers() {
  Object.keys(markersOnTheMap).forEach(function (id) {
    markersOnTheMap[id].remove();
    delete markersOnTheMap[id];
  });

  map.querySourceFeatures("point-source").forEach(function (feature) {
    if (feature.properties && !feature.properties.cluster) {
      var id = parseInt(feature.properties.id, 10);
      if (!markersOnTheMap[id]) {
        var newMarker = new tt.Marker().setLngLat(feature.geometry.coordinates);
        newMarker.addTo(map);
        newMarker.setPopup(
          new tt.Popup({ offset: 30 }).setText(campgrounds.features[0].title)

          // new tt.Popup({ offset: 30 }).setText(feature.properties.name)
        );
        console.log(campgrounds.features[0]);
        // console.log(feature.properties.name);
        markersOnTheMap[id] = newMarker;
      }
    }
  });
}

map.on("load", function () {
  map.addSource("point-source", {
    type: "geojson",
    data: campgrounds,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "point-source",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#EC619F",
        4,
        "#008D8D",
        7,
        "#004B7F",
      ],
      "circle-radius": ["step", ["get", "point_count"], 15, 4, 20, 7, 25],
      "circle-stroke-width": 1,
      "circle-stroke-color": "white",
      "circle-stroke-opacity": 1,
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "point-source",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-size": 16,
    },
    paint: {
      "text-color": "white",
    },
  });

  map.on("data", function (e) {
    if (
      e.sourceId !== "point-source" ||
      !map.getSource("point-source").loaded()
    ) {
      return;
    }

    refreshMarkers();

    if (!eventListenersAdded) {
      map.on("move", refreshMarkers);
      map.on("moveend", refreshMarkers);
      eventListenersAdded = true;
    }
  });

  map.on("click", "clusters", function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
    var clusterId = features[0].properties.cluster_id;
    map
      .getSource("point-source")
      .getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err) {
          return;
        }

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom + 0.5,
        });
      });
  });

  map.on("mouseenter", "clusters", function () {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "clusters", function () {
    map.getCanvas().style.cursor = "";
  });
});
