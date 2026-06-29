const { GoogleAuth } = require('google-auth-library');

const FIREBASE_CONFIG = {
  type: "service_account",
  project_id: "mn-chat-7a6bd",
  private_key_id: "9f836564c07b312c985d1856f155df62b2d1194f",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6VtrzwhAX4HF7\nFMDDddxgGhd7ltGJ/SHj+fEvmN2khsPHZw/Lv4pIsjatBe2bJP5HIiCrXWfsetYN\nFAgAzq6SM1aMU/wKULt5aApmfzEk30kIcXtmfcZaH+p0uXVIEYB2erp/WhSyXahY\nOaYKJlAGj+bySeod6PI0/Nv8/DmvqIKUsZLZ4+xHbnC60gvnHW4CsfCz98FoTLG2\nmu01XTH4aVvVAYuPOCEczwvHtWWzWPFgw5x9WucXVEnIBAzuRKt3t9FoCghievxs\ndUgcei2VEY4FuFlDtKY7l2eOXwRJZrzeYmrxgMucYIMz6ILKE2qzSZUqAgcZJYLD\na1oyaKStAgMBAAECggEAH+feTq2UXto95BK+HNmx9byR98Xvs/5lTqlNzFYS4Wh3\n3k09zafK0D6/kOm6cP2pEln8GQuBz2KLAytCYY0CJCNpNtbsiYGgUB3p5fnyWrtm\nwGzZ8ccobucXGIxm0gO5KNBD3al5cL8Lo6ufTA6aVj1OkH7qeNuZmUwQiOVRJUvc\nykQPvNkSjPmGTdMYIc2zb0bXrunQrExDjjpya8qpEXlP7R6BpHJpwLfkESQ4LhY3\nVYjLEjr3OvqWz6I/fa6MzvwyLMXrFRGHK2M4lCUWaBeftn98DP7JdSWHxv357KTc\nXgUCzd+H8OH5lGZQeh05LeIj1M4bm2or08+EEGRDOwKBgQDlLzFanbdEer6sFvLe\nyf0rxoD/UzeCwDFyAsXk8LHrp/DJMd/AHVyCAZreK1THgsotPe2pY//84ZLBxWVk\n2OCS5ApdZWkBIgHi2BRQtdEWG40PkDF0vnbw4MDirUS2EXahnLIHcJy5U6qgznMj\nX3AxpTcgr1gMZO2u+RQrpZmw0wKBgQDQJFCqR/NRAU3KMthpvhnO+4sRZAB8NFpa\nmX58h/GZmlIOA22+69ncPjgSnzYNYui7ftm5Cd0xAEYyGfqxtl9Z3iyoIMlAZkuJ\nRpOLXCyKgcON9T4yYgVcSwRmADy4rJw7oaf5fhPEWByFwRFidrleMVKlmPkQVJzF\nVqtGUtrkfwKBgFxNzIfde4FmGkM/HuQh4Ahwc2XiAzpy47cybLePRWlPA0hVAPPk\nH2zw7onKU+PixkDAb2bIssILq8rFENg0DQa8N3x0Kn1dT/sn4c6725EW2ZJKFdEa\nINdU/fqNpF3b3LasYHtknIp7qv4HCBJYDty/2NseI80iHSRahwgpMyQnAoGAC3fk\nxe0e9/ila52vlOv3ihMMD5I+AJn13IYWlQ/8fOUm3kTMGDfwkhUPi98f4E7x2drc\nbjif6mJEe+A4kvAkgtQeC8l6rUS1psOvv379qUgLGVhI7AfAmdw8Ss56igZguVxn\n3/RVbH0aXThNF+rIverjzeIG3yJ6XNkwqLhJ/UsCgYEAuBF1GgW6AuyTxhOxXCuv\nlpL12KyJu5so0KdOITmdoDPzNZA8EP9gWKlPhChzywvIDw2Rliwl5Kea1rlpihI4\nlhrn0WzJN07+P55G6719wDKStDi+6w4QW0ySK55+AUdmeIXRSavTJYV7pC9bYBMc\nU2910MYHSgocZzrW1MPBKJ4=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@mn-chat-7a6bd.iam.gserviceaccount.com",
  client_id: "112009834384587247319",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token"
};

async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: FIREBASE_CONFIG,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging']
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { tokens, title, body } = JSON.parse(event.body);
    if (!tokens || !tokens.length) {
      return { statusCode: 200, body: JSON.stringify({ message: 'Geen tokens' }) };
    }

    const accessToken = await getAccessToken();
    const results = [];

    for (const token of tokens) {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/mn-chat-7a6bd/messages:send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: {
              token: token,
              notification: { title, body },
              webpush: {
                notification: {
                  title,
                  body,
                  icon: 'https://genuine-granita-c22cdd.netlify.app/icon-192.png',
                  badge: 'https://genuine-granita-c22cdd.netlify.app/icon-192.png',
                  vibrate: [200, 100, 200],
                  tag: 'mn-chat'
                },
                fcm_options: {
                  link: 'https://genuine-granita-c22cdd.netlify.app'
                }
              }
            }
          })
        }
      );
      const result = await response.json();
      results.push(result);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, results })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
