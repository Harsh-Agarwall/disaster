

const fetchAndDisplayData = async () => {
    const [ twitterData, newsData] = await Promise.all([
        
        fetch('http://localhost:5000/twitter/earthquake').then(res => res.json()),
        fetch('http://localhost:5000/news/earthquake').then(res => res.json())
    ]);



    // Process Twitter Sentiment
    const tweetList = document.getElementById('tweets');
    // tweetList.innerHTML = ''  // Clear existing tweets
    twitterData.forEach(tweet => {
        const listItem = document.createElement('li');
        listItem.textContent = tweet.text;
        listItem.className = tweet.sentiment.toLowerCase();
        tweetList.appendChild(listItem);
    });

    // sentiment
    const positiveTweets = twitterData.filter(t => t.sentiment === 'Positive').length;
    const negativeTweets = twitterData.filter(t => t.sentiment === 'Negative').length;
    const neutralTweets = twitterData.length - positiveTweets - negativeTweets;

    new Chart(document.getElementById('sentimentChart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['Positive', 'Negative', 'Neutral'],
            datasets: [{
                data: [positiveTweets, negativeTweets, neutralTweets],
                backgroundColor: ['green', 'red', 'gray']
            }]
        }
    });
};


fetchAndDisplayData();
setInterval(fetchAndDisplayData, 600000);  // Refresh every minute
