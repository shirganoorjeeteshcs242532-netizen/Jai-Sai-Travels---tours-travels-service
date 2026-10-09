const https = require('https');

const query = encodeURIComponent('JAI SAI TRAVELS { Rent-A-Car} Harmony Mall Goregaon West Mumbai');
const url = `https://www.google.com/search?q=${query}&hl=en`;

const req = https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, res => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    // Look for data-pid, data-cid, data-fid, review dialog links
    const lrdMatches = html.match(/data-lrd="([^"]+)"/g) || html.match(/lrd=([^"&]+)/g);
    console.log('LRD matches:', lrdMatches);

    const dataPid = html.match(/data-pid="([^"]+)"/g);
    console.log('data-pid:', dataPid);

    const kgmid = html.match(/\/g\/[a-zA-Z0-9_]+/g);
    console.log('kgmid:', kgmid);

    const reviewBtn = html.match(/https:\/\/search\.google\.com\/local\/writereview[^\s"']+/g);
    console.log('Review URLs:', reviewBtn);

    const mapsMatches = html.match(/https:\/\/maps\.google\.com\/maps[^\s"']+/g);
    console.log('Maps URLs:', mapsMatches);
  });
});
req.on('error', err => console.error(err));
