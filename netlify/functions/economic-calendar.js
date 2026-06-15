const https = require('https');

exports.handler = async (event) => {
  const apiKey = process.env.JBLANKED_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.jblanked.com',
      path: '/news/api/forex-factory/calendar/week/?currency=USD',
      method: 'GET',
      headers: {
        'Authorization': `Api-Key ${apiKey}`
      }
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ events: parsed.events || parsed, fetchedAt: Date.now(), source: 'live' })
          });
        } catch (e) {
          resolve({
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Parse error', fetchedAt: Date.now() })
          });
        }
      });
    }).on('error', (err) => {
      resolve({
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Fetch failed: ' + err.message })
      });
    }).end();
  });
};
