/**
 * Cryptographic Utilities using Web Crypto API
 * Implements AES-256-GCM encryption, SHA-256 hashing, and related functions
 */

// Convert string to Uint8Array
export function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Convert ArrayBuffer to string
export function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// Convert Uint8Array to Base64
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert ArrayBuffer to Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return uint8ArrayToBase64(new Uint8Array(buffer));
}

// Convert Base64 to Uint8Array
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate a random IV (Initialization Vector)
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
}

// Generate a random salt for key derivation
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16)); // 128-bit salt
}

/**
 * Derive a cryptographic key from a password using PBKDF2
 * Uses 100,000 iterations for security
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const passwordBytes = stringToUint8Array(password);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes.buffer as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive AES-256-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // Not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * AES-256-GCM Encryption
 * Returns an object containing the encrypted data, IV, and salt (all Base64 encoded)
 */
export async function encryptAES256GCM(
  plaintext: string,
  password: string
): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(password, salt);
  const plaintextBytes = stringToUint8Array(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    plaintextBytes.buffer as ArrayBuffer
  );

  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: uint8ArrayToBase64(iv),
    salt: uint8ArrayToBase64(salt),
  };
}

/**
 * AES-256-GCM Decryption
 * Takes encrypted data, IV, salt (Base64), and password to restore plaintext
 */
export async function decryptAES256GCM(
  ciphertext: string,
  iv: string,
  salt: string,
  password: string
): Promise<string> {
  const saltArray = base64ToUint8Array(salt);
  const ivArray = base64ToUint8Array(iv);
  const ciphertextArray = base64ToUint8Array(ciphertext);
  const key = await deriveKey(password, saltArray);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArray.buffer as ArrayBuffer },
    key,
    ciphertextArray.buffer as ArrayBuffer
  );

  return arrayBufferToString(decrypted);
}

/**
 * SHA-256 Hash
 * Returns the hash as a hex string
 */
export async function hashSHA256(data: string): Promise<string> {
  const dataBytes = stringToUint8Array(data);
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    dataBytes.buffer as ArrayBuffer
  );
  
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate RSA Key Pair for Digital Signatures
 */
export async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // Extractable for demo purposes
    ['sign', 'verify']
  );
}

/**
 * Sign data using RSA-PSS
 */
export async function signData(
  data: string,
  privateKey: CryptoKey
): Promise<string> {
  const dataBytes = stringToUint8Array(data);
  const signature = await crypto.subtle.sign(
    { name: 'RSA-PSS', saltLength: 32 },
    privateKey,
    dataBytes.buffer as ArrayBuffer
  );
  
  return arrayBufferToBase64(signature);
}

/**
 * Verify signature using RSA-PSS
 */
export async function verifySignature(
  data: string,
  signature: string,
  publicKey: CryptoKey
): Promise<boolean> {
  const dataBytes = stringToUint8Array(data);
  const signatureBytes = base64ToUint8Array(signature);
  
  return crypto.subtle.verify(
    { name: 'RSA-PSS', saltLength: 32 },
    publicKey,
    signatureBytes.buffer as ArrayBuffer,
    dataBytes.buffer as ArrayBuffer
  );
}

/**
 * Export public key to PEM format for display
 */
export async function exportPublicKeyPEM(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', key);
  const base64 = arrayBufferToBase64(exported);
  return `-----BEGIN PUBLIC KEY-----\n${base64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
}

/**
 * Export private key to PEM format for display (demo only - never expose in production!)
 */
export async function exportPrivateKeyPEM(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('pkcs8', key);
  const base64 = arrayBufferToBase64(exported);
  return `-----BEGIN PRIVATE KEY-----\n${base64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;
}
