import { useState } from 'react';
import { hashSHA256 } from '@/utils/crypto';

const HashingModule = () => {
  const [originalData, setOriginalData] = useState('');
  const [modifiedData, setModifiedData] = useState('');
  const [originalHash, setOriginalHash] = useState<string | null>(null);
  const [modifiedHash, setModifiedHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateHash = async () => {
    if (!originalData.trim()) return;

    setIsLoading(true);
    try {
      const hash = await hashSHA256(originalData);
      setOriginalHash(hash);
      setModifiedHash(null);
      setModifiedData(originalData);
    } catch (err) {
      console.error('Hashing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    if (!modifiedData.trim()) return;

    setIsLoading(true);
    try {
      const hash = await hashSHA256(modifiedData);
      setModifiedHash(hash);
    } catch (err) {
      console.error('Hashing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isIntact = originalHash && modifiedHash && originalHash === modifiedHash;
  const isTampered = originalHash && modifiedHash && originalHash !== modifiedHash;

  return (
    <div className="crypto-lab-container">
      <div className="crypto-input-group">
        <label>Original Data</label>
        <textarea
          className="crypto-input crypto-textarea"
          placeholder="Enter data to hash..."
          value={originalData}
          onChange={(e) => setOriginalData(e.target.value)}
        />
      </div>

      <div className="crypto-buttons">
        <button
          className="crypto-btn"
          onClick={handleGenerateHash}
          disabled={isLoading || !originalData.trim()}
        >
          {isLoading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Hashing...
            </>
          ) : (
            <>
              <i className="fa-solid fa-fingerprint"></i>
              Generate SHA-256 Hash
            </>
          )}
        </button>
      </div>

      {originalHash && (
        <>
          <div className="crypto-output">
            <span className="crypto-output-label">SHA-256 Hash (Original)</span>
            {originalHash}
          </div>

          <div className="crypto-input-group" style={{ marginTop: '1.5rem' }}>
            <label>Verify Data Integrity (Modify to test tamper detection)</label>
            <textarea
              className="crypto-input crypto-textarea"
              placeholder="Modify data to test integrity..."
              value={modifiedData}
              onChange={(e) => setModifiedData(e.target.value)}
            />
          </div>

          <div className="crypto-buttons">
            <button
              className="crypto-btn crypto-btn-secondary"
              onClick={handleVerifyIntegrity}
              disabled={isLoading}
            >
              <i className="fa-solid fa-shield-check"></i>
              Verify Integrity
            </button>
          </div>

          {modifiedHash && (
            <>
              <div className="hash-comparison">
                <div className="hash-box">
                  <h4>Original Hash</h4>
                  <code>{originalHash}</code>
                </div>
                <div className="hash-box">
                  <h4>Current Hash</h4>
                  <code>{modifiedHash}</code>
                </div>
              </div>

              {isIntact && (
                <div className="crypto-status success">
                  <i className="fa-solid fa-check-circle"></i>
                  Data integrity verified! No tampering detected.
                </div>
              )}

              {isTampered && (
                <div className="crypto-status error">
                  <i className="fa-solid fa-exclamation-triangle"></i>
                  WARNING: Data tampering detected! Hashes do not match.
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default HashingModule;
