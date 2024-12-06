const express = require('express');
const router = express.Router();
const axios = require('axios');

// yha se usgs ka india ka data aarha h
router.get('/', async (req, res) => {
    console.log("Fetching earthquake data...");
    try {
        const response = await axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query', {
            params: {
                format: 'geojson',
                starttime: '2023-01-01',  
                endtime: new Date().toISOString().split('T')[0], 
                minlatitude: 6.0,  // india le liye
                maxlatitude: 36.0,
                minlongitude: 68.0,
                maxlongitude: 97.0,
                minmagnitude: 1.0
            }
        });

        
        if (!response.data || !response.data.features) {
            console.log("No data received from USGS.");
            return res.status(500).json({ message: "No data received from USGS" });
        }

        // Map response data to your preferred format
        const earthquakes = response.data.features.map(eq => ({
            title: eq.properties.title,
            magnitude: eq.properties.mag,
            place: eq.properties.place,
            time: new Date(eq.properties.time),
            coordinates: eq.geometry.coordinates
        }));

        // Uncomment if using MongoDB and model
        // await DisasterData.insertMany(earthquakes, { ordered: false }).catch(err => {});

        res.json(earthquakes);
    } catch (error) {
        console.error('Error fetching USGS data:', error.response?.data || error.message);
        res.status(500).json({ message: "Error fetching USGS data" });
    }
});

module.exports = router;
