const axios = require('axios');

const MPESA_BASE_URLS = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
};

const normalizePublicUrl = (value) => `${value || ''}`.trim().replace(/\/+$/, '');

const resolveCallbackUrl = () => {
  const explicitCallbackUrl = normalizePublicUrl(process.env.MPESA_CALLBACK_URL);
  if (explicitCallbackUrl) {
    return explicitCallbackUrl;
  }

  const publicBaseUrl = normalizePublicUrl(
    process.env.PUBLIC_BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL
  );

  if (!publicBaseUrl) {
    return '';
  }

  if (publicBaseUrl.endsWith('/api')) {
    return `${publicBaseUrl}/mpesa/callback`;
  }

  return `${publicBaseUrl}/api/mpesa/callback`;
};

const getMpesaConfig = () => {
  const environment = (process.env.MPESA_ENV || 'production').toLowerCase();
  const baseUrl = MPESA_BASE_URLS[environment] || MPESA_BASE_URLS.production;

  return {
    environment,
    baseUrl,
    consumerKey: (process.env.MPESA_CONSUMER_KEY || '').trim(),
    consumerSecret: (process.env.MPESA_CONSUMER_SECRET || '').trim(),
    shortcode: (process.env.MPESA_SHORTCODE || '').trim(),
    passkey: (process.env.MPESA_PASSKEY || '').trim(),
    callbackUrl: resolveCallbackUrl(),
    partnerName: (process.env.MPESA_PARTNER_NAME || 'Loanvia').trim(),
  };
};

const ensureMpesaConfig = () => {
  const config = getMpesaConfig();
  const missingKeys = [
    ['MPESA_CONSUMER_KEY', config.consumerKey],
    ['MPESA_CONSUMER_SECRET', config.consumerSecret],
    ['MPESA_SHORTCODE', config.shortcode],
    ['MPESA_PASSKEY', config.passkey],
    ['MPESA_CALLBACK_URL', config.callbackUrl],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingKeys.length > 0) {
    throw new Error(`Missing M-PESA configuration: ${missingKeys.join(', ')}`);
  }

  if (
    config.callbackUrl.includes('example.com') ||
    config.callbackUrl.includes('your-public-https-domain')
  ) {
    throw new Error('MPESA_CALLBACK_URL still points to a placeholder. Set it to your real public HTTPS callback URL.');
  }

  let parsedCallbackUrl;

  try {
    parsedCallbackUrl = new URL(config.callbackUrl);
  } catch (error) {
    throw new Error('MPESA callback URL must be a valid public HTTPS URL.');
  }

  if (parsedCallbackUrl.protocol !== 'https:') {
    throw new Error('MPESA callback URL must use HTTPS in production.');
  }

  return config;
};

const isMpesaConfigurationError = (error) => {
  const message = `${error?.message || ''}`;

  return (
    message.startsWith('Missing M-PESA configuration:') ||
    message.includes('MPESA_CALLBACK_URL still points to a placeholder') ||
    message.includes('MPESA callback URL must be a valid public HTTPS URL.') ||
    message.includes('MPESA callback URL must use HTTPS in production.')
  );
};

const getTimestamp = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-KE', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter
    .formatToParts(date)
    .reduce((accumulator, part) => {
      if (part.type !== 'literal') {
        accumulator[part.type] = part.value;
      }

      return accumulator;
    }, {});

  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;
};

const buildPassword = ({ shortcode, passkey, timestamp }) => {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
};

const normalizePhoneNumber = (rawValue) => {
  const value = `${rawValue || ''}`.trim();
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('254') && digits.length === 12) {
    return digits;
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }

  if (digits.startsWith('7') && digits.length === 9) {
    return `254${digits}`;
  }

  throw new Error('Please enter a valid Safaricom phone number in the format 07XXXXXXXX, 7XXXXXXXX, or 2547XXXXXXXX.');
};

const getAccessToken = async () => {
  const config = ensureMpesaConfig();
  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');

  const response = await axios.get(
    `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      timeout: 15000,
    }
  );

  return response.data.access_token;
};

const initiateStkPush = async ({ phoneNumber, amount, accountReference, transactionDesc }) => {
  const config = ensureMpesaConfig();
  const accessToken = await getAccessToken();
  const timestamp = getTimestamp();

  const payload = {
    BusinessShortCode: config.shortcode,
    Password: buildPassword({
      shortcode: config.shortcode,
      passkey: config.passkey,
      timestamp,
    }),
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(Number(amount)),
    PartyA: phoneNumber,
    PartyB: config.shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: config.callbackUrl,
    AccountReference: accountReference || config.partnerName,
    TransactionDesc: transactionDesc || 'Loan Processing Fee',
  };

  const response = await axios.post(
    `${config.baseUrl}/mpesa/stkpush/v1/processrequest`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return response.data;
};

const queryStkStatus = async ({ checkoutRequestId }) => {
  const config = ensureMpesaConfig();
  const accessToken = await getAccessToken();
  const timestamp = getTimestamp();

  const payload = {
    BusinessShortCode: config.shortcode,
    Password: buildPassword({
      shortcode: config.shortcode,
      passkey: config.passkey,
      timestamp,
    }),
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const response = await axios.post(
    `${config.baseUrl}/mpesa/stkpushquery/v1/query`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return response.data;
};

const parseCallbackMetadata = (callbackMetadata) => {
  const items = callbackMetadata?.Item || [];

  return items.reduce((accumulator, item) => {
    if (!item?.Name) {
      return accumulator;
    }

    accumulator[item.Name] = Object.prototype.hasOwnProperty.call(item, 'Value')
      ? item.Value
      : null;

    return accumulator;
  }, {});
};

const parseTransactionDate = (rawValue) => {
  const digits = `${rawValue || ''}`.replace(/\D/g, '');

  if (digits.length !== 14) {
    return null;
  }

  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);
  const day = digits.slice(6, 8);
  const hours = digits.slice(8, 10);
  const minutes = digits.slice(10, 12);
  const seconds = digits.slice(12, 14);

  const parsedDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}+03:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString();
};

const formatMpesaError = (error) => {
  const responseData = error.response?.data;

  if (responseData?.errorMessage) {
    return responseData.errorMessage;
  }

  if (responseData?.ResponseDescription) {
    return responseData.ResponseDescription;
  }

  if (responseData?.ResultDesc) {
    return responseData.ResultDesc;
  }

  if (typeof responseData === 'string' && responseData) {
    return responseData;
  }

  return error.message || 'M-PESA request failed.';
};

module.exports = {
  formatMpesaError,
  getMpesaConfig,
  getTimestamp,
  initiateStkPush,
  isMpesaConfigurationError,
  normalizePhoneNumber,
  parseCallbackMetadata,
  parseTransactionDate,
  queryStkStatus,
  resolveCallbackUrl,
};
