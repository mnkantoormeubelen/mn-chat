exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { osIds, title, body } = JSON.parse(event.body);
    
    if (!osIds || !osIds.length) {
      return { statusCode: 200, body: JSON.stringify({ message: 'Geen ontvangers' }) };
    }

    console.log('Stuur naar subscription IDs:', osIds);

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + process.env.ONESIGNAL_REST_API_KEY
      },
      body: JSON.stringify({
        app_id: '0922fba7-ca4d-4cd9-95e8-8c5b9b846c6c',
        include_subscription_ids: osIds,
        headings: { en: title, nl: title },
        contents: { en: body, nl: body },
        url: 'https://heartfelt-biscochitos-35decb.netlify.app',
        priority: 10,
        android_channel_id: '',
        android_visibility: 1
      })
    });

    const result = await response.json();
    console.log('OneSignal resultaat:', JSON.stringify(result));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, result })
    };
  } catch (err) {
    console.error('Fout:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
