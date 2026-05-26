const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('FOUT: ANTHROPIC_API_KEY ontbreekt in environment variables');
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY ontbreekt in Netlify environment variables' }),
    };
  }

  console.log('API key gevonden, lengte:', process.env.ANTHROPIC_API_KEY.length, 'tekens');
  console.log('Begint met:', process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...');

  try {
    const body = event.body;
    console.log('Request body lengte:', body ? body.length : 0, 'tekens');

    const result = await callAnthropic(body);

    console.log('Anthropic antwoord status:', result.status);
    console.log('Anthropic antwoord (eerste 500 tekens):', result.data.substring(0, 500));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: result.data,
    };
  } catch (e) {
    console.log('FOUT in callAnthropic:', e.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message }),
    };
  }
};

function callAnthropic(body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'interleaved-thinking-2025-05-14',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: data }));
    });

    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(body);
    req.end();
  });
}
