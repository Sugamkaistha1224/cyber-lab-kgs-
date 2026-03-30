import { useState, useRef } from 'react';
import { encryptFile, decryptFile, downloadFile, formatFileSize } from '@/utils/fileEncryption';

const FileEncryptionModule = () => {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [file, setFile] = useState<File | null>(null);
  const [encryptedBlob, setEncryptedBlob] = useState<Blob | null>(null);
  const [encryptedMeta, setEncryptedMeta] = useState<{ iv: string; salt: string; originalName: string } | null>(null);
  const [password, setPassword] = useState('');
  const [decryptIv, setDecryptIv] = useState('');
  const [decryptSalt, setDecryptSalt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const decryptFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setError(null); setSuccess(null); }
  };

  const handleEncrypt = async () => {
    if (!file || !password.trim()) {
      setError('Please select a file and enter a password'); return;
    }
    setIsLoading(true); setError(null); setSuccess(null);
    try {
      const result = await encryptFile(file, password);
      setEncryptedBlob(result.blob);
      setEncryptedMeta({ iv: result.metadata.iv, salt: result.metadata.salt, originalName: result.metadata.originalName });
      setSuccess(`File encrypted! Size: ${formatFileSize(result.blob.size)}`);
    } catch (err: any) {
      setError(err.message || 'Encryption failed');
    } finally { setIsLoading(false); }
  };

  const handleDownloadEncrypted = () => {
    if (encryptedBlob && encryptedMeta) {
      downloadFile(encryptedBlob, `${encryptedMeta.originalName}.encrypted`);
    }
  };

  const handleCopyMeta = () => {
    if (encryptedMeta) {
      navigator.clipboard.writeText(JSON.stringify({ iv: encryptedMeta.iv, salt: encryptedMeta.salt }));
    }
  };

  const handleDecrypt = async () => {
    if (!file || !password.trim() || !decryptIv.trim() || !decryptSalt.trim()) {
      setError('Please fill in all fields'); return;
    }
    setIsLoading(true); setError(null); setSuccess(null);
    try {
      const result = await decryptFile(file, decryptIv, decryptSalt, password);
      downloadFile(result.blob, result.metadata.originalName || 'decrypted-file');
      setSuccess(`File decrypted! Original: ${result.metadata.originalName}`);
    } catch (err: any) {
      setError('Decryption failed. Wrong password or corrupted file.');
    } finally { setIsLoading(false); }
  };

  const handlePasteMeta = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      if (data.iv) setDecryptIv(data.iv);
      if (data.salt) setDecryptSalt(data.salt);
    } catch { setError('Invalid clipboard data'); }
  };

  return (
    <div className="crypto-lab-container">
      <div className="crypto-buttons" style={{ marginBottom: '1rem' }}>
        <button className={`crypto-btn ${mode === 'encrypt' ? '' : 'crypto-btn-secondary'}`} onClick={() => { setMode('encrypt'); setFile(null); setError(null); setSuccess(null); }}>
          <i className="fa-solid fa-lock"></i> Encrypt File
        </button>
        <button className={`crypto-btn ${mode === 'decrypt' ? '' : 'crypto-btn-secondary'}`} onClick={() => { setMode('decrypt'); setFile(null); setError(null); setSuccess(null); }}>
          <i className="fa-solid fa-unlock"></i> Decrypt File
        </button>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
      <input type="file" ref={decryptFileInputRef} onChange={handleFileSelect} accept=".encrypted" style={{ display: 'none' }} />

      <div className="file-upload-area" onClick={() => mode === 'encrypt' ? fileInputRef.current?.click() : decryptFileInputRef.current?.click()}>
        <i className="fa-solid fa-cloud-upload-alt"></i>
        <p>{mode === 'encrypt' ? 'Click to select a file to encrypt' : 'Click to select an encrypted file'}</p>
        {file && (
          <p style={{ fontSize: '0.8rem', color: 'var(--primary-hex)', marginTop: '0.5rem' }}>
            <i className="fa-solid fa-file"></i> {file.name} ({formatFileSize(file.size)})
          </p>
        )}
      </div>

      <div className="crypto-input-group">
        <label>{mode === 'encrypt' ? 'Encryption' : 'Decryption'} Password</label>
        <input type="password" className="crypto-input" placeholder="Enter secure password..." value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      {mode === 'decrypt' && (
        <>
          <div className="crypto-buttons" style={{ marginBottom: '0.5rem' }}>
            <button className="crypto-btn crypto-btn-secondary" onClick={handlePasteMeta}>
              <i className="fa-solid fa-paste"></i> Paste Metadata
            </button>
          </div>
          <div className="hash-comparison">
            <div className="crypto-input-group" style={{ marginBottom: 0 }}>
              <label>IV</label>
              <input type="text" className="crypto-input" placeholder="IV..." value={decryptIv} onChange={(e) => setDecryptIv(e.target.value)} />
            </div>
            <div className="crypto-input-group" style={{ marginBottom: 0 }}>
              <label>Salt</label>
              <input type="text" className="crypto-input" placeholder="Salt..." value={decryptSalt} onChange={(e) => setDecryptSalt(e.target.value)} />
            </div>
          </div>
        </>
      )}

      <div className="crypto-buttons">
        <button className="crypto-btn" onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt} disabled={isLoading}>
          {isLoading ? (
            <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</>
          ) : mode === 'encrypt' ? (
            <><i className="fa-solid fa-shield-halved"></i> Encrypt File</>
          ) : (
            <><i className="fa-solid fa-key"></i> Decrypt File</>
          )}
        </button>
      </div>

      {mode === 'encrypt' && encryptedBlob && encryptedMeta && (
        <div className="crypto-buttons" style={{ marginTop: '0.5rem' }}>
          <button className="crypto-btn crypto-btn-secondary" onClick={handleDownloadEncrypted}>
            <i className="fa-solid fa-download"></i> Download Encrypted
          </button>
          <button className="crypto-btn crypto-btn-secondary" onClick={handleCopyMeta}>
            <i className="fa-solid fa-copy"></i> Copy IV + Salt
          </button>
        </div>
      )}

      {error && <div className="crypto-status error"><i className="fa-solid fa-circle-exclamation"></i>{error}</div>}
      {success && <div className="crypto-status success"><i className="fa-solid fa-check-circle"></i>{success}</div>}
    </div>
  );
};

export default FileEncryptionModule;
