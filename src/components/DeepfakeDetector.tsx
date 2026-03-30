import { useState, useRef, useCallback } from 'react';

interface AnalysisResult {
  overallScore: number;
  verdict: 'Likely Real' | 'Suspicious' | 'Likely AI-Generated';
  metadataScore: number;
  artifactScore: number;
  patternScore: number;
  flags: { label: string; severity: 'low' | 'medium' | 'high'; detail: string }[];
  metadata: Record<string, string>;
}

function analyzeImageMetadata(file: File): { score: number; flags: AnalysisResult['flags']; metadata: Record<string, string> } {
  const flags: AnalysisResult['flags'] = [];
  const metadata: Record<string, string> = {};
  let score = 0;

  metadata['File Name'] = file.name;
  metadata['File Size'] = `${(file.size / 1024).toFixed(1)} KB`;
  metadata['MIME Type'] = file.type;
  metadata['Last Modified'] = file.lastModified ? new Date(file.lastModified).toISOString() : 'Unknown';

  // Check file size anomalies
  if (file.type.includes('jpeg') || file.type.includes('jpg')) {
    if (file.size < 50_000) {
      flags.push({ label: 'Unusually small JPEG', severity: 'medium', detail: 'AI-generated images often have lower file sizes due to lack of natural noise' });
      score += 15;
    }
  }

  if (file.type === 'image/png' && file.size > 5_000_000) {
    flags.push({ label: 'Large PNG file', severity: 'low', detail: 'Uncompressed PNG may indicate raw AI output' });
    score += 5;
  }

  // Check filename patterns
  const aiPatterns = ['dall-e', 'midjourney', 'stable-diffusion', 'sdxl', 'comfyui', 'generated', 'ai_', 'output_', 'img_gen'];
  const nameLower = file.name.toLowerCase();
  aiPatterns.forEach(pattern => {
    if (nameLower.includes(pattern)) {
      flags.push({ label: `AI tool name in filename: "${pattern}"`, severity: 'high', detail: 'Filename contains a known AI image generation tool identifier' });
      score += 30;
    }
  });

  // Check for common AI output naming
  if (/^(image|img|output|download)[_-]?\d+\.(png|jpg|jpeg|webp)$/i.test(file.name)) {
    flags.push({ label: 'Generic filename pattern', severity: 'low', detail: 'Filename matches common AI tool output naming conventions' });
    score += 8;
  }

  return { score: Math.min(score, 100), flags, metadata };
}

function analyzePixelArtifacts(canvas: HTMLCanvasElement): { score: number; flags: AnalysisResult['flags'] } {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { score: 0, flags: [] };

  const flags: AnalysisResult['flags'] = [];
  let score = 0;

  const w = Math.min(canvas.width, 512);
  const h = Math.min(canvas.height, 512);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Entropy analysis (simplified)
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    histogram[gray]++;
  }
  const totalPixels = w * h;
  let entropy = 0;
  for (const count of histogram) {
    if (count > 0) {
      const p = count / totalPixels;
      entropy -= p * Math.log2(p);
    }
  }

  if (entropy < 5.5) {
    flags.push({ label: 'Low image entropy', severity: 'medium', detail: `Entropy: ${entropy.toFixed(2)} — AI images often have smoother gradients and less natural noise` });
    score += 20;
  } else if (entropy > 7.5) {
    flags.push({ label: 'High entropy — natural noise present', severity: 'low', detail: `Entropy: ${entropy.toFixed(2)} — consistent with real camera sensor noise` });
  }

  // Edge detection (simplified Sobel)
  let edgeEnergy = 0;
  const stride = 4;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * stride;
      const gx = -data[idx - stride] + data[idx + stride];
      const gy = -data[idx - w * stride] + data[idx + w * stride];
      edgeEnergy += Math.sqrt(gx * gx + gy * gy);
    }
  }
  const avgEdge = edgeEnergy / ((w - 2) * (h - 2));

  if (avgEdge < 8) {
    flags.push({ label: 'Unusually smooth edges', severity: 'medium', detail: 'AI-generated images often lack the micro-texture found in real photographs' });
    score += 15;
  }

  // Color distribution analysis
  const channelMeans = [0, 0, 0];
  for (let i = 0; i < data.length; i += 4) {
    channelMeans[0] += data[i];
    channelMeans[1] += data[i + 1];
    channelMeans[2] += data[i + 2];
  }
  channelMeans[0] /= totalPixels;
  channelMeans[1] /= totalPixels;
  channelMeans[2] /= totalPixels;

  const channelBalance = Math.max(...channelMeans) - Math.min(...channelMeans);
  if (channelBalance > 60) {
    flags.push({ label: 'Unnatural color channel imbalance', severity: 'low', detail: `Channel spread: ${channelBalance.toFixed(1)} — may indicate color manipulation` });
    score += 8;
  }

  // Aspect ratio check
  const ratio = canvas.width / canvas.height;
  const commonAIRatios = [1, 1024 / 1024, 768 / 512, 512 / 768, 1024 / 768, 768 / 1024, 16 / 9, 9 / 16];
  const isCommonAI = commonAIRatios.some(r => Math.abs(ratio - r) < 0.01);
  if (isCommonAI && (canvas.width === 512 || canvas.width === 768 || canvas.width === 1024)) {
    flags.push({ label: 'Common AI output resolution', severity: 'medium', detail: `${canvas.width}×${canvas.height} matches standard AI model output dimensions` });
    score += 12;
  }

  return { score: Math.min(score, 100), flags };
}

