/**
 * File Encryption Utilities using Web Crypto API
 * Supports encrypting/decrypting any file type with AES-256-GCM
 */

import { deriveKey, generateIV, generateSalt, uint8ArrayToBase64, base64ToUint8Array } from './crypto';

interface EncryptedFileData {
  encryptedData: ArrayBuffer;
  iv: string;
  salt: string;
  originalName: string;
  originalType: string;
  originalSize: number;
}

/**
 * Encrypt a file using AES-256-GCM with password-based key derivation
 */
export async function encryptFile(
  file: File,
  password: string
): Promise<{ blob: Blob; metadata: { iv: string; salt: string; originalName: string; originalType: string; originalSize: number } }> {
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(password, salt);

  const fileBuffer = await file.arrayBuffer();

  // Create metadata header
  const metadata = {
    originalName: file.name,
    originalType: file.type,
    originalSize: file.size,
  };
  const metadataStr = JSON.stringify(metadata);
  const metadataBytes = new TextEncoder().encode(metadataStr);
  
  // Prepend metadata length (4 bytes) + metadata + file data
  const combinedBuffer = new ArrayBuffer(4 + metadataBytes.length + fileBuffer.byteLength);
  const combinedView = new DataView(combinedBuffer);
  combinedView.setUint32(0, metadataBytes.length, true);
  new Uint8Array(combinedBuffer, 4, metadataBytes.length).set(metadataBytes);
  new Uint8Array(combinedBuffer, 4 + metadataBytes.length).set(new Uint8Array(fileBuffer));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    combinedBuffer
  );

  const blob = new Blob([encrypted], { type: 'application/octet-stream' });

  return {
    blob,
    metadata: {
      iv: uint8ArrayToBase64(iv),
      salt: uint8ArrayToBase64(salt),
      ...metadata,
    },
  };
}

/**
 * Decrypt an encrypted file
 */
export async function decryptFile(
  encryptedBlob: Blob,
  iv: string,
  salt: string,
  password: string
): Promise<{ blob: Blob; metadata: { originalName: string; originalType: string; originalSize: number } }> {
  const saltArray = base64ToUint8Array(salt);
  const ivArray = base64ToUint8Array(iv);
  const key = await deriveKey(password, saltArray);

  const encryptedBuffer = await encryptedBlob.arrayBuffer();

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArray.buffer as ArrayBuffer },
    key,
    encryptedBuffer
  );

  // Extract metadata
  const view = new DataView(decrypted);
  const metadataLength = view.getUint32(0, true);
  const metadataBytes = new Uint8Array(decrypted, 4, metadataLength);
  const metadata = JSON.parse(new TextDecoder().decode(metadataBytes));

  // Extract file data
  const fileData = decrypted.slice(4 + metadataLength);
  const blob = new Blob([fileData], { type: metadata.originalType || 'application/octet-stream' });

  return { blob, metadata };
}

/**
 * Download a blob as a file
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
