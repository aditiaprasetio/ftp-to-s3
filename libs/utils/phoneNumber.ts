export function cleanPhoneNumber(phoneNumber: string) {
  if (!phoneNumber) return null;
  phoneNumber = phoneNumber.replace(/\s/g, '');
  phoneNumber = phoneNumber.replace(/\+/g, '');
  if (phoneNumber.startsWith('08')) {
    phoneNumber = '628' + phoneNumber.substring(2, phoneNumber.length);
  }

  return phoneNumber;
}
