import { useState } from 'react';
import { 
  generateRSAKeyPair, 
  signData, 
  verifySignature,
  exportPublicKeyPEM,
  exportPrivateKeyPEM 
} from '@/utils/crypto';

const SignatureModule = () => {
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);
  const [publicKeyPEM, setPublicKeyPEM] = useState<string | null>(null);
  const [privateKeyPEM, setPrivateKeyPEM] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationSignature, setVerificationSignature] = useState('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateKeys = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const keys = await generateRSAKeyPair();
      setKeyPair(keys);
      
      const pubPEM = await exportPublicKeyPEM(keys.publicKey);
      const privPEM = await exportPrivateKeyPEM(keys.privateKey);
      
      setPublicKeyPEM(pubPEM);
      setPrivateKeyPEM(privPEM);
      setSignature(null);
      setIsVerified(null);
    } catch (err) {
      setError('Failed to generate key pair');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    if (!keyPair || !message.trim()) {
      setError('Please generate keys and enter a message');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sig = await signData(message, keyPair.privateKey);
      setSignature(sig);
      setVerificationMessage(message);
      setVerificationSignature(sig);
    } catch (err) {
      setError('Failed to sign message');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!keyPair || !verificationMessage.trim() || !verificationSignature.trim()) {
      setError('Please enter message and signature to verify');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await verifySignature(
        verificationMessage,
        verificationSignature,
        keyPair.publicKey
      );
      setIsVerified(result);
    } catch (err) {
      setIsVerified(false);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="crypto-lab-container">
      <div className="crypto-buttons">
        <button
          className="crypto-btn"
          onClick={handleGenerateKeys}
          disabled={isLoading}
        >
          {isLoading && !keyPair ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Generating...
            </>
          ) : (
            <>
              <i className="fa-solid fa-key"></i>
              Generate RSA-2048 Key Pair
            </>
          )}
        </button>
      </div>

      {keyPair && (
        <>
          <div className="signature-keys">
            <div className="key-box">
              <h4><i className="fa-solid fa-lock-open"></i> Public Key</h4>
              <code>{publicKeyPEM}</code>
            </div>
            <div className="key-box">
              <h4><i className="fa-solid fa-lock"></i> Private Key (Keep Secret!)</h4>
              <code>{privateKeyPEM}</code>
            </div>
          </div>

          <div className="crypto-input-group">
            <label>Message to Sign</label>
            <textarea
              className="crypto-input crypto-textarea"
              placeholder="Enter message to sign..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="crypto-buttons">
            <button
              className="crypto-btn"
              onClick={handleSign}
              disabled={isLoading || !message.trim()}
            >
              <i className="fa-solid fa-signature"></i>
              Sign Message
            </button>
          </div>

          {signature && (
            <>
              <div className="crypto-output">
                <span className="crypto-output-label">Digital Signature (Base64)</span>
                {signature}
              </div>

              <div className="crypto-status success">
                <i className="fa-solid fa-check-circle"></i>
                Message signed with RSA-PSS!
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(0,255,136,0.2)', paddingTop: '1.5rem' }}>
                <h4 style={{ color: 'var(--primary-hex)', marginBottom: '1rem', fontFamily: 'var(--font-tech)' }}>
                  Verify Signature
                </h4>
                
                <div className="crypto-input-group">
                  <label>Message to Verify</label>
                  <textarea
                    className="crypto-input crypto-textarea"
                    placeholder="Enter message..."
                    value={verificationMessage}
                    onChange={(e) => setVerificationMessage(e.target.value)}
                  />
                </div>

                <div className="crypto-input-group">
                  <label>Signature to Verify</label>
                  <textarea
                    className="crypto-input crypto-textarea"
                    placeholder="Enter signature..."
                    value={verificationSignature}
                    onChange={(e) => setVerificationSignature(e.target.value)}
                  />
                </div>

                <div className="crypto-buttons">
                  <button
                    className="crypto-btn crypto-btn-secondary"
                    onClick={handleVerify}
                    disabled={isLoading}
                  >
                    <i className="fa-solid fa-shield-check"></i>
                    Verify Signature
                  </button>
                </div>

                {isVerified !== null && (
                  isVerified ? (
                    <div className="crypto-status success">
                      <i className="fa-solid fa-check-circle"></i>
                      Signature VALID! Message is authentic.
                    </div>
                  ) : (
                    <div className="crypto-status error">
                      <i className="fa-solid fa-times-circle"></i>
                      Signature INVALID! Message may be tampered.
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </>
      )}

      {error && (
        <div className="crypto-status error">
          <i className="fa-solid fa-circle-exclamation"></i>
          {error}
        </div>
      )}
    </div>
  );
};

export default SignatureModule;
