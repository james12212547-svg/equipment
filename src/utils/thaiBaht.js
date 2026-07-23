/**
 * Converts a number to Thai Baht text (e.g., 1234.50 -> "หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบสตางค์")
 */
export function thaiBahtText(number) {
  if (number == null || isNaN(number) || number === '') return 'ศูนย์บาทถ้วน';

  const num = Math.abs(Number(number));
  if (num === 0) return 'ศูนย์บาทถ้วน';

  const numbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const convertGroup = (str) => {
    let text = '';
    const len = str.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i], 10);
      const pos = len - i - 1;
      if (digit !== 0) {
        if (pos === 1 && digit === 1) {
          text += 'สิบ';
        } else if (pos === 1 && digit === 2) {
          text += 'ยี่สิบ';
        } else if (pos === 0 && digit === 1 && len > 1) {
          text += 'เอ็ด';
        } else {
          text += numbers[digit] + positions[pos];
        }
      }
    }
    return text;
  };

  const parts = num.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  let bahtText = '';
  let millionCount = 0;

  while (integerPart.length > 0) {
    const chunk = integerPart.slice(-6);
    integerPart = integerPart.slice(0, -6);
    let chunkText = convertGroup(chunk);
    if (millionCount > 0 && chunkText !== '') {
      chunkText += 'ล้าน'.repeat(millionCount);
    }
    bahtText = chunkText + bahtText;
    millionCount++;
  }

  if (bahtText === '') bahtText = 'ศูนย์';
  bahtText += 'บาท';

  if (parseInt(decimalPart, 10) === 0) {
    bahtText += 'ถ้วน';
  } else {
    bahtText += convertGroup(decimalPart) + 'สตางค์';
  }

  return bahtText;
}
