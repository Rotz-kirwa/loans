const axios = require('axios');
const { normalizePhoneNumber } = require('./mpesa');

const AFRICAS_TALKING_BASE_URLS = {
  sandbox: 'https://api.sandbox.africastalking.com',
  production: 'https://api.africastalking.com',
};

const getAfricasTalkingConfig = () => {
  const environment = (process.env.AFRICASTALKING_SMS_ENV || 'production').trim().toLowerCase();

  return {
    environment,
    baseUrl: AFRICAS_TALKING_BASE_URLS[environment] || AFRICAS_TALKING_BASE_URLS.production,
    username: (process.env.AFRICASTALKING_SMS_USERNAME || '').trim(),
    apiKey: (process.env.AFRICASTALKING_SMS_API_KEY || '').trim(),
    senderId: (process.env.AFRICASTALKING_SMS_SENDER_ID || '').trim(),
  };
};

const areApprovalSmsNotificationsConfigured = () => {
  const config = getAfricasTalkingConfig();

  return Boolean(config.username && config.apiKey);
};

const getApplicantName = (loan) => {
  const fullName = [loan.first_name, loan.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (fullName) {
    return fullName;
  }

  if (loan.name && `${loan.name}`.trim()) {
    return `${loan.name}`.trim();
  }

  return 'there';
};

const buildLoanApprovalMessage = (loan) => {
  const applicantName = getApplicantName(loan);

  return `We're excited to let you know, ${applicantName}, that your loan application is approved! The funds will be in your account in less than a minute. If you have any questions, we're here to help!`;
};

const sendLoanApprovalSms = async (loan) => {
  const config = getAfricasTalkingConfig();

  if (!areApprovalSmsNotificationsConfigured()) {
    throw new Error('Africa\'s Talking SMS notifications are not configured.');
  }

  const phoneNumber = normalizePhoneNumber(loan.mpesa_phone || loan.phone);
  const message = buildLoanApprovalMessage(loan);
  const payload = new URLSearchParams({
    username: config.username,
    to: phoneNumber,
    message,
  });

  if (config.senderId) {
    payload.append('from', config.senderId);
  }

  const response = await axios.post(
    `${config.baseUrl}/version1/messaging`,
    payload.toString(),
    {
      headers: {
        apiKey: config.apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 15000,
    }
  );

  const firstRecipient = response.data?.SMSMessageData?.Recipients?.[0];
  if (firstRecipient?.status && !`${firstRecipient.status}`.toLowerCase().includes('success')) {
    throw new Error(`${firstRecipient.status}`);
  }

  return {
    phoneNumber,
    message,
    providerResponse: response.data,
  };
};

module.exports = {
  areApprovalSmsNotificationsConfigured,
  buildLoanApprovalMessage,
  sendLoanApprovalSms,
};
