/**
 * Encoding vs Encryption Detection Utilities
 * Uses entropy analysis and pattern detection to classify input
 */

export type EncodingType = 'plaintext' | 'base64' | 'hex' | 'url-encoded' | 'encrypted' | 'binary';

export interface DetectionResult {
  type: EncodingType;
  confidence: number;
  entropy: number;
  label: string;
  description: string;
  icon: string;
  decoded?: string;
}

/**
 * Calculate Shannon entropy of a string
 */
export function calculateEntropy(str: string): number {
  if (!str.length) return 0;
  
  const freq: Record<string, number> = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(freq)) {
    const p = count / len;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  
  return Math.round(entropy * 1000) / 1000;
}

/**
 * Check if string is valid Base64
 */
function isBase64(str: string): { valid: boolean; decoded?: string } {
  const trimmed = str.trim();
  if (trimmed.length < 4) return { valid: false };
  if (!/^[A-Za-z0-9+/=\n\r]+$/.test(trimmed)) return { valid: false };
  if (trimmed.length % 4 !== 0 && !trimmed.includes('=')) return { valid: false };
  
  try {
    const decoded = atob(trimmed.replace(/\s/g, ''));
    // Check if decoded output is mostly printable
    const printable = decoded.split('').filter(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126).length;
    return { valid: true, decoded: printable / decoded.length > 0.7 ? decoded : undefined };
  } catch {
    return { valid: false };
  }
}

/**
 * Check if string is valid hex encoding
 */
function isHex(str: string): { valid: boolean; decoded?: string } {
  const trimmed = str.trim().replace(/\s/g, '').replace(/^0x/i, '');
  if (trimmed.length < 4 || trimmed.length % 2 !== 0) return { valid: false };
  if (!/^[0-9a-fA-F]+$/.test(trimmed)) return { valid: false };
  
  try {
    const decoded = trimmed.match(/.{2}/g)
      ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
      .join('') || '';
    const printable = decoded.split('').filter(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126).length;
    return { valid: true, decoded: printable / decoded.length > 0.7 ? decoded : undefined };
  } catch {
    return { valid: false };
  }
}

/**
 * Check if string is URL encoded
 */
function isUrlEncoded(str: string): { valid: boolean; decoded?: string } {
  if (!str.includes('%')) return { valid: false };
  const percentCount = (str.match(/%[0-9A-Fa-f]{2}/g) || []).length;
  if (percentCount < 1) return { valid: false };
  
  try {
    const decoded = decodeURIComponent(str);
    return { valid: decoded !== str, decoded };
  } catch {
    return { valid: false };
  }
}

/**
 * Detect encoding type of input string
 */
export function detectEncoding(input: string): DetectionResult {
  if (!input.trim()) {
    return {
      type: 'plaintext',
      confidence: 0,
      entropy: 0,
      label: 'Empty Input',
      description: 'No data to analyze',
      icon: 'fa-question',
    };
  }

  const entropy = calculateEntropy(input);
  const trimmed = input.trim();
  
  // Check URL encoding first
  const urlCheck = isUrlEncoded(trimmed);
  if (urlCheck.valid && urlCheck.decoded) {
    return {
      type: 'url-encoded',
      confidence: 90,
      entropy,
      label: 'URL Encoded',
      description: 'Percent-encoded string (RFC 3986). This is encoding, NOT encryption — easily reversible.',
      icon: 'fa-link',
      decoded: urlCheck.decoded,
    };
  }

  // Check Base64
  const base64Check = isBase64(trimmed);
  if (base64Check.valid && trimmed.length >= 8) {
    const hasBase64Padding = trimmed.endsWith('=');
    const confidence = hasBase64Padding ? 95 : 75;
    return {
      type: 'base64',
      confidence,
      entropy,
      label: 'Base64 Encoded',
      description: 'Base64 encoding detected. This is encoding, NOT encryption — anyone can decode it without a key.',
      icon: 'fa-code',
      decoded: base64Check.decoded,
    };
  }

  // Check hex
  const hexCheck = isHex(trimmed);
  if (hexCheck.valid && trimmed.length >= 8) {
    return {
      type: 'hex',
      confidence: 85,
      entropy,
      label: 'Hexadecimal Encoded',
      description: 'Hex encoding detected. This is a simple encoding format — not encrypted or secure.',
      icon: 'fa-hashtag',
      decoded: hexCheck.decoded,
    };
  }

  // High entropy = likely encrypted
  if (entropy > 4.5 && trimmed.length > 20) {
    return {
      type: 'encrypted',
      confidence: Math.min(95, Math.round(entropy / 8 * 100)),
      entropy,
      label: 'Encrypted / High Entropy',
      description: 'High entropy data detected — likely encrypted with a cryptographic algorithm. Requires a key to decrypt.',
      icon: 'fa-lock',
    };
  }

  // Check for binary-looking data
  const nonPrintable = trimmed.split('').filter(c => c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126).length;
  if (nonPrintable / trimmed.length > 0.3) {
    return {
      type: 'binary',
      confidence: 80,
      entropy,
      label: 'Binary Data',
      description: 'Contains non-printable characters — likely binary or serialized data.',
      icon: 'fa-microchip',
    };
  }

  // Default: plaintext
  return {
    type: 'plaintext',
    confidence: Math.max(50, 100 - Math.round(entropy * 15)),
    entropy,
    label: 'Plain Text',
    description: 'Standard readable text with no apparent encoding or encryption applied.',
    icon: 'fa-file-text',
  };
}
