import QRCode from 'qrcode';

/**
 * Calculates CRC16-CCITT (Checksum) for Bank of Thailand PromptPay payload
 */
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates official Bank of Thailand (BOT) PromptPay EMVCo Payload string
 * Supports Mobile Numbers (10 digits starting with 06/08/09) and National ID / Tax ID (13 digits)
 * @param target Mobile Phone Number or National ID / Tax ID
 * @param amount Optional bill total amount (e.g. 1896.00)
 */
export function generatePromptPayPayload(target: string, amount?: number): string {
  // Clean target string (remove dashes, spaces)
  const cleanTarget = target.replace(/[^0-9]/g, '');

  let subTag = '';

  if (cleanTarget.length === 10) {
    // Mobile phone number: replace leading 0 with 0066 and format to 13 chars
    const mobile66 = '0066' + cleanTarget.substring(1);
    subTag = '0113' + mobile66;
  } else if (cleanTarget.length === 13) {
    // National ID Card or Tax ID (13 digits)
    subTag = '0213' + cleanTarget;
  } else {
    // Fallback as mobile phone number
    const mobile66 = '0066' + cleanTarget.replace(/^0+/, '');
    subTag = '0113' + mobile66.padStart(13, '0').substring(0, 13);
  }

  // Merchant Account Information (Tag 29)
  // AID tag 00 length 16 value A000000677010111 (Official BOT PromptPay AID)
  const aidTag = '0016A000000677010111';
  const merchantTagContent = aidTag + subTag;
  const merchantTagLength = merchantTagContent.length.toString().padStart(2, '0');
  const tag29 = '29' + merchantTagLength + merchantTagContent;

  // Payload Format Indicator (00) & Point of Initiation (01)
  const payloadFormat = '000201';
  const pointOfInitiation = amount ? '010212' : '010211'; // 12 for Dynamic (with amount), 11 for Static

  // Currency (53): 764 (THB)
  const currencyTag = '5303764';

  // Amount Tag (54)
  let amountTag = '';
  if (amount && amount > 0) {
    const amountStr = amount.toFixed(2);
    const amountLen = amountStr.length.toString().padStart(2, '0');
    amountTag = '54' + amountLen + amountStr;
  }

  // Country Code (58): TH
  const countryTag = '5802TH';

  // Assembly before Checksum
  const rawData = payloadFormat + pointOfInitiation + tag29 + currencyTag + amountTag + countryTag + '6304';

  // CRC16 Checksum
  const checksum = crc16(rawData);

  return rawData + checksum;
}

/**
 * Generates SVG Data URL or SVG string for Official PromptPay QR Code
 */
export async function generatePromptPayDataURL(target: string, amount?: number): Promise<string> {
  const payload = generatePromptPayPayload(target, amount);
  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 240,
      color: {
        dark: '#002D62', // Official PromptPay Navy Blue
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate PromptPay QR Code:', err);
    return '';
  }
}
