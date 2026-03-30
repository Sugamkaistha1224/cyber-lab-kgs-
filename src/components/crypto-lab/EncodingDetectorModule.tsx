import { useState } from 'react';
import { detectEncoding, calculateEntropy, type DetectionResult } from '@/utils/encodingDetection';

const EncodingDetectorModule = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DetectionResult | null>(null);

  const handleDetect = () => {
    if (!input.trim()) return;
    setResult(detectEncoding(input));
  };

  const loadExample = (type: string) => {
    switch (type) {
      case 'base64':
        setInput('SGVsbG8gV29ybGQhIFRoaXMgaXMgYSB0ZXN0IG1lc3NhZ2Uu');
        break;
      case 'hex':
        setInput('48656c6c6f20576f726c6421');
        break;
      case 'encrypted':
        setInput('U2FsdGVkX19kZXNrdG9wJzM3NjVhOGQ0ZTk3MzJiNjU4YTBkZGY5NmI4M2QxNDk2');
        break;
      case 'url':
        setInput('Hello%20World%21%20How%20are%20you%3F');
        break;
      case 'plaintext':
        setInput('This is just a normal text message with no encoding applied.');
        break;
    }
    setResult(null);
  };

  const typeColors: Record<string, string> = {
    plaintext: 'hsl(var(--text-secondary))',
    base64: 'var(--secondary-hex)',
    hex: 'hsl(var(--warning))',
    'url-encoded': 'hsl(var(--success))',
    encrypted: 'hsl(var(--danger))',
    binary: 'hsl(var(--warning))',
  };

  return (
    <div className="crypto-lab-container">
      {/* Quick examples */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem',
      }}>
        {[
          { label: 'Base64', type: 'base64' },
          { label: 'Hex', type: 'hex' },
          { label: 'Encrypted', type: 'encrypted' },
          { label: 'URL Encoded', type: 'url' },
          { label: 'Plain Text', type: 'plaintext' },
        ].map((ex) => (
          <button
            key={ex.type}
            onClick={() => loadExample(ex.type)}
            style={{
              padding: '0.35rem 0.8rem', background: 'rgba(0,255,136,0.05)',
              border: '1px solid hsl(var(--border))', borderRadius: '6px',
              color: 'hsl(var(--text-secondary))', fontSize: '0.75rem', cursor: 'pointer',
              fontFamily: 'var(--font-code)', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--primary-hex)'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = 'hsl(var(--border))'; }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="crypto-input-group">
        <label>Paste Data to Analyze</label>
        <textarea
          className="crypto-input crypto-textarea"
          placeholder="Paste any text, encoded, or encrypted data..."
          value={input}
          onChange={(e) => { setInput(e.target.value); setResult(null); }}
        />
      </div>

      <div className="crypto-buttons">
        <button className="crypto-btn" onClick={handleDetect} disabled={!input.trim()}>
          <i className="fa-solid fa-magnifying-glass"></i> Analyze Input
        </button>
      </div>

      {result && (
        <>
          {/* Detection result */}
          <div style={{
            marginTop: '1rem', padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(0,255,136,0.05) 0%, rgba(0,212,255,0.05) 100%)',
            border: `2px solid ${typeColors[result.type] || 'hsl(var(--border))'}`,
            borderRadius: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${typeColors[result.type]}20`, border: `2px solid ${typeColors[result.type]}`,
                borderRadius: '12px', fontSize: '1.3rem', color: typeColors[result.type],
              }}>
                <i className={`fa-solid ${result.icon}`}></i>
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-tech)', color: typeColors[result.type], fontSize: '1.1rem' }}>
                  {result.label}
                </h4>
                <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                  Confidence: {result.confidence}%
                </span>
              </div>
            </div>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {result.description}
            </p>
          </div>

          {/* Entropy & metrics */}
          <div className="hash-comparison" style={{ marginTop: '1rem' }}>
            <div className="hash-box">
              <h4>Shannon Entropy</h4>
              <code>{result.entropy} bits/char</code>
            </div>
            <div className="hash-box">
              <h4>Data Length</h4>
              <code>{input.length} characters</code>
            </div>
          </div>

          {/* Decoded output */}
          {result.decoded && (
            <div className="crypto-output" style={{ marginTop: '1rem' }}>
              <span className="crypto-output-label">Decoded Output</span>
              {result.decoded}
            </div>
          )}

          {/* Security warning */}
          {result.type !== 'encrypted' && result.type !== 'plaintext' && (
            <div className="crypto-status error" style={{ marginTop: '1rem' }}>
              <i className="fa-solid fa-exclamation-triangle"></i>
              ⚠️ Encoding ≠ Encryption! {result.label} is easily reversible and provides NO security.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EncodingDetectorModule;
