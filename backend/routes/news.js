const express = require('express');
const router = express.Router();
const axios = require('axios');
const { analyzeSentiment } = require('../utils/sentimentAnalysis');

router.get('/:keyword', async (req, res) => {
    const { keyword } = req.params;
    try {
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${keyword}&apiKey=f62fb5f12a0a462da4deb25e9b0ff8a4`);

        const sentimentResults = response.data.articles.map(article => ({
            title: article.title,
            sentiment: analyzeSentiment(article.title),
        }));
        res.json(sentimentResults);
    } catch (error) {
        res.status(500).json({ message: "Error fetching News data" });
    }
});

module.exports = router;
