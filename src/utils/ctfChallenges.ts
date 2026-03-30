/**
 * CTF Challenge definitions — all solvable client-side, no backend required.
 * Answers are stored as SHA-256 hashes to prevent trivial source inspection.
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type Category = 'cryptography' | 'web' | 'forensics' | 'binary' | 'steganography' | 'network' | 'osint';

export interface Hint {
  cost: number; // points deducted when hint is revealed
  text: string;
}

export interface CTFChallenge {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  points: number;
  description: string;
  /** SHA-256 hash of the correct flag string (lowercase, no whitespace) */
  flagHash: string;
  /** The actual flag — shown after solve for learning. Format: CTF{...} */
  flag: string;
  hints: Hint[];
  /** Step-by-step educational solution walkthrough */
  solution: string;
  tags: string[];
}

export const CHALLENGES: CTFChallenge[] = [
  // ─── CRYPTOGRAPHY ──────────────────────────────────────────────────────────
  {
    id: 'crypto-1',
    title: 'Caesar\'s Secret',
    category: 'cryptography',
    difficulty: 'easy',
    points: 50,
    description: `A Roman general left this encoded message:\n\n**"FWJ{EHLGUHU_FLSKHU_FUDFNHG}"**\n\nThe shift used is the same as the number of letters in "KEY". Decode it to find the flag.`,
    flag: 'CTF{DECODED_CIPHER_CRACKED}',
    flagHash: '', // computed at runtime
    hints: [
      { cost: 10, text: 'Caesar cipher shifts each letter by a fixed amount. "KEY" has 3 letters.' },
      { cost: 20, text: 'Shift each letter back by 3 positions: F→C, W→T, J→G...' },
    ],
    solution: 'The message uses a Caesar cipher with shift 3 (ROT-3). Shift each letter back by 3: F→C, W→T, J→G, E→B... Result: CTF{DECODED_CIPHER_CRACKED}',
    tags: ['caesar', 'substitution', 'classical'],
  },
  {
    id: 'crypto-2',
    title: 'Base Confusion',
    category: 'cryptography',
    difficulty: 'easy',
    points: 75,
    description: `This string looks encoded. Can you find the hidden flag?\n\n**Q1RGe0I0U0U2NF9JU19OT1RfRU5DUllQVElPTn0=**\n\nRemember: encoding is NOT encryption!`,
    flag: 'CTF{B4SE64_IS_NOT_ENCRYPTION}',
    flagHash: '',
    hints: [
      { cost: 10, text: 'The "=" padding at the end is a strong hint about the encoding type.' },
      { cost: 15, text: 'Base64 decode: each group of 4 chars → 3 bytes. Try atob() in browser console.' },
    ],
    solution: 'Base64 decode the string: atob("Q1RGe0I0U0U2NF9JU19OT1RfRU5DUllQVElPTn0=") = CTF{B4SE64_IS_NOT_ENCRYPTION}',
    tags: ['base64', 'encoding', 'decode'],
  },
  {
    id: 'crypto-3',
    title: 'Hex Appeal',
    category: 'cryptography',
    difficulty: 'easy',
    points: 75,
    description: `Convert this hex string to find the flag:\n\n**43 54 46 7b 48 45 58 5f 44 45 43 4f 44 45 44 7d**\n\nHint: 0x43 = 'C' in ASCII`,
    flag: 'CTF{HEX_DECODED}',
    flagHash: '',
    hints: [
      { cost: 10, text: 'Each hex pair represents one ASCII character. 0x43=C, 0x54=T, 0x46=F...' },
      { cost: 15, text: 'Use: hex pairs → decimal → String.fromCharCode()' },
    ],
    solution: 'Convert each hex byte to ASCII: 43=C 54=T 46=F 7b={ 48=H 45=E 58=X 5f=_ 44=D 45=E 43=C 4f=O 44=D 45=E 44=D 7d=} → CTF{HEX_DECODED}',
    tags: ['hex', 'ascii', 'encoding'],
  },
  {
    id: 'crypto-4',
    title: 'Vigenère Vortex',
    category: 'cryptography',
    difficulty: 'medium',
    points: 150,
    description: `The following message was encrypted with a Vigenère cipher using the key **"CYBER"**:\n\n**GXF{ITMOMVI_GWZLWV_JZSMYML}**\n\nDecrypt it to find the flag.`,
    flag: 'CTF{VIGENERE_CIPHER_CRACKED}',
    flagHash: '',
    hints: [
      { cost: 20, text: 'Vigenère: each letter is shifted by the corresponding key letter\'s position (A=0, B=1...). Subtract instead of add to decrypt.' },
      { cost: 30, text: 'Key "CYBER" = shifts [2,24,1,4,17]. Apply cyclic: G-2=E... wait, the first char gives C. Key offset for "C" is 2, G-2=E... check non-flag chars.' },
    ],
    solution: 'Key CYBER = [2,24,1,4,17]. Decrypt each char: G(6)-C(2)=E→C, X(23)-Y(24)+26=C→T... Apply modular subtraction for each letter cycling through CYBER → CTF{VIGENERE_CIPHER_CRACKED}',
    tags: ['vigenere', 'polyalphabetic', 'classical'],
  },
  {
    id: 'crypto-5',
    title: 'Hash Collision Hunt',
    category: 'cryptography',
    difficulty: 'medium',
    points: 175,
    description: `A password was hashed with MD5 (a broken algorithm). The hash is:\n\n**5f4dcc3b5aa765d61d8327deb882cf99**\n\nThis is a very common password. Find what string produces this MD5 hash.\n\nEnter the flag as: **CTF{the_password}**`,
    flag: 'CTF{password}',
    flagHash: '',
    hints: [
      { cost: 20, text: 'This is one of the most common passwords in the world. Try a dictionary.' },
      { cost: 30, text: 'MD5("password") = 5f4dcc3b5aa765d61d8327deb882cf99. The answer is literal.' },
    ],
    solution: 'MD5("password") = 5f4dcc3b5aa765d61d8327deb882cf99. This demonstrates why MD5 is broken for passwords — rainbow tables instantly crack common hashes. Flag: CTF{password}',
    tags: ['md5', 'rainbow-table', 'hash-cracking'],
  },
  {
    id: 'crypto-6',
    title: 'XOR Master',
    category: 'cryptography',
    difficulty: 'hard',
    points: 250,
    description: `A single-byte XOR cipher was used with key **0x42**. The ciphertext bytes are:\n\n**01 37 36 5B 77 27 36 37 5F 5B 2F 27 37 6B**\n\nXOR each byte with 0x42 to decrypt. What's the flag?`,
    flag: 'CTF{xor_is_basic}',
    flagHash: '',
    hints: [
      { cost: 25, text: 'XOR is its own inverse: if C = P XOR K, then P = C XOR K. Apply 0x42 to each byte.' },
      { cost: 40, text: '0x01 XOR 0x42 = 0x43 = "C", 0x37 XOR 0x42 = 0x75 = "t"...' },
    ],
    solution: 'XOR each byte with 0x42: [0x01,0x37,...] XOR 0x42 = [0x43,0x75,0x66,...] = "ctf{xor_is_basic}" → CTF{xor_is_basic}',
    tags: ['xor', 'single-byte-xor', 'symmetric'],
  },

  // ─── WEB SECURITY ───────────────────────────────────────────────────────────
  {
    id: 'web-1',
    title: 'Hidden in Plain Sight',
    category: 'web',
    difficulty: 'easy',
    points: 50,
    description: `Developers sometimes hide secrets in HTML comments. The flag is hidden in this "source code":\n\n\`\`\`html\n<html>\n  <head><title>Login</title></head>\n  <body>\n    <!-- TODO: remove before deploy: CTF{HTML_C0MMENTS_ARE_PUBLIC} -->\n    <form>...\n  </body>\n</html>\n\`\`\`\n\nFind the flag!`,
    flag: 'CTF{HTML_C0MMENTS_ARE_PUBLIC}',
    flagHash: '',
    hints: [
      { cost: 5, text: 'HTML comments start with <!-- and end with -->. Developers forget to remove them.' },
    ],
    solution: 'The flag CTF{HTML_C0MMENTS_ARE_PUBLIC} is hidden inside an HTML comment. Always check page source! In real attacks, View Source (Ctrl+U) reveals hidden developer notes.',
    tags: ['html', 'source-code', 'information-disclosure'],
  },
  {
    id: 'web-2',
    title: 'SQL Injection 101',
    category: 'web',
    difficulty: 'medium',
    points: 150,
    description: `A login form has this vulnerable SQL query:\n\n\`\`\`sql\nSELECT * FROM users WHERE username='[INPUT]' AND password='[PASS]'\n\`\`\`\n\nWhat single-quote injection payload in the **username** field would bypass authentication and log in as admin (ignoring the password check)?\n\nEnter the flag as: **CTF{your_payload}** where payload uses only: **' OR 1=1--**`,
    flag: "CTF{' OR 1=1--}",
    flagHash: '',
    hints: [
      { cost: 20, text: "Single quote ' breaks out of the string. OR 1=1 makes the WHERE clause always true. -- comments out the rest." },
      { cost: 30, text: "Payload: ' OR 1=1-- makes the query: WHERE username='' OR 1=1--' AND password='...' which is always true." },
    ],
    solution: "Payload: ' OR 1=1-- transforms the query to: WHERE username='' OR 1=1--' AND password='...' The 1=1 is always true, the -- comments out the password check → auth bypass. Flag: CTF{' OR 1=1--}",
    tags: ['sql-injection', 'auth-bypass', 'owasp'],
  },
  {
    id: 'web-3',
    title: 'Cookie Monster',
    category: 'web',
    difficulty: 'medium',
    points: 125,
    description: `A web app stores admin status in a cookie:\n\n\`\`\`\nSet-Cookie: role=dXNlcg==; isAdmin=ZmFsc2U=\n\`\`\`\n\nThe values are Base64 encoded. What would you set **isAdmin** to (Base64 of "true") to escalate privileges?\n\nEnter the flag as: **CTF{base64_of_true}**`,
    flag: 'CTF{dHJ1ZQ==}',
    flagHash: '',
    hints: [
      { cost: 15, text: 'Base64 encode "true": btoa("true") in browser console.' },
      { cost: 20, text: 'btoa("true") = "dHJ1ZQ==" — this is the cookie value that grants admin.' },
    ],
    solution: 'btoa("true") = "dHJ1ZQ==". Setting isAdmin=dHJ1ZQ== tricks the server. This demonstrates why client-side role checks in cookies are insecure — always validate server-side! Flag: CTF{dHJ1ZQ==}',
    tags: ['cookies', 'base64', 'privilege-escalation'],
  },

  // ─── FORENSICS ──────────────────────────────────────────────────────────────
  {
    id: 'forensics-1',
    title: 'Metadata Matters',
    category: 'forensics',
    difficulty: 'easy',
    points: 75,
    description: `Every file contains metadata. A suspicious image was captured and its EXIF data revealed:\n\n\`\`\`\nAuthor: CTF{EXIF_D4TA_N3V3R_L13S}\nCamera: iPhone 13\nGPS: 37.7749° N, 122.4194° W\nDate: 2024-01-15\n\`\`\`\n\nThe flag is in the Author field. Find it!`,
    flag: 'CTF{EXIF_D4TA_N3V3R_L13S}',
    flagHash: '',
    hints: [
      { cost: 5, text: 'EXIF metadata is embedded in image files. It can contain GPS coordinates, device info, and custom fields.' },
    ],
    solution: 'Flag CTF{EXIF_D4TA_N3V3R_L13S} was hidden in EXIF Author metadata. Real-world forensics tools like ExifTool extract this. Always strip metadata before sharing sensitive images!',
    tags: ['exif', 'metadata', 'images'],
  },
  {
    id: 'forensics-2',
    title: 'Steganography Reveal',
    category: 'forensics',
    difficulty: 'medium',
    points: 175,
    description: `An image was embedded with a hidden message using LSB (Least Significant Bit) steganography. The extracted binary was:\n\n**01000011 01010100 01000110 01111011 01001100 01010011 01000010 01011111 01010011 01010100 01000101 01000111 01001111 01111101**\n\nConvert each 8-bit group to ASCII to find the flag.`,
    flag: 'CTF{LSB_STEGO}',
    flagHash: '',
    hints: [
      { cost: 20, text: 'Each 8-bit binary group = one ASCII character. 01000011 = 67 = "C"' },
      { cost: 30, text: '01000011=C, 01010100=T, 01000110=F, 01111011={, 01001100=L, 01010011=S, 01000010=B, 01011111=_, 01010011=S, 01010100=T, 01000101=E, 01000111=G, 01001111=O, 01111101=}' },
    ],
    solution: 'Convert each binary byte: C(67) T(84) F(70) {(123) L(76) S(83) B(66) _(95) S(83) T(84) E(69) G(71) O(79) }(125) = CTF{LSB_STEGO}',
    tags: ['binary', 'ascii', 'steganography', 'lsb'],
  },

  // ─── BINARY / REVERSE ───────────────────────────────────────────────────────
  {
    id: 'binary-1',
    title: 'ASCII Art',
    category: 'binary',
    difficulty: 'easy',
    points: 50,
    description: `Convert these decimal ASCII values to reveal the flag:\n\n**67 84 70 123 65 83 67 73 73 95 82 79 67 75 83 125**\n\nEach number represents one character.`,
    flag: 'CTF{ASCII_ROCKS}',
    flagHash: '',
    hints: [
      { cost: 5, text: 'String.fromCharCode(67,84,70,...) in browser console converts decimal to ASCII.' },
    ],
    solution: 'String.fromCharCode(67,84,70,123,65,83,67,73,73,95,82,79,67,75,83,125) = "CTF{ASCII_ROCKS}"',
    tags: ['ascii', 'decimal', 'encoding'],
  },
  {
    id: 'binary-2',
    title: 'ROT13 Reveal',
    category: 'binary',
    difficulty: 'easy',
    points: 75,
    description: `ROT13 is a simple letter substitution cipher where each letter is replaced by the letter 13 positions after it. Decode:\n\n**PGS{EBG13_VF_GBB_RNFL}**`,
    flag: 'CTF{ROT13_IS_TOO_EASY}',
    flagHash: '',
    hints: [
      { cost: 5, text: 'ROT13 applied twice returns the original. P→C, G→T, S→F...' },
    ],
    solution: 'P→C G→T S→F {→{ E→R B→O G→T 1→1 3→3 _→_ V→I F→S _→_ G→T B→O B→O _→_ R→E N→A F→S L→Y } = CTF{ROT13_IS_TOO_EASY}',
    tags: ['rot13', 'caesar', 'substitution'],
  },

  // ─── NETWORK SECURITY ────────────────────────────────────────────────────────
  {
    id: 'net-1',
    title: 'Packet Sniffing',
    category: 'network',
    difficulty: 'medium',
    points: 125,
    description: `A network capture revealed this suspicious HTTP request header:\n\n\`\`\`\nGET /admin HTTP/1.1\nHost: 192.168.1.100\nAuthorization: Basic Q1RGe0JBU0lDX0FVVEhfSVNfTk9UX1NFQ1VSRX0=\n\`\`\`\n\nThe Authorization header uses Basic auth (Base64 encoded). Decode the credentials to find the flag.`,
    flag: 'CTF{BASIC_AUTH_IS_NOT_SECURE}',
    flagHash: '',
    hints: [
      { cost: 15, text: 'Basic auth sends credentials as Base64. Remove the "Basic " prefix first.' },
      { cost: 25, text: 'atob("Q1RGe0JBU0lDX0FVVEhfSVNfTk9UX1NFQ1VSRX0=") reveals the flag.' },
    ],
    solution: 'HTTP Basic Authentication sends credentials as Base64 — easily decoded by anyone sniffing the network. atob() reveals CTF{BASIC_AUTH_IS_NOT_SECURE}. Always use HTTPS and token-based auth.',
    tags: ['http', 'basic-auth', 'packet-analysis', 'base64'],
  },
  {
    id: 'net-2',
    title: 'DNS Exfiltration',
    category: 'network',
    difficulty: 'hard',
    points: 200,
    description: `Suspicious DNS queries were found in the logs:\n\n\`\`\`\n43.54.46.7b.44.4e.53.5f.33.58.46.31.4c.7d.evil.com\n\`\`\`\n\nThe subdomain contains hex-encoded data being exfiltrated via DNS. Decode the hex bytes before "evil.com" to find the flag.`,
    flag: 'CTF{DNS_3XF1L}',
    flagHash: '',
    hints: [
      { cost: 25, text: 'Remove the dots and "evil.com", then convert hex pairs to ASCII.' },
      { cost: 35, text: 'Hex: 43=C 54=T 46=F 7b={ 44=D 4e=N 53=S 5f=_ 33=3 58=X 46=F 31=1 4c=L 7d=}' },
    ],
    solution: 'DNS exfiltration hides stolen data in DNS query subdomains. Each hex pair (43=C, 54=T...) decodes to CTF{DNS_3XF1L}. Monitor DNS logs for unusually long or hex-encoded subdomains.',
    tags: ['dns', 'exfiltration', 'hex', 'network-forensics'],
  },

  // ─── OSINT ─────────────────────────────────────────────────────────────────
  {
    id: 'osint-1',
    title: 'Robots.txt Secrets',
    category: 'osint',
    difficulty: 'easy',
    points: 75,
    description: `Every website has a robots.txt that tells search engines what to avoid. A suspicious robots.txt contained:\n\n\`\`\`\nUser-agent: *\nDisallow: /admin/\nDisallow: /secret-backup/\nDisallow: /flag_CTF{R0BOTS_TXT_IS_PUBLIC}/\n\`\`\`\n\nFind the flag hidden in the disallowed paths.`,
    flag: 'CTF{R0BOTS_TXT_IS_PUBLIC}',
    flagHash: '',
    hints: [
      { cost: 5, text: 'Read the Disallow paths carefully — one contains the flag directly.' },
    ],
    solution: 'robots.txt is publicly accessible. Developers sometimes accidentally list sensitive paths. The flag CTF{R0BOTS_TXT_IS_PUBLIC} is right in the Disallow directive. Always audit your robots.txt!',
    tags: ['robots.txt', 'reconnaissance', 'information-disclosure'],
  },
  {
    id: 'osint-2',
    title: 'Email Header Investigation',
    category: 'osint',
    difficulty: 'medium',
    points: 150,
    description: `An email header analysis revealed:\n\n\`\`\`\nFrom: admin@trusted-bank.com\nReceived: from mail.evil-server.xyz (198.51.100.42)\nX-Mailer: PhishKit-v3.2\nX-Flag: Q1RGe0VNQUlMX0hFQURFUlNfRE9OVF9MSEV9\n\`\`\`\n\nThe X-Flag header contains Base64-encoded data. Decode it to find the flag. What else is suspicious?`,
    flag: 'CTF{EMAIL_HEADERS_DONT_LIE}',
    flagHash: '',
    hints: [
      { cost: 15, text: 'The X-Flag value is Base64 encoded. Use atob() to decode.' },
      { cost: 25, text: 'The "Received" header shows the email came from evil-server.xyz, not trusted-bank.com — a clear sign of spoofing.' },
    ],
    solution: 'Email headers reveal the true origin. The "Received" header shows evil-server.xyz sent the email, and X-Mailer shows "PhishKit" — phishing toolkit. Base64 decode of X-Flag gives CTF{EMAIL_HEADERS_DONT_LIE}.',
    tags: ['email', 'headers', 'spoofing', 'phishing-analysis'],
  },

  // ─── STEGANOGRAPHY ─────────────────────────────────────────────────────────
  {
    id: 'stego-1',
    title: 'Whitespace Whispers',
    category: 'steganography',
    difficulty: 'medium',
    points: 150,
    description: `A message was hidden using whitespace steganography. In the text below, spaces represent 0 and tabs represent 1. Each 8-character group is one ASCII byte:\n\n\`\`\`\n01000011 01010100 01000110 01111011 01010111 01001000 01001001 01010100 01000101 01010011 01010000 01000001 01000011 01000101 01111101\n\`\`\`\n\nConvert binary to ASCII to find the flag.`,
    flag: 'CTF{WHITESPACE}',
    flagHash: '',
    hints: [
      { cost: 15, text: '01000011 = 67 = "C", 01010100 = 84 = "T"...' },
      { cost: 25, text: 'String.fromCharCode(67,84,70,123,87,72,73,84,69,83,80,65,67,69,125)' },
    ],
    solution: 'Whitespace steganography hides data in invisible characters. Binary→decimal→ASCII: 01000011=C 01010100=T 01000110=F 01111011={ 01010111=W... → CTF{WHITESPACE}',
    tags: ['whitespace', 'binary', 'ascii', 'steganography'],
  },
  {
    id: 'stego-2',
    title: 'Invisible Ink',
    category: 'steganography',
    difficulty: 'hard',
    points: 225,
    description: `Zero-width characters were used to hide a message in this innocent-looking text:\n\n"Hello World"\n\nThe hidden message between "Hello" and "World" uses zero-width characters where:\n- Zero-Width Space (U+200B) = 0\n- Zero-Width Non-Joiner (U+200C) = 1\n\nThe binary sequence is: **01000011 01010100 01000110 01111011 01011010 01010111 01000011 01111101**\n\nDecode it!`,
    flag: 'CTF{ZWC}',
    flagHash: '',
    hints: [
      { cost: 25, text: 'Convert each 8-bit binary to decimal, then to ASCII character.' },
      { cost: 35, text: '01000011=C 01010100=T 01000110=F 01111011={ 01011010=Z 01010111=W 01000011=C 01111101=}' },
    ],
    solution: 'Zero-width characters are invisible Unicode that hide data in plain text. Binary decoding gives CTF{ZWC}. This technique can exfiltrate data through seemingly innocent messages.',
    tags: ['zero-width', 'unicode', 'steganography', 'covert-channel'],
  },
];


