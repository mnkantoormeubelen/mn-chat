// MN Chat - Permanente Firebase listener via Netlify Scheduled Function
const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

// Firebase Admin initialiseren
const firebaseApp = initializeApp({
  credential: cert({
    projectId: "mn-chat-7a6bd",
    clientEmail: "firebase-adminsdk-fbsvc@mn-chat-7a6bd.iam.gserviceaccount.com",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  databaseURL: "https://mn-chat-7a6bd-default-rtdb.firebaseio.com"
});

const db = getDatabase(firebaseApp);

async function sendNotifications(title, body) {
  // Haal agents op
  const agentsSnap = await db.ref('agents').once('value');
  const agents = agentsSnap.val() || {};
  
  const osIds = Object.values(agents).map(a => a.osId).filter(Boolean);
  const osSubscriptionIds = Object.values(agents).map(a => a.osSubscriptionId).filter(Boolean);
  
  console.log('Stuur naar', osIds.length, 'agents');

  const promises = [];

  // Push via subscription IDs
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

  // Push via user IDs
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

  // Telegram
  promises.push(fetch('https://api.callmebot.com/text.php?user=Maartenmnkantoor&text=' + encodeURIComponent('🔔 ' + title + ': ' + body)));

  await Promise.all(promises);
  console.log('Meldingen verstuurd');
}

exports.handler = async function(event, context) {
  try {
    console.log('Chat listener gestart - controleer nieuwe berichten');
    
    // Haal timestamp op van laatste check
    const lastCheckSnap = await db.ref('system/lastNotificationCheck').once('value');
    const lastCheck = lastCheckSnap.val() || (Date.now() - 60000); // Max 1 minuut terug
    const now = Date.now();
    
    // Update timestamp direct
    await db.ref('system/lastNotificationCheck').set(now);
    
    // Haal alle open chats op
    const chatsSnap = await db.ref('chats').orderByChild('status').equalTo('open').once('value');
    const chats = chatsSnap.val() || {};
    
    let newMessages = [];
    
    Object.entries(chats).forEach(([chatId, chat]) => {
      if (!chat.messages) return;
      
      Object.values(chat.messages).forEach(msg => {
        if (msg.role === 'customer' && msg.timestamp && msg.timestamp > lastCheck && msg.timestamp <= now) {
          newMessages.push({ chatId, text: msg.text, timestamp: msg.timestamp });
        }
      });
    });
    
    console.log('Nieuwe berichten gevonden:', newMessages.length);
    
    if (newMessages.length > 0) {
      // Stuur melding voor het laatste nieuwe bericht
      const latest = newMessages.sort((a,b) => b.timestamp - a.timestamp)[0];
      await sendNotifications('Nieuw bericht van klant', latest.text.substr(0, 80));
    }
    
    return { statusCode: 200, body: JSON.stringify({ checked: true, newMessages: newMessages.length }) };
  } catch (err) {
    console.error('Fout:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
