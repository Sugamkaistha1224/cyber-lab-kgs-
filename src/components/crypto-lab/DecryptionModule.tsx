import { useState } from 'react';
import { decryptAES256GCM } from '@/utils/crypto';

const DecryptionModule = () => {
  const [ciphertext, setCiphertext] = useState('');
  const [iv, setIv] = useState('');
  const [salt, setSalt] = useState('');
  const [password, setPassword] = useState('');
  const [decrypted, setDecrypted] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecrypt = async () => {
    if (!ciphertext.trim() || !iv.trim() || !salt.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDecrypted(null);

    try {
      const result = await decryptAES256GCM(ciphertext, iv, salt, password);
      setDecrypted(result);
    } catch (err) {
      setError('Decryption failed. Invalid password or corrupted data.');
      console.error('Decryption error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteAll = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      if (data.ciphertext) setCiphertext(data.ciphertext);
      if (data.iv) setIv(data.iv);
      if (data.salt) setSalt(data.salt);
    } catch {
      setError('Invalid clipboard data. Expected JSON format.');
    }
  };

  return (
    <div className="crypto-lab-container">
      <div className="crypto-buttons" style={{ marginBottom: '1rem' }}>
        <button className="crypto-btn crypto-btn-secondary" onClick={handlePasteAll}>
          <i className="fa-solid fa-paste"></i>
          Paste Encrypted Data
        </button>
      </div>

      <div className="crypto-input-group">
        <label>Encrypted Ciphertext (Base64)</label>
        <textarea
          className="crypto-input crypto-textarea"
          placeholder="Paste encrypted ciphertext..."
          value={ciphertext}
          onChange={(e) => setCiphertext(e.target.value)}
        />
      </div>

      <div className="hash-comparison">
        <div className="crypto-input-group" style={{ marginBottom: 0 }}>
          <label>IV (Initialization Vector)</label>
          <input
            type="text"
            className="crypto-input"
            placeholder="IV..."
            value={iv}
            onChange={(e) => setIv(e.target.value)}
          />
        </div>
        <div className="crypto-input-group" style={{ marginBottom: 0 }}>
          <label>Salt</label>
          <input
            type="text"
            className="crypto-input"
            placeholder="Salt..."
            value={salt}
            onChange={(e) => setSalt(e.target.value)}
          />
        </div>
      </div>

      <div className="crypto-input-group">
        <label>Decryption Password</label>
        <input
          type="password"
          className="crypto-input"
          placeholder="Enter password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="crypto-buttons">
        <button
          className="crypto-btn"
          onClick={handleDecrypt}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Decrypting...
            </>
          ) : (
            <>
              <i className="fa-solid fa-unlock"></i>
              Decrypt Message
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

      {decrypted && (
        <>
          <div className="crypto-output">
            <span className="crypto-output-label">Decrypted Message</span>
            {decrypted}
          </div>
          <div className="crypto-status success">
            <i className="fa-solid fa-check-circle"></i>
            Decryption successful! Message integrity verified.
          </div>
        </>
      )}
    </div>
  );
};

export default DecryptionModule;
