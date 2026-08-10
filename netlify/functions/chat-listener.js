const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

let db;

function initFirebase() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: "mn-chat-7a6bd",
        clientEmail: "firebase-adminsdk-fbsvc@mn-chat-7a6bd.iam.gserviceaccount.com",
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
      databaseURL: "https://mn-chat-7a6bd-default-rtdb.firebaseio.com"
    });
  }
  return getDatabase();
}

async function sendNotifications(db, title, body) {
  const agentsSnap = await db.ref('agents').once('value');
  const agents = agentsSnap.val() || {};
  
  const osIds = Object.values(agents).map(a => a.osId).filter(Boolean);
  const osSubscriptionIds = Object.values(agents).map(a => a.osSubscriptionId).filter(Boolean);
  
  console.log('Stuur naar', osIds.length, 'agents');

  const promises = [];

  if (osSubscriptionIds.length) {
    promises.push(fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + process.env.ONESIGNAL_REST_API_KEY },
      body: JSON.stringify({
        app_id: '0922fba7-ca4d-4cd9-95e8-8c5b9b846c6c',
        include_subscription_ids: osSubscriptionIds,
        headings: { en: title, nl: title },
        contents: { en: body, nl: body },
        url: 'https://heartfelt-biscochitos-35decb.netlify.app',
        priority: 10
      })
    }));
  }

  if (osIds.length) {
    promises.push(fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + process.env.ONESIGNAL_REST_API_KEY },
      body: JSON.stringify({
        app_id: '0922fba7-ca4d-4cd9-95e8-8c5b9b846c6c',
        include_aliases: { onesignal_id: osIds },
        target_channel: 'push',
        headings: { en: title, nl: title },
        contents: { en: body, nl: body },
        url: 'https://heartfelt-biscochitos-35decb.netlify.app',
        priority: 10
      })
    }));
  }

  promises.push(fetch('https://api.callmebot.com/text.php?user=Maartenmnkantoor&text=' + encodeURIComponent('🔔 ' + title + ': ' + body)));

  await Promise.all(promises);
  console.log('Alle meldingen verstuurd');
}

exports.handler = async function(event, context) {
  try {
    console.log('Chat listener gestart');
    
    db = initFirebase();
    
    const lastCheckSnap = await db.ref('system/lastNotificationCheck').once('value');
    const lastCheck = lastCheckSnap.val() || (Date.now() - 60000);
    const now = Date.now();
    
    await db.ref('system/lastNotificationCheck').set(now);
    
    const chatsSnap = await db.ref('chats').once('value');
    const chats = chatsSnap.val() || {};
    
    let newMessages = [];
    
    Object.entries(chats).forEach(([chatId, chat]) => {
      if (!chat.messages || chat.status !== 'open') return;
      Object.values(chat.messages).forEach(msg => {
        if (msg.role === 'customer' && msg.timestamp && msg.timestamp > lastCheck && msg.timestamp <= now) {
          newMessages.push({ chatId, text: msg.text, timestamp: msg.timestamp });
        }
      });
    });
    
    console.log('Nieuwe berichten gevonden:', newMessages.length);
    
    if (newMessages.length > 0) {
      const latest = newMessages.sort((a,b) => b.timestamp - a.timestamp)[0];
      await sendNotifications(db, 'Nieuw bericht van klant', latest.text.substr(0, 80));
    }
    
    return { statusCode: 200, body: JSON.stringify({ checked: true, newMessages: newMessages.length }) };
  } catch (err) {
    console.error('Fout:', err.message, err.stack);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
