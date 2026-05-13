exports.handler = async function(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  try {
    const { email, language } = JSON.parse(event.body);
 
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) };
    }
 
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const BREVO_LIST_ID = 3;
 
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
        attributes: {
          LANGUAGE: language ? language.toUpperCase() : 'EN'
        }
      })
    });
 
    if (response.ok || response.status === 204) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
 
    const data = await response.json();
 
    // Duplicate email — treat as success
    if (data.code === 'duplicate_parameter') {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
 
    return { statusCode: 400, body: JSON.stringify({ error: data.message || 'Something went wrong' }) };
 
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
