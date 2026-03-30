import { useState, useMemo } from 'react';
import { analyzePassword, hashPassword } from '@/utils/passwordAnalysis';

const PasswordAnalyzerModule = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hashedValue, setHashedValue] = useState<string | null>(null);

  const analysis = useMemo(() => {
    if (!password) return null;
    return analyzePassword(password);
  }, [password]);

  const handleHash = async () => {
    if (!password.trim()) return;
    const hash = await hashPassword(password);
    setHashedValue(hash);
  };

  const strengthColors: Record<string, string> = {
    'very-weak': 'hsl(var(--danger))',
    'weak': 'hsl(var(--warning))',
    'fair': 'hsl(47, 100%, 50%)',
    'strong': 'hsl(var(--success))',
    'very-strong': 'var(--primary-hex)',
  };

  const strengthLabels: Record<string, string> = {
    'very-weak': 'VERY WEAK',
    'weak': 'WEAK',
    'fair': 'FAIR',
    'strong': 'STRONG',
    'very-strong': 'VERY STRONG',
  };

  return (
    <div className="crypto-lab-container">
      <div className="crypto-input-group">
        <label>Enter Password to Analyze</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            className="crypto-input"
            placeholder="Type a password..."
            value={password}
            onChange={(e) => { setPassword(e.target.value); setHashedValue(null); }}
            autoComplete="off"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--primary-hex)', cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>
      </div>

      {analysis && (
        <>
          {/* Strength Meter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.85rem', color: strengthColors[analysis.strength] }}>
                {strengthLabels[analysis.strength]}
              </span>
              <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                {analysis.entropy} bits entropy
              </span>
            </div>
            <div style={{
              width: '100%', height: '8px', background: 'rgba(0,255,136,0.1)',
              borderRadius: '4px', overflow: 'hidden', border: '1px solid hsl(var(--border))',
            }}>
              <div style={{
                width: `${analysis.strengthPercent}%`, height: '100%',
                background: strengthColors[analysis.strength],
                transition: 'width 0.4s ease, background 0.4s ease',
                borderRadius: '4px',
                boxShadow: `0 0 10px ${strengthColors[analysis.strength]}`,
              }} />
            </div>
          </div>

          {/* Metrics */}
          <div className="hash-comparison">
            <div className="hash-box">
              <h4>Crack Time (GPU)</h4>
              <code style={{ color: strengthColors[analysis.strength] }}>{analysis.crackTime}</code>
            </div>
            <div className="hash-box">
              <h4>Charset Size</h4>
              <code>{analysis.charsetSize} characters</code>
            </div>
          </div>

          {/* Character checks */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem',
            marginBottom: '1rem', fontFamily: 'var(--font-code)', fontSize: '0.8rem',
          }}>
            {[
              { label: 'Uppercase (A-Z)', ok: analysis.hasUppercase },
              { label: 'Lowercase (a-z)', ok: analysis.hasLowercase },
              { label: 'Numbers (0-9)', ok: analysis.hasNumbers },
              { label: 'Symbols (!@#$)', ok: analysis.hasSymbols },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: item.ok ? 'hsl(var(--success))' : 'hsl(var(--text-muted))' }}>
                <i className={`fa-solid ${item.ok ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Issues */}
          {analysis.issues.length > 0 && (
            <div className="crypto-status error" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <i className="fa-solid fa-exclamation-triangle"></i> Security Issues
              </div>
              {analysis.issues.map((issue, i) => (
                <span key={i} style={{ fontSize: '0.8rem', paddingLeft: '1.5rem' }}>• {issue}</span>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="crypto-status success" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <i className="fa-solid fa-lightbulb"></i> Recommendations
              </div>
              {analysis.suggestions.slice(0, 3).map((suggestion, i) => (
                <span key={i} style={{ fontSize: '0.8rem', paddingLeft: '1.5rem' }}>• {suggestion}</span>
              ))}
            </div>
          )}

          {/* Hash button */}
          <div className="crypto-buttons" style={{ marginTop: '1rem' }}>
            <button className="crypto-btn crypto-btn-secondary" onClick={handleHash}>
              <i className="fa-solid fa-fingerprint"></i>
              Hash Password (SHA-256)
            </button>
          </div>

          {hashedValue && (
            <div className="crypto-output">
              <span className="crypto-output-label">SHA-256 Hash (Never store plaintext!)</span>
              {hashedValue}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PasswordAnalyzerModule;
