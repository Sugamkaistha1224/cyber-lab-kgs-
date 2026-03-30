/**
 * Blockchain-Style Hash Chain Utilities
 * Educational demonstration of blockchain fundamentals
 */

import { hashSHA256 } from './crypto';

export interface Block {
  index: number;
  timestamp: number;
  data: string;
  previousHash: string;
  hash: string;
  nonce: number;
  isValid: boolean;
}

/**
 * Calculate block hash from block properties
 */
export async function calculateBlockHash(
  index: number,
  timestamp: number,
  data: string,
  previousHash: string,
  nonce: number
): Promise<string> {
  const blockString = `${index}${timestamp}${data}${previousHash}${nonce}`;
  return hashSHA256(blockString);
}

/**
 * Create genesis block (first block in chain)
 */
export async function createGenesisBlock(): Promise<Block> {
  const index = 0;
  const timestamp = Date.now();
  const data = 'Genesis Block';
  const previousHash = '0'.repeat(64);
  const nonce = 0;
  const hash = await calculateBlockHash(index, timestamp, data, previousHash, nonce);
  
  return { index, timestamp, data, previousHash, hash, nonce, isValid: true };
}

/**
 * Create a new block in the chain
 */
export async function createBlock(
  chain: Block[],
  data: string
): Promise<Block> {
  const previousBlock = chain[chain.length - 1];
  const index = previousBlock.index + 1;
  const timestamp = Date.now();
  const previousHash = previousBlock.hash;
  const nonce = Math.floor(Math.random() * 10000);
  const hash = await calculateBlockHash(index, timestamp, data, previousHash, nonce);
  
  return { index, timestamp, data, previousHash, hash, nonce, isValid: true };
}

/**
 * Validate entire chain integrity
 */
export async function validateChain(chain: Block[]): Promise<Block[]> {
  const validatedChain: Block[] = [];
  
  for (let i = 0; i < chain.length; i++) {
    const block = { ...chain[i] };
    
    // Recalculate hash
    const expectedHash = await calculateBlockHash(
      block.index, block.timestamp, block.data, block.previousHash, block.nonce
    );
    
    // Check hash integrity
    const hashValid = block.hash === expectedHash;
    
    // Check previous hash link (skip genesis block)
    const linkValid = i === 0 || block.previousHash === chain[i - 1].hash;
    
    block.isValid = hashValid && linkValid;
    validatedChain.push(block);
    
    // If this block is invalid, all subsequent blocks are also invalid
    if (!block.isValid) {
      for (let j = i + 1; j < chain.length; j++) {
        validatedChain.push({ ...chain[j], isValid: false });
      }
      break;
    }
  }
  
  return validatedChain;
}

/**
 * Tamper with a block's data (for demonstration)
 */
export function tamperBlock(chain: Block[], index: number, newData: string): Block[] {
  return chain.map((block, i) => {
    if (i === index) {
      return { ...block, data: newData };
      // Note: hash is NOT recalculated, so chain will be invalid
    }
    return { ...block };
  });
}
