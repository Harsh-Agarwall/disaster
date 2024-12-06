const express = require('express');
const router = express.Router();
const axios = require('axios');
const { analyzeSentiment } = require('../utils/sentimentAnalysis');

router.get('/:keyword', async (req, res) => {
    console.log("h");
    const { keyword } = req.params;
    try {
        const response = await axios.get(`https://api.twitter.com/2/tweets/search/recent?query=${keyword}`, {
            headers: { Authorization: `Bearer AAAAAAAAAAAAAAAAAAAAAGl7wwEAAAAANLMa0RhGkqmsR%2FfE2z%2BJmTphTOM%3D8ruxrbLKypHFfOXDTMq1XNsuWZgrWIYQGWYAKFjaXfuTkrM9Cn` }
        });

        const sentimentResults = response.data.data.map(tweet => ({
            text: tweet.text,
            sentiment: analyzeSentiment(tweet.text)
        }));
        res.json(sentimentResults);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Twitter data" });
    }
});

module.exports = router;
