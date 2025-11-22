const API_BASE_URL = 'http://localhost:5000/api';

export const mpesaAPI = {
  stkPush: async (phoneNumber, amount) => {
    const response = await fetch(`${API_BASE_URL}/mpesa/stkpush`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phoneNumber,
        amount: amount
      })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return response.json();
  }
};

export default {
  mpesaAPI
};