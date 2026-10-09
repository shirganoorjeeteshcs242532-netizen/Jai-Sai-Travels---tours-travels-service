const https = require('https');

const query = encodeURIComponent('JAI SAI TRAVELS { Rent-A-Car} 092243 95804');
const url = `https://www.google.com/search?q=${query}&hl=en`;

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
  }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    // Check for "Write a review" or lrd or maps.app.goo.gl or place link
    const reviewMatches = body.match(/https:\/\/[^\s"']+writereview[^\s"']+/g);
    console.log('Write review matches:', reviewMatches);

    const lrd = body.match(/0x[a-f0-9]+:0x[a-f0-9]+/gi);
    console.log('lrd/cids:', lrd);

    const placeLinks = body.match(/https:\/\/www\.google\.com\/maps\/place\/[^\s"']+/g);
    console.log('Place links:', placeLinks);

    const gooGl = body.match(/https:\/\/maps\.app\.goo\.gl\/[^\s"']+/g);
    console.log('maps.app.goo.gl:', gooGl);
  });
});
