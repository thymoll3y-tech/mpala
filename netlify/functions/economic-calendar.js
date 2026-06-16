const https = require('https');

exports.handler = async (event) => {
  const apiKey = process.env.JBLANKED_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const end = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const path = `/news/api/forex-factory/calendar/range/?currency=USD&from=${today}&to=${end}`;

  return new Promise((resolve) => {
    const options = {
      hostname: 'www.jblanked.com',
      path,
      method: 'GET',
      headers: { 'Authorization': `Api-Key ${apiKey}` }
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
            body: JSON.stringify({ error: 'Parse error', raw: data.slice(0, 200) })
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