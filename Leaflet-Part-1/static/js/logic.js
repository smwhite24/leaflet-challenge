
   // Function to determine marker size based on magnitude
function getMarkerSize(magnitude) {
    return magnitude ? magnitude * 4 : 1; // Adjust size multiplier as needed
}
// Function to determine marker size based on magnitude
function getMarkerSize(magnitude) {
    return magnitude ? magnitude * 4 : 1; // Adjust size multiplier as needed
}

// Function to determine color based on depth
function getColor(depth) {
    const thresholds = [
        { limit: 90, color: '#ff0000' }, // Deep
        { limit: 70, color: '#ff0000' }, // Deep
        { limit: 50, color: '#ffbf00' }, // Moderate
        { limit: 30, color: '#ffbf00' }, // Moderate
        { limit: 10, color: '#ffffb2' }, // Shallow
    ];

    for (let i = 0; i < thresholds.length; i++) {
        if (depth > thresholds[i].limit) {
            return thresholds[i].color;
        }
    }
    return '#ff0000'; // Default color if no conditions are met
}

// Initialize the map
let map = L.map('map').setView([37.09, -95.71], 5); // Center the map on the US

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch significant earthquake data from the USGS GeoJSON feed using D3
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson')
    .then(data => {
        // Loop through the features in the GeoJSON data
        data.features.forEach(feature => {
            let coords = feature.geometry.coordinates;
            let magnitude = feature.properties.mag;
            let depth = coords[2]; // Depth is the third coordinate
            let popupContent = `<h3>${feature.properties.title}</h3><p>Magnitude: ${magnitude}<br>Depth: ${depth} km</p>`;

            // Create a circle marker for each earthquake
            L.circleMarker([coords[1], coords[0]], {
                radius: getMarkerSize(magnitude),
                fillColor: getColor(depth),
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup(popupContent).addTo(map);
        });

        // Create a legend
        let legend = L.control({ position: 'bottomright' });

        legend.onAdd = function () {
            let div = L.DomUtil.create('div', 'info legend');
            let depths = [0, 10, 30, 50, 70, 90];
            let labels = [];

            // Loop through depth intervals and generate a label with a colored square
            for (let i = 0; i < depths.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
                    depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km' : '+ km') + '<br>';
            }
            return div;
        };

        legend.addTo(map);
    })
    .catch(error => {
        console.error("Error fetching earthquake data: ", error);
    });