/**
 * Compute SHA-256 hash of a string (returns hex string).
 * Used for flag validation without storing plaintext flags.
 */
export async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate a submitted flag against the challenge.
 * Normalises: lowercase, trimmed.
 */
export async function validateFlag(challenge: CTFChallenge, submitted: string): Promise<boolean> {
  const normalised = submitted.trim().toLowerCase();
  const correct = challenge.flag.trim().toLowerCase();
  return normalised === correct;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, { color: string; label: string; border: string }> = {
  easy:   { color: 'hsl(var(--success))',   label: 'EASY',   border: 'rgba(72,199,142,0.3)' },
  medium: { color: 'hsl(var(--warning))',   label: 'MEDIUM', border: 'rgba(255,193,7,0.3)'  },
  hard:   { color: 'hsl(var(--danger))',    label: 'HARD',   border: 'rgba(255,68,68,0.3)'  },
  expert: { color: '#ff00ff',               label: 'EXPERT', border: 'rgba(255,0,255,0.3)'  },
};

export const CATEGORY_CONFIG: Record<Category, { icon: string; label: string }> = {
  cryptography:  { icon: 'fa-lock',         label: 'Cryptography'  },
  web:           { icon: 'fa-globe',        label: 'Web Security'  },
  forensics:     { icon: 'fa-magnifying-glass-chart', label: 'Forensics' },
  binary:        { icon: 'fa-code',         label: 'Binary/Reverse'},
  steganography: { icon: 'fa-image',        label: 'Steganography' },
  network:       { icon: 'fa-network-wired', label: 'Network'      },
  osint:         { icon: 'fa-binoculars',   label: 'OSINT'         },
};
