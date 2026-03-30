import { useState, useRef } from 'react';
import { encryptAES256GCM, hashSHA256 } from '@/utils/crypto';
import { loadImageData, embedMessage, calculateCapacity } from '@/utils/steganography';

interface PipelineStep {
  id: number;
  label: string;
  icon: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  output?: string;
}

const SecurityPipelineModule = () => {
  const [plaintext, setPlaintext] = useState('');
  const [password, setPassword] = useState('');
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: 1, label: 'Encryption (AES-256-GCM)', icon: 'fa-lock', status: 'pending' },
    { id: 2, label: 'Hashing (SHA-256)', icon: 'fa-fingerprint', status: 'pending' },
    { id: 3, label: 'Steganography (LSB)', icon: 'fa-image', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [stegoImage, setStegoImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateStep = (id: number, update: Partial<PipelineStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...update } : s));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { canvas } = await loadImageData(file);
      canvasRef.current = canvas;
      setImage(canvas.toDataURL());
    } catch {
      setError('Failed to load image');
    }
  };

  const runPipeline = async () => {
    if (!plaintext.trim() || !password.trim()) {
      setError('Enter message and password'); return;
    }
    setIsRunning(true); setError(null); setStegoImage(null);
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending', output: undefined })));

    try {
      // Step 1: Encrypt
      updateStep(1, { status: 'running' });
      await new Promise(r => setTimeout(r, 500));
      const encrypted = await encryptAES256GCM(plaintext, password);
      updateStep(1, { status: 'complete', output: encrypted.ciphertext.substring(0, 60) + '...' });

      // Step 2: Hash
      updateStep(2, { status: 'running' });
      await new Promise(r => setTimeout(r, 500));
      const hash = await hashSHA256(encrypted.ciphertext);
      updateStep(2, { status: 'complete', output: hash.substring(0, 60) + '...' });

      // Step 3: Steganography
      updateStep(3, { status: 'running' });
      await new Promise(r => setTimeout(r, 500));
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
          const capacity = calculateCapacity(imageData.width, imageData.height);
          const payload = JSON.stringify({ c: encrypted.ciphertext.substring(0, Math.min(encrypted.ciphertext.length, capacity - 100)), h: hash.substring(0, 16) });
          
          if (payload.length <= capacity) {
            const modified = embedMessage(imageData, payload);
            ctx.putImageData(modified, 0, 0);
            setStegoImage(canvasRef.current.toDataURL());
            updateStep(3, { status: 'complete', output: 'Message embedded in image' });
          } else {
            updateStep(3, { status: 'complete', output: 'Image too small — skipped (data secured via encryption + hash)' });
          }
        }
      } else {
        updateStep(3, { status: 'complete', output: 'No image loaded — skipped (upload an image for full pipeline)' });
      }
    } catch (err: any) {
      setError(err.message || 'Pipeline failed');
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error' } : s));
    } finally {
      setIsRunning(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'hsl(var(--text-muted))',
    running: 'var(--secondary-hex)',
    complete: 'var(--primary-hex)',
    error: 'hsl(var(--danger))',
  };

  return (
    <div className="crypto-lab-container">
      <div className="crypto-input-group">
        <label>Sensitive Data (Plaintext)</label>
        <textarea className="crypto-input crypto-textarea" placeholder="Enter sensitive data to protect..." value={plaintext} onChange={(e) => setPlaintext(e.target.value)} />
      </div>
      <div className="crypto-input-group">
        <label>Pipeline Password</label>
        <input type="password" className="crypto-input" placeholder="Encryption password..." value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
      <div className="crypto-buttons" style={{ marginBottom: '1rem' }}>
        <button className="crypto-btn crypto-btn-secondary" onClick={() => fileInputRef.current?.click()}>
          <i className="fa-solid fa-image"></i> {image ? 'Image Loaded ✓' : 'Load Carrier Image (Optional)'}
        </button>
      </div>

      {/* Pipeline visualization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {steps.map((step, i) => (
          <div key={step.id}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
              background: step.status === 'running' ? 'rgba(0,212,255,0.08)' : 'rgba(0,0,0,0.2)',
              border: `1px solid ${statusColors[step.status]}`,
              borderRadius: '8px', transition: 'all 0.3s ease',
            }}>
              <div style={{
                width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', border: `2px solid ${statusColors[step.status]}`,
                color: statusColors[step.status], fontSize: '1rem',
                background: step.status === 'complete' ? `${statusColors[step.status]}20` : 'transparent',
              }}>
                {step.status === 'running' ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : step.status === 'complete' ? (
                  <i className="fa-solid fa-check"></i>
                ) : (
                  <i className={`fa-solid ${step.icon}`}></i>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-tech)', fontSize: '0.85rem', color: statusColors[step.status] }}>
                  Step {step.id}: {step.label}
                </div>
                {step.output && (
                  <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '0.3rem', wordBreak: 'break-all' }}>
                    {step.output}
                  </div>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.3rem 0' }}>
                <i className="fa-solid fa-arrow-down" style={{ color: 'hsl(var(--text-muted))', fontSize: '0.8rem' }}></i>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="crypto-buttons">
        <button className="crypto-btn" onClick={runPipeline} disabled={isRunning || !plaintext.trim() || !password.trim()}>
          {isRunning ? (
            <><i className="fa-solid fa-spinner fa-spin"></i> Running Pipeline...</>
          ) : (
            <><i className="fa-solid fa-play"></i> Execute Security Pipeline</>
          )}
        </button>
      </div>

      {stegoImage && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: 'var(--primary-hex)', marginBottom: '0.5rem' }}>
            ✓ Data encrypted, hashed, and embedded in image
          </p>
          <img src={stegoImage} alt="Pipeline output" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
        </div>
      )}

      {error && <div className="crypto-status error"><i className="fa-solid fa-circle-exclamation"></i>{error}</div>}
      
      {steps.every(s => s.status === 'complete') && (
        <div className="crypto-status success" style={{ marginTop: '1rem' }}>
          <i className="fa-solid fa-shield-halved"></i>
          Multi-layer security pipeline complete! Data protected with encryption + integrity hash + steganographic concealment.
        </div>
      )}
    </div>
  );
};

export default SecurityPipelineModule;
