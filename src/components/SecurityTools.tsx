import { useState, useCallback } from 'react';

// ─── Hash Generator ──────────────────────────────────────────────────────────
async function hashMD5(input: string): Promise<string> {
  // Simple MD5 implementation (educational — MD5 is not in Web Crypto API)
  const msgBuffer = new TextEncoder().encode(input);
  // We'll use a pure-JS MD5 for educational demo
  return md5(input);
}

// Minimal MD5 (educational, not for security)
function md5(string: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
  function md5blk(s: string) {
    const md5blks: number[] = [];
    for (let i = 0; i < 64; i += 4) md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    return md5blks;
  }
  function add32(a: number, b: number) { return (a + b) & 0xFFFFFFFF; }
  function rhex(n: number) {
    const hc = '0123456789abcdef';
    let s = '';
    for (let j = 0; j < 4; j++) s += hc.charAt((n >> (j * 8 + 4)) & 0x0F) + hc.charAt((n >> (j * 8)) & 0x0F);
    return s;
  }
  function hex(x: number[]) { const parts: string[] = []; for (let i = 0; i < x.length; i++) parts.push(rhex(x[i])); return parts.join(''); }
  function md5str(s: string) {
    const n = s.length;
    let state = [1732584193, -271733879, -1732584194, 271733878];
    let i: number;
    for (i = 64; i <= n; i += 64) md5cycle(state, md5blk(s.substring(i - 64, i)));
    s = s.substring(i - 64);
    const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) { md5cycle(state, tail); for (i = 0; i < 16; i++) tail[i] = 0; }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }
  return hex(md5str(string));
}

async function hashSHA256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashSHA512(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Phishing URL Detector ──────────────────────────────────────────────────
interface PhishingResult {
  score: number;
  verdict: 'safe' | 'suspicious' | 'dangerous';
  flags: string[];
}

function analyzePhishingURL(url: string): PhishingResult {
  const flags: string[] = [];
  let score = 0;

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = parsed.hostname.toLowerCase();
    const path = parsed.pathname + parsed.search;

    // Suspicious TLDs
    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click', '.buzz', '.info'];
    if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
      flags.push(`Suspicious TLD detected: ${hostname.split('.').pop()}`);
      score += 25;
    }

    // IP address as hostname
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      flags.push('URL uses IP address instead of domain name');
      score += 30;
    }

    // Excessive subdomains
    const subdomainCount = hostname.split('.').length - 2;
    if (subdomainCount > 2) {
      flags.push(`Excessive subdomains detected (${subdomainCount})`);
      score += 15;
    }

    // Brand impersonation
    const brands = ['paypal', 'google', 'apple', 'microsoft', 'amazon', 'facebook', 'netflix', 'instagram', 'twitter', 'linkedin', 'chase', 'wellsfargo', 'bankofamerica'];
    const officialDomains = ['paypal.com', 'google.com', 'apple.com', 'microsoft.com', 'amazon.com', 'facebook.com', 'netflix.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'chase.com', 'wellsfargo.com', 'bankofamerica.com'];
    brands.forEach((brand, i) => {
      if (hostname.includes(brand) && hostname !== officialDomains[i] && !hostname.endsWith(`.${officialDomains[i]}`)) {
        flags.push(`Possible ${brand} impersonation — domain is not official`);
        score += 35;
      }
    });

    // Suspicious keywords in path
    const suspiciousKeywords = ['login', 'signin', 'verify', 'secure', 'account', 'update', 'confirm', 'password', 'credential', 'wallet', 'banking'];
    suspiciousKeywords.forEach(keyword => {
      if (path.toLowerCase().includes(keyword)) {
        flags.push(`Suspicious keyword in path: "${keyword}"`);
        score += 10;
      }
    });

    // URL shortener
    const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd', 'cli.gs', 'ow.ly'];
    if (shorteners.some(s => hostname.includes(s))) {
      flags.push('URL shortener detected — destination is hidden');
      score += 20;
    }

    // Homograph detection (mixed scripts)
    if (/[а-яА-Я]/.test(hostname) || /[^\x00-\x7F]/.test(hostname)) {
      flags.push('Non-ASCII characters detected — possible homograph attack');
      score += 40;
    }

    // HTTP (no SSL)
    if (parsed.protocol === 'http:') {
      flags.push('No SSL/TLS encryption (HTTP instead of HTTPS)');
      score += 15;
    }

    // Long URL
    if (url.length > 100) {
      flags.push(`Unusually long URL (${url.length} characters)`);
      score += 5;
    }

    // @ in URL
    if (url.includes('@')) {
      flags.push('"@" symbol in URL — may redirect to a different site');
      score += 25;
    }

    // Double dash
    if (hostname.includes('--')) {
      flags.push('Double dash in hostname — uncommon pattern');
      score += 10;
    }

  } catch {
    flags.push('Invalid URL format');
    score += 50;
  }

  score = Math.min(score, 100);
  const verdict: PhishingResult['verdict'] = score >= 60 ? 'dangerous' : score >= 30 ? 'suspicious' : 'safe';
  if (flags.length === 0) flags.push('No suspicious patterns detected');

  return { score, verdict, flags };
}

