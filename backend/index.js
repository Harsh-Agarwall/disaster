const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/usgs', require('./routes/usgs.js'));
app.use('/twitter', require('./routes/twitter.js'));
app.use('/news', require('./routes/news.js'));
app.post('/predict', (req, res) => {
    console.log("inside predict");
    const { magnitude, depth, distance_to_nearest_city } = req.body;
    console.log("got the data");

    // Spawn Python process
    const pythonProcess = spawn('python', ['../model/model.py', magnitude, depth, distance_to_nearest_city]);
console.log("j");
    // Capture output from Python script
    let prediction = '';
    pythonProcess.stdout.on('data', (data) => {
        prediction += data.toString();
    });
    console.log(prediction);

    pythonProcess.stderr.on('data', (data) => {
        console.error('Error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            res.json({ severity: prediction.trim() });
        } else {
            res.status(500).send('Error predicting severity');
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