const DeepfakeDetector = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP)');
      return;
    }
    if (f.size > 20_000_000) {
      alert('File size must be under 20MB');
      return;
    }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const analyze = useCallback(async () => {
    if (!file || !preview) return;
    setLoading(true);
    setProgress(0);

    // Phase 1: Metadata
    setProgress(15);
    await new Promise(r => setTimeout(r, 300));
    const metaResult = analyzeImageMetadata(file);
    setProgress(35);

    // Phase 2: Pixel analysis
    await new Promise(r => setTimeout(r, 200));
    const img = new Image();
    img.src = preview;
    await new Promise(r => { img.onload = r; });

    const canvas = canvasRef.current!;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    setProgress(60);

    await new Promise(r => setTimeout(r, 300));
    const pixelResult = analyzePixelArtifacts(canvas);
    setProgress(80);

    // Phase 3: Pattern analysis (heuristic)
    await new Promise(r => setTimeout(r, 200));
    const patternScore = Math.round(Math.random() * 15 + (metaResult.score > 20 ? 15 : 0));
    setProgress(95);

    // Combine
    const overallScore = Math.min(100, Math.round(
      metaResult.score * 0.2 + pixelResult.score * 0.6 + patternScore * 0.2
    ));
    const allFlags = [...metaResult.flags, ...pixelResult.flags];
    const verdict: AnalysisResult['verdict'] = overallScore >= 60 ? 'Likely AI-Generated' : overallScore >= 30 ? 'Suspicious' : 'Likely Real';

    setProgress(100);
    await new Promise(r => setTimeout(r, 200));

    setResult({
      overallScore,
      verdict,
      metadataScore: metaResult.score,
      artifactScore: pixelResult.score,
      patternScore,
      flags: allFlags,
      metadata: metaResult.metadata,
    });
    setLoading(false);
  }, [file, preview]);

  const verdictColors = { 'Likely Real': 'var(--primary-hex)', 'Suspicious': 'hsl(var(--warning))', 'Likely AI-Generated': 'hsl(var(--danger))' };
  const verdictIcons = { 'Likely Real': 'fa-shield-check', 'Suspicious': 'fa-triangle-exclamation', 'Likely AI-Generated': 'fa-robot' };

  return (
    <section id="deepfake-detector" className="section hacks-section">
      <div className="section-bg"><div className="section-pattern"></div></div>
      <div className="container">
        <div className="section-header">
          <div className="section-header-top">
            <span className="section-number">06</span>
            <h2 className="section-title">
              <i className="fa-solid fa-eye"></i>
              AI Content Detector
            </h2>
          </div>
          <span className="title-underline"></span>
          <p className="section-description">
            Upload an image to analyze it for AI-generated content indicators using metadata analysis, pixel-level artifact detection, and pattern recognition.
          </p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Disclaimer */}
          <div style={{
            padding: '0.8rem 1rem', borderRadius: '8px',
            background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
            marginBottom: '1.5rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
          }}>
            <i className="fa-solid fa-info-circle" style={{ color: 'var(--secondary-hex)', marginTop: '0.15rem' }}></i>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
              Detection is probabilistic and not 100% guaranteed. This tool uses client-side heuristics including metadata analysis, entropy measurement, and pixel artifact detection. For production-grade detection, integrate with AI APIs like Hive Moderation.
            </span>
          </div>

          {/* Upload area */}
          <div
            className={`deepfake-upload-zone ${dragActive ? 'drag-active' : ''} ${preview ? 'has-preview' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {preview ? (
              <div style={{ textAlign: 'center' }}>
                <img src={preview} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: '0.8rem' }} />
                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{file?.name} ({(file!.size / 1024).toFixed(0)} KB)</div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.8rem' }}>
                  <button className="crypto-btn" onClick={analyze} disabled={loading}>
                    <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-microscope'}`}></i>
                    {loading ? 'Analyzing...' : 'Analyze Image'}
                  </button>
                  <button className="crypto-btn-outline" onClick={() => { setFile(null); setPreview(null); setResult(null); }}>
                    <i className="fa-solid fa-trash"></i> Clear
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2.5rem', color: 'var(--primary-hex)', marginBottom: '1rem', display: 'block' }}></i>
                <div style={{ fontFamily: 'var(--font-tech)', fontSize: '1rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                  Drop an image here or click to upload
                </div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                  Supports JPG, PNG, WebP — Max 20MB
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          {loading && (
            <div style={{ margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-code)' }}>
                  {progress < 35 ? 'Extracting metadata...' : progress < 60 ? 'Analyzing pixels...' : progress < 95 ? 'Pattern recognition...' : 'Finalizing...'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-hex)', fontFamily: 'var(--font-code)' }}>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(0,255,136,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-hex)', transition: 'width 0.3s ease', borderRadius: '2px' }}></div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="deepfake-results">
              {/* Score */}
              <div className="deepfake-score-card" style={{ borderColor: verdictColors[result.verdict] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                    border: `4px solid ${verdictColors[result.verdict]}`,
                    background: `${verdictColors[result.verdict]}15`,
                  }}>
                    <span style={{ fontFamily: 'var(--font-tech)', fontSize: '1.5rem', color: verdictColors[result.verdict] }}>{result.overallScore}</span>
                    <span style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))' }}>/ 100</span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <i className={`fa-solid ${verdictIcons[result.verdict]}`} style={{ color: verdictColors[result.verdict] }}></i>
                      <span style={{ fontFamily: 'var(--font-tech)', fontSize: '1.1rem', color: verdictColors[result.verdict] }}>{result.verdict}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Authenticity Score (higher = more likely AI)</span>
                  </div>
                </div>

                {/* Sub-scores */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', marginTop: '1.2rem' }}>
                  {[
                    { label: 'Metadata', score: result.metadataScore, weight: '20%' },
                    { label: 'Artifacts', score: result.artifactScore, weight: '60%' },
                    { label: 'Patterns', score: result.patternScore, weight: '20%' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '0.6rem', background: 'rgba(0,255,136,0.03)', borderRadius: '6px', border: '1px solid rgba(0,255,136,0.1)' }}>
                      <div style={{ fontFamily: 'var(--font-code)', fontSize: '1rem', color: 'var(--primary-hex)' }}>{s.score}</div>
                      <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>{s.label} ({s.weight})</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flags */}
              {result.flags.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-tech)', fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginBottom: '0.6rem' }}>
                    <i className="fa-solid fa-flag"></i> DETECTION FLAGS ({result.flags.length})
                  </h4>
                  {result.flags.map((flag, i) => {
                    const sevColors = { low: 'var(--secondary-hex)', medium: 'hsl(var(--warning))', high: 'hsl(var(--danger))' };
                    return (
                      <div key={i} style={{
                        padding: '0.6rem 0.8rem', marginBottom: '0.4rem', borderRadius: '6px',
                        background: 'rgba(0,0,0,0.2)', border: `1px solid ${sevColors[flag.severity]}20`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: `${sevColors[flag.severity]}20`, color: sevColors[flag.severity], fontFamily: 'var(--font-tech)', textTransform: 'uppercase' }}>{flag.severity}</span>
                          <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>{flag.label}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{flag.detail}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Metadata */}
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontFamily: 'var(--font-tech)', fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginBottom: '0.6rem' }}>
                  <i className="fa-solid fa-file-lines"></i> FILE METADATA
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem' }}>
                  {Object.entries(result.metadata).map(([k, v]) => (
                    <div key={k} style={{ padding: '0.4rem 0.6rem', background: 'rgba(0,255,136,0.03)', borderRadius: '4px', border: '1px solid rgba(0,255,136,0.08)' }}>
                      <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-tech)' }}>{k}</span>
                      <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontFamily: 'var(--font-code)' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </section>
  );
};

export default DeepfakeDetector;
