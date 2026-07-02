exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { osIds, osSubscriptionIds, title, body } = JSON.parse(event.body);
    
    if ((!osIds || !osIds.length) && (!osSubscriptionIds || !osSubscriptionIds.length)) {
      return { statusCode: 200, body: JSON.stringify({ message: 'Geen ontvangers' }) };
    }

    const results = [];

    // Probeer via subscription IDs (meest betrouwbaar)
    if (osSubscriptionIds && osSubscriptionIds.length) {
      console.log('Stuur via subscription IDs:', osSubscriptionIds);
      const r1 = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + process.env.ONESIGNAL_REST_API_KEY
        },
        body: JSON.stringify({
          app_id: '0922fba7-ca4d-4cd9-95e8-8c5b9b846c6c',
          include_subscription_ids: osSubscriptionIds,
          headings: { en: title, nl: title },
          contents: { en: body, nl: body },
          url: 'https://heartfelt-biscochitos-35decb.netlify.app',
          priority: 10
        })
      });
      const res1 = await r1.json();
      console.log('Subscription IDs resultaat:', JSON.stringify(res1));
      results.push(res1);
    }

    // Probeer ook via user IDs
    if (osIds && osIds.length) {
      console.log('Stuur via user IDs:', osIds);
      const r2 = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + process.env.ONESIGNAL_REST_API_KEY
        },
        body: JSON.stringify({
          app_id: '0922fba7-ca4d-4cd9-95e8-8c5b9b846c6c',
          include_aliases: { onesignal_id: osIds },
          target_channel: 'push',
          headings: { en: title, nl: title },
          contents: { en: body, nl: body },
          url: 'https://heartfelt-biscochitos-35decb.netlify.app',
          priority: 10
        })
      });
      const res2 = await r2.json();
      console.log('User IDs resultaat:', JSON.stringify(res2));
      results.push(res2);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, results })
    };
  } catch (err) {
    console.error('Fout:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
