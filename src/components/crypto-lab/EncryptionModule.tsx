import { useState } from 'react';
import { encryptAES256GCM } from '@/utils/crypto';

interface EncryptionModuleProps {
  onEncrypted?: (data: { ciphertext: string; iv: string; salt: string }) => void;
}

const EncryptionModule = ({ onEncrypted }: EncryptionModuleProps) => {
  const [plaintext, setPlaintext] = useState('');
  const [password, setPassword] = useState('');
  const [encrypted, setEncrypted] = useState<{ ciphertext: string; iv: string; salt: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEncrypt = async () => {
    if (!plaintext.trim() || !password.trim()) {
      setError('Please enter both message and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await encryptAES256GCM(plaintext, password);
      setEncrypted(result);
      onEncrypted?.(result);
    } catch (err) {
      setError('Encryption failed. Please try again.');
      console.error('Encryption error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="crypto-lab-container">
      <div className="crypto-input-group">
        <label>Message to Encrypt</label>
        <textarea
          className="crypto-input crypto-textarea"
          placeholder="Enter your secret message..."
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
        />
      </div>

      <div className="crypto-input-group">
        <label>Encryption Password</label>
        <input
          type="password"
          className="crypto-input"
          placeholder="Enter secure password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="crypto-buttons">
        <button
          className="crypto-btn"
          onClick={handleEncrypt}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Encrypting...
            </>
          ) : (
            <>
              <i className="fa-solid fa-lock"></i>
              Encrypt Message
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="crypto-status error">
          <i className="fa-solid fa-circle-exclamation"></i>
          {error}
        </div>
      )}

      {encrypted && (
        <>
          <div className="crypto-output">
            <span className="crypto-output-label">Encrypted Output (Base64)</span>
            {encrypted.ciphertext}
          </div>
          <div className="hash-comparison">
            <div className="hash-box">
              <h4>IV (Initialization Vector)</h4>
              <code>{encrypted.iv}</code>
            </div>
            <div className="hash-box">
              <h4>Salt (Key Derivation)</h4>
              <code>{encrypted.salt}</code>
            </div>
          </div>
          <div className="crypto-buttons" style={{ marginTop: '1rem' }}>
            <button
              className="crypto-btn crypto-btn-secondary"
              onClick={() => copyToClipboard(JSON.stringify(encrypted))}
            >
              <i className="fa-solid fa-copy"></i>
              Copy All
            </button>
          </div>
          <div className="crypto-status success">
            <i className="fa-solid fa-check-circle"></i>
            AES-256-GCM encryption successful!
          </div>
        </>
      )}
    </div>
  );
};

export default EncryptionModule;
