export const KENYA_COUNTRY_CODE = '254';
export const KENYAN_PHONE_LENGTH = 12;

export const formatKenyanPhoneInput = (rawValue) => {
  const digits = `${rawValue || ''}`.replace(/\D/g, '');

  if (!digits) {
    return KENYA_COUNTRY_CODE;
  }

  if (digits.startsWith(KENYA_COUNTRY_CODE)) {
    return digits.slice(0, KENYAN_PHONE_LENGTH);
  }

  if (digits.startsWith('0')) {
    return `${KENYA_COUNTRY_CODE}${digits.slice(1)}`.slice(0, KENYAN_PHONE_LENGTH);
  }

  if (digits.startsWith('7')) {
    return `${KENYA_COUNTRY_CODE}${digits}`.slice(0, KENYAN_PHONE_LENGTH);
  }

  return `${KENYA_COUNTRY_CODE}${digits}`.slice(0, KENYAN_PHONE_LENGTH);
};

export const isCompleteKenyanPhone = (value) => {
  return /^2547\d{8}$/.test(`${value || ''}`);
};
