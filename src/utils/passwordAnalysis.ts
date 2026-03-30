/**
 * Password Security Analysis Utilities
 * Calculates entropy, detects patterns, estimates crack time
 */

export interface PasswordAnalysis {
  entropy: number;
  strength: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
  strengthPercent: number;
  crackTime: string;
  crackTimeSeconds: number;
  issues: string[];
  suggestions: string[];
  charsetSize: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  hasRepeating: boolean;
  hasSequential: boolean;
  isCommon: boolean;
  length: number;
}

// Common weak passwords (truncated list for demo)
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'master',
  'dragon', '111111', 'baseball', 'iloveyou', 'trustno1', 'sunshine',
  'letmein', 'football', 'shadow', 'superman', 'michael', 'password1',
  'admin', 'welcome', 'hello', 'charlie', 'donald', 'login', 'princess',
  'starwars', 'passw0rd', 'solo', 'access', 'flower', 'hottie', 'loveme',
  'zaq1zaq1', 'password123', 'test', 'test123', 'guest', 'changeme',
];

// Sequential patterns
const SEQUENCES = [
  'abcdefghijklmnopqrstuvwxyz',
  'qwertyuiopasdfghjklzxcvbnm',
  '01234567890',
  'zyxwvutsrqponmlkjihgfedcba',
  '09876543210',
];

function detectRepeating(password: string): boolean {
  if (password.length < 3) return false;
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
      return true;
    }
  }
  return false;
}

function detectSequential(password: string): boolean {
  const lower = password.toLowerCase();
  for (const seq of SEQUENCES) {
    for (let i = 0; i <= lower.length - 3; i++) {
      const chunk = lower.substring(i, i + 3);
      if (seq.includes(chunk)) return true;
    }
  }
  return false;
}

function calculateCharsetSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) size += 33;
  if (/[^\x00-\x7F]/.test(password)) size += 100; // Unicode chars
  return Math.max(size, 1);
}

function formatCrackTime(seconds: number): string {
  if (seconds < 0.001) return 'Instant';
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)} milliseconds`;
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
  if (seconds < 2592000) return `${(seconds / 86400).toFixed(1)} days`;
  if (seconds < 31536000) return `${(seconds / 2592000).toFixed(1)} months`;
  if (seconds < 3.154e10) return `${(seconds / 31536000).toFixed(1)} years`;
  if (seconds < 3.154e12) return `${(seconds / 3.154e10).toFixed(0)} centuries`;
  return 'Millions of years+';
}

export function analyzePassword(password: string): PasswordAnalysis {
  const length = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  const hasRepeating = detectRepeating(password);
  const hasSequential = detectSequential(password);
  const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());
  const charsetSize = calculateCharsetSize(password);

  // Calculate entropy: log2(charsetSize^length)
  let entropy = length * Math.log2(charsetSize);

  // Penalize common patterns
  if (isCommon) entropy = Math.min(entropy, 10);
  if (hasRepeating) entropy *= 0.8;
  if (hasSequential) entropy *= 0.85;

  // Estimate crack time (assuming 10 billion guesses/sec for GPU)
  const guessesPerSecond = 1e10;
  const totalCombinations = Math.pow(2, entropy);
  const crackTimeSeconds = totalCombinations / guessesPerSecond / 2; // Average case

  // Determine strength
  let strength: PasswordAnalysis['strength'];
  let strengthPercent: number;
  if (entropy < 28) { strength = 'very-weak'; strengthPercent = 10; }
  else if (entropy < 36) { strength = 'weak'; strengthPercent = 25; }
  else if (entropy < 60) { strength = 'fair'; strengthPercent = 50; }
  else if (entropy < 80) { strength = 'strong'; strengthPercent = 75; }
  else { strength = 'very-strong'; strengthPercent = 95; }

  // Generate issues and suggestions
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (isCommon) issues.push('This is a commonly used password');
  if (length < 8) issues.push('Password is too short (< 8 characters)');
  if (length < 12) issues.push('Consider using 12+ characters');
  if (!hasUppercase) issues.push('No uppercase letters');
  if (!hasLowercase) issues.push('No lowercase letters');
  if (!hasNumbers) issues.push('No numbers');
  if (!hasSymbols) issues.push('No special characters');
  if (hasRepeating) issues.push('Contains repeating characters (e.g., "aaa")');
  if (hasSequential) issues.push('Contains sequential patterns (e.g., "abc", "123")');

  if (!hasSymbols) suggestions.push('Add special characters (!@#$%^&*)');
  if (length < 16) suggestions.push('Use a passphrase of 16+ characters');
  if (!hasUppercase || !hasLowercase) suggestions.push('Mix uppercase and lowercase letters');
  if (isCommon) suggestions.push('Never use common dictionary passwords');
  suggestions.push('Consider using a password manager');

  return {
    entropy: Math.round(entropy * 10) / 10,
    strength,
    strengthPercent,
    crackTime: formatCrackTime(crackTimeSeconds),
    crackTimeSeconds,
    issues,
    suggestions,
    charsetSize,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSymbols,
    hasRepeating,
    hasSequential,
    isCommon,
    length,
  };
}

/**
 * Hash password using SHA-256 (for display only - use bcrypt/argon2 in production)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
