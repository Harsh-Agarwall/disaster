// Fetch data from the new USGS endpoint focused on Indian data
const fetchAndDisplayUSGSEarthquakeData = async () => {
    try {
        const response = await fetch('/usgs'); // Assuming '/usgs' is the route for your new USGS data
        const data = await response.json();

        // Clear previous markers if needed
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add markers to the map for each earthquake
        data.forEach(eq => {
            const [longitude, latitude] = eq.coordinates;
            L.marker([latitude, longitude]).addTo(map)
                .bindPopup(`<strong>${eq.title}</strong><br>Magnitude: ${eq.magnitude}<br>Location: ${eq.place}<br>Time: ${new Date(eq.time).toLocaleString()}`);
        });
    } catch (error) {
        console.error('Error fetching USGS data:', error);
    }
};

// Call the function on page load and set up periodic updates
fetchAndDisplayUSGSEarthquakeData();
setInterval(fetchAndDisplayUSGSEarthquakeData, 60000); // Refresh every minute
