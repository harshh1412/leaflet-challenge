// Use the URL of this JSON to pull in the data for the visualization.
let API_endpoint = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// function to select color based on depth of earthquake. Earthquakes with greater depth should appear darker in color.
function Color_Select(d) {
    return d > 90 ? "#1F1108" :
           d > 70 ? "#3D2111" :
           d > 50 ? "#63361B" :
           d > 30 ? "#8A4B25" :
           d > 10 ? "#BA6532" :
                    "#F58340";
}

// Import and visualize the data:
d3.json(API_endpoint).then(data => {
    console.log(data);

    // Using Leaflet, create a map that plots all the earthquakes from your dataset based on their longitude and latitude.
    let earthquakes = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {                               // Your data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color.
                radius: feature.properties.mag * 4,                       // Eartquakes with higher magnitudes should appear larger.
                fillColor: Color_Select(feature.geometry.coordinates[2]), // Hint: The depth of the earth can be found as the third coordinate for each earthquake.
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function (feature, layer) {                        // Include popups that provide additional information about the earthquake when its associated marker is clicked.
            layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr>
                             <p>Time: ${new Date(feature.properties.time)}</p>
                             <p>Magnitude: ${feature.properties.mag}</p>
                             <p>Depth: ${feature.geometry.coordinates[2]} kms</p>`);
        }
    })
    RenderMap(earthquakes);
});

function RenderMap(earthquakes) {

    // Using Leaflet, create base map layers
// Define variables for our tile layers.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Only one base layer can be shown at a time.
let baseMaps = {
  Street: street,
  Topography: topo
};

// Using Leaflet, create overlay map layer showing earthquake events
let overlayMaps = {
  Earthquakes: earthquakes
};

// Create a map object, and set the default layers.
let myMap = L.map("map", {
  center: [38, -98],
  zoom: 5,
  layers: [street, earthquakes]
});

// Pass our map layers into our layer control.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);

// Create a legend that will provide context for your map data.
let legend = L.control({ position: "bottomright" });
   legend.onAdd = function () {
       let div = L.DomUtil.create("div", "legend");
       let grades = [0, 10, 30, 50, 70, 90];

       div.innerHTML = "<h4>Depth (in kms)</h4>";

       // Create a container for the legend items
    let legendItems = "";

        for (let i = 0; i < grades.length; i++) {
            legendItems +=
                '<div><i style="background-color:' + Color_Select(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] : '+') + '</div>';
            }
        
        div.innerHTML += legendItems;
       return div;
   };
   legend.addTo(myMap);
}