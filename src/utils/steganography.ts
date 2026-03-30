/**
 * Image Steganography using LSB (Least Significant Bit) encoding
 * Allows hiding messages inside images by modifying pixel data
 */

// End-of-message delimiter (unique byte sequence)
const END_DELIMITER = '<<END>>';

/**
 * Convert text to binary string
 */
function textToBinary(text: string): string {
  return Array.from(text)
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

/**
 * Convert binary string to text
 */
function binaryToText(binary: string): string {
  const bytes = binary.match(/.{8}/g);
  if (!bytes) return '';
  return bytes
    .map(byte => String.fromCharCode(parseInt(byte, 2)))
    .join('');
}

/**
 * Calculate the maximum message capacity of an image
 * Each pixel has 4 channels (RGBA), but we only use RGB (3 channels)
 * Each channel can store 1 bit in LSB
 */
export function calculateCapacity(width: number, height: number): number {
  const totalBits = width * height * 3; // 3 bits per pixel (RGB)
  const totalBytes = Math.floor(totalBits / 8);
  const delimiterSize = END_DELIMITER.length;
  return totalBytes - delimiterSize - 1; // Reserve space for delimiter
}

/**
 * Embed a message into an image using LSB steganography
 * @param imageData - ImageData from canvas
 * @param message - Message to hide
 * @returns Modified ImageData with hidden message
 */
export function embedMessage(
  imageData: ImageData,
  message: string
): ImageData {
  const capacity = calculateCapacity(imageData.width, imageData.height);
  
  if (message.length > capacity) {
    throw new Error(`Message too long. Maximum capacity: ${capacity} characters`);
  }
  
  // Add delimiter to mark end of message
  const fullMessage = message + END_DELIMITER;
  const binaryMessage = textToBinary(fullMessage);
  
  const data = new Uint8ClampedArray(imageData.data);
  let bitIndex = 0;
  
  // Iterate through pixels
  for (let i = 0; i < data.length && bitIndex < binaryMessage.length; i++) {
    // Skip alpha channel (every 4th byte starting at index 3)
    if ((i + 1) % 4 === 0) continue;
    
    // Get the current bit from the message
    const bit = parseInt(binaryMessage[bitIndex], 2);
    
    // Modify LSB of pixel channel
    data[i] = (data[i] & 0xFE) | bit;
    
    bitIndex++;
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Extract a hidden message from an image
 * @param imageData - ImageData from canvas
 * @returns Extracted message or null if no message found
 */
export function extractMessage(imageData: ImageData): string | null {
  const data = imageData.data;
  let binaryMessage = '';
  
  // Extract LSBs from pixel channels
  for (let i = 0; i < data.length; i++) {
    // Skip alpha channel
    if ((i + 1) % 4 === 0) continue;
    
    // Extract LSB
    binaryMessage += (data[i] & 1).toString();
    
    // Check periodically for delimiter to avoid processing entire image
    if (binaryMessage.length % 8 === 0 && binaryMessage.length >= END_DELIMITER.length * 8) {
      const currentText = binaryToText(binaryMessage);
      if (currentText.includes(END_DELIMITER)) {
        const message = currentText.split(END_DELIMITER)[0];
        return message;
      }
    }
  }
  
  // Final check
  const text = binaryToText(binaryMessage);
  if (text.includes(END_DELIMITER)) {
    return text.split(END_DELIMITER)[0];
  }
  
  return null;
}

/**
 * Load an image file and return its ImageData
 */
export function loadImageData(file: File): Promise<{ imageData: ImageData; canvas: HTMLCanvasElement }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        resolve({ imageData, canvas });
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert canvas to downloadable blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Create and trigger download for a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
