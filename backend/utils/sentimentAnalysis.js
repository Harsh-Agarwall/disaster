const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const analyzeSentiment = (text) => {
    const result = sentiment.analyze(text);
    return result.score > 0 ? 'Positive' : result.score < 0 ? 'Negative' : 'Neutral';
};

module.exports = { analyzeSentiment };