// ─── Tool components ─────────────────────────────────────────────────────────
const HashGenerator = () => {
  const [input, setInput] = useState('');
  const [algo, setAlgo] = useState<'MD5' | 'SHA-256' | 'SHA-512'>('SHA-256');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      let hash = '';
      if (algo === 'MD5') hash = md5(input);
      else if (algo === 'SHA-256') hash = await hashSHA256(input);
      else hash = await hashSHA512(input);
      setResult(hash);
    } catch { setResult('Error generating hash'); }
    setLoading(false);
  };

  return (
    <div className="security-tool-card">
      <div className="tool-header">
        <i className="fa-solid fa-hashtag" style={{ color: 'var(--primary-hex)' }}></i>
        <h3>Hash Generator</h3>
      </div>
      <p className="tool-desc">Generate cryptographic hashes. MD5 is shown for educational purposes — never use it for security.</p>
      <div className="tool-body">
        <textarea
          className="crypto-input"
          placeholder="Enter text to hash..."
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={3}
          style={{ width: '100%', resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.8rem 0' }}>
          {(['MD5', 'SHA-256', 'SHA-512'] as const).map(a => (
            <button
              key={a}
              className={`crypto-btn ${algo === a ? '' : 'crypto-btn-outline'}`}
              onClick={() => setAlgo(a)}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              {a}
            </button>
          ))}
        </div>
        <button className="crypto-btn" onClick={generate} disabled={loading || !input.trim()}>
          <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-bolt'}`}></i>
          {loading ? 'Hashing...' : 'Generate Hash'}
        </button>
        {result && (
          <div className="tool-result">
            <div className="tool-result-label">{algo} Hash:</div>
            <div className="tool-result-value" style={{ wordBreak: 'break-all' }}>{result}</div>
            <button className="crypto-btn-outline" style={{ marginTop: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              onClick={() => navigator.clipboard.writeText(result)}>
              <i className="fa-solid fa-copy"></i> Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Base64Tool = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const process = () => {
    setError('');
    if (!input.trim()) return;
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
    } catch {
      setError(mode === 'decode' ? 'Invalid Base64 string' : 'Encoding failed');
    }
  };

  return (
    <div className="security-tool-card">
      <div className="tool-header">
        <i className="fa-solid fa-code" style={{ color: 'var(--secondary-hex)' }}></i>
        <h3>Base64 Encoder/Decoder</h3>
      </div>
      <p className="tool-desc">Encode and decode Base64 strings. Remember: encoding ≠ encryption!</p>
      <div className="tool-body">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
          <button className={`crypto-btn ${mode === 'encode' ? '' : 'crypto-btn-outline'}`}
            onClick={() => { setMode('encode'); setOutput(''); setError(''); }}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <i className="fa-solid fa-lock"></i> Encode
          </button>
          <button className={`crypto-btn ${mode === 'decode' ? '' : 'crypto-btn-outline'}`}
            onClick={() => { setMode('decode'); setOutput(''); setError(''); }}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <i className="fa-solid fa-lock-open"></i> Decode
          </button>
        </div>
        <textarea
          className="crypto-input"
          placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
          value={input} onChange={e => setInput(e.target.value)}
          rows={3} style={{ width: '100%', resize: 'vertical' }}
        />
        <button className="crypto-btn" onClick={process} disabled={!input.trim()} style={{ marginTop: '0.5rem' }}>
          <i className="fa-solid fa-arrow-right-arrow-left"></i>
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
        {error && <div style={{ color: 'hsl(var(--danger))', fontSize: '0.8rem', marginTop: '0.5rem' }}><i className="fa-solid fa-exclamation-triangle"></i> {error}</div>}
        {output && (
          <div className="tool-result">
            <div className="tool-result-label">Result:</div>
            <div className="tool-result-value" style={{ wordBreak: 'break-all' }}>{output}</div>
            <button className="crypto-btn-outline" style={{ marginTop: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              onClick={() => navigator.clipboard.writeText(output)}>
              <i className="fa-solid fa-copy"></i> Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PhishingDetector = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<PhishingResult | null>(null);

  const analyze = () => {
    if (!url.trim()) return;
    setResult(analyzePhishingURL(url));
  };

  const verdictColors = {
    safe: 'var(--primary-hex)',
    suspicious: 'hsl(var(--warning))',
    dangerous: 'hsl(var(--danger))',
  };
  const verdictLabels = {
    safe: 'LIKELY SAFE',
    suspicious: 'SUSPICIOUS',
    dangerous: 'DANGEROUS',
  };
  const verdictIcons = {
    safe: 'fa-shield-check',
    suspicious: 'fa-triangle-exclamation',
    dangerous: 'fa-skull-crossbones',
  };

  return (
    <div className="security-tool-card">
      <div className="tool-header">
        <i className="fa-solid fa-fish" style={{ color: 'hsl(var(--warning))' }}></i>
        <h3>Phishing URL Detector</h3>
      </div>
      <p className="tool-desc">Analyze URLs for phishing indicators: suspicious TLDs, brand impersonation, homograph attacks, and more.</p>
      <div className="tool-body">
        <input
          type="text"
          className="crypto-input"
          placeholder="Enter URL to analyze (e.g., https://paypal-secure.tk/login)"
          value={url} onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && analyze()}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <button className="crypto-btn" onClick={analyze} disabled={!url.trim()}>
            <i className="fa-solid fa-magnifying-glass"></i> Analyze URL
          </button>
          <button className="crypto-btn-outline" onClick={() => { setUrl('https://paypal-secure.tk/login/verify'); setResult(null); }}
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>
            Load Example
          </button>
        </div>
        {result && (
          <div className="tool-result" style={{ borderColor: verdictColors[result.verdict] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
              <i className={`fa-solid ${verdictIcons[result.verdict]}`} style={{ fontSize: '1.5rem', color: verdictColors[result.verdict] }}></i>
              <div>
                <div style={{ fontFamily: 'var(--font-tech)', fontSize: '0.9rem', color: verdictColors[result.verdict] }}>
                  {verdictLabels[result.verdict]}
                </div>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                  Threat Score: {result.score}/100
                </div>
              </div>
              <div style={{
                width: '50px', height: '50px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `3px solid ${verdictColors[result.verdict]}`,
                fontFamily: 'var(--font-tech)', fontSize: '0.9rem',
                color: verdictColors[result.verdict], marginLeft: 'auto',
              }}>
                {result.score}
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(0,255,136,0.1)', paddingTop: '0.6rem' }}>
              {result.flags.map((flag, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  padding: '0.3rem 0', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))',
                }}>
                  <i className={`fa-solid ${result.verdict === 'safe' ? 'fa-check' : 'fa-exclamation-circle'}`}
                    style={{ color: verdictColors[result.verdict], marginTop: '0.15rem', flexShrink: 0 }}></i>
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Section ────────────────────────────────────────────────────────────
const SecurityTools = () => {
  const [activeTool, setActiveTool] = useState<'hash' | 'base64' | 'phishing'>('hash');

  const tools = [
    { id: 'hash' as const, icon: 'fa-hashtag', label: 'Hash Generator' },
    { id: 'base64' as const, icon: 'fa-code', label: 'Base64' },
    { id: 'phishing' as const, icon: 'fa-fish', label: 'Phishing Detector' },
  ];

  return (
    <section id="security-tools" className="section hacks-section">
      <div className="section-bg">
        <div className="section-pattern"></div>
      </div>
      <div className="container">
        <div className="section-header">
          <div className="section-header-top">
            <span className="section-number">05</span>
            <h2 className="section-title">
              <i className="fa-solid fa-toolbox"></i>
              Security Tools
            </h2>
          </div>
          <span className="title-underline"></span>
          <p className="section-description">
            Client-side security utilities — hash generators, encoding tools, and threat analysis. All processing runs locally in your browser.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {tools.map(t => (
            <button
              key={t.id}
              className={`crypto-btn ${activeTool === t.id ? '' : 'crypto-btn-outline'}`}
              onClick={() => setActiveTool(t.id)}
              style={{ padding: '0.6rem 1.2rem' }}
            >
              <i className={`fa-solid ${t.icon}`}></i> {t.label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {activeTool === 'hash' && <HashGenerator />}
          {activeTool === 'base64' && <Base64Tool />}
          {activeTool === 'phishing' && <PhishingDetector />}
        </div>
      </div>
    </section>
  );
};

export default SecurityTools;
