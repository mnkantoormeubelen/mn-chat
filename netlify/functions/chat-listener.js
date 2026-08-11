// MN Chat - Firebase listener via REST API (geen npm packages nodig)

const FIREBASE_DB_URL = "https://mn-chat-7a6bd-default-rtdb.firebaseio.com";
const ONESIGNAL_APP_ID = "0922fba7-ca4d-4cd9-95e8-8c5b9b846c6c";
const NETLIFY_URL = "https://heartfelt-biscochitos-35decb.netlify.app";

async function getFirebaseToken() {
  // Gebruik Firebase REST API met service account via Google OAuth2
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = "firebase-adminsdk-fbsvc@mn-chat-7a6bd.iam.gserviceaccount.com";
  
  // Maak JWT voor Google OAuth2
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };

  const { createSign } = await import('crypto');
  
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const toSign = `${headerB64}.${payloadB64}`;
  
  const sign = createSign('RSA-SHA256');
  sign.update(toSign);
  const signature = sign.sign(privateKey, 'base64url');
  const jwt = `${toSign}.${signature}`;

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  const tokenData = await tokenResp.json();
  return tokenData.access_token;
}

async function firebaseGet(path, token) {
  const resp = await fetch(`${FIREBASE_DB_URL}/${path}.json?access_token=${token}`);
  return resp.json();
}

async function firebasePut(path, data, token) {
  await fetch(`${FIREBASE_DB_URL}/${path}.json?access_token=${token}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

async function sendPush(osIds, osSubscriptionIds, title, body) {
  const promises = [];
  const onesignalKey = process.env.ONESIGNAL_REST_API_KEY;

  if (osSubscriptionIds?.length) {
    promises.push(fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + onesignalKey },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_subscription_ids: osSubscriptionIds,
        headings: { en: title, nl: title },
        contents: { en: body, nl: body },
        url: NETLIFY_URL,
        priority: 10
      })
    }));
  }

  if (osIds?.length) {
    promises.push(fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + onesignalKey },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_aliases: { onesignal_id: osIds },
        target_channel: 'push',
        headings: { en: title, nl: title },
        contents: { en: body, nl: body },
        url: NETLIFY_URL,
        priority: 10
      })
    }));
  }

  // Telegram
  promises.push(fetch('https://api.callmebot.com/text.php?user=Maartenmnkantoor&text=' + encodeURIComponent('🔔 ' + title + ': ' + body)));

  await Promise.all(promises);
}

exports.handler = async function(event, context) {
  try {
    console.log('Chat listener gestart');

    const token = await getFirebaseToken();
    
    // Haal last check timestamp op
    const lastCheck = await firebaseGet('system/lastNotificationCheck', token) || (Date.now() - 60000);
    const now = Date.now();
    
    // Update timestamp
    await firebasePut('system/lastNotificationCheck', now, token);
    
    // Haal chats op
    const chats = await firebaseGet('chats', token) || {};
    
    let newMessages = [];
    Object.entries(chats).forEach(([chatId, chat]) => {
      if (!chat.messages || chat.status !== 'open') return;
      Object.values(chat.messages).forEach(msg => {
        if (msg.role === 'customer' && msg.timestamp && msg.timestamp > lastCheck && msg.timestamp <= now) {
          newMessages.push({ chatId, text: msg.text, timestamp: msg.timestamp });
        }
      });
    });

    console.log('Nieuwe berichten:', newMessages.length);

    if (newMessages.length > 0) {
      const latest = newMessages.sort((a,b) => b.timestamp - a.timestamp)[0];
      
      // Haal agents op
      const agents = await firebaseGet('agents', token) || {};
      const osIds = Object.values(agents).map(a => a.osId).filter(Boolean);
      const osSubscriptionIds = Object.values(agents).map(a => a.osSubscriptionId).filter(Boolean);
      
      await sendPush(osIds, osSubscriptionIds, 'Nieuw bericht van klant', latest.text.substr(0, 80));
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, newMessages: newMessages.length }) };
  } catch (err) {
    console.error('Fout:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
