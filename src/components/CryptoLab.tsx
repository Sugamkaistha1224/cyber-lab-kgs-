import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import EncryptionModule from './crypto-lab/EncryptionModule';
import DecryptionModule from './crypto-lab/DecryptionModule';
import SteganographyModule from './crypto-lab/SteganographyModule';
import HashingModule from './crypto-lab/HashingModule';
import SignatureModule from './crypto-lab/SignatureModule';
import PasswordAnalyzerModule from './crypto-lab/PasswordAnalyzerModule';
import FileEncryptionModule from './crypto-lab/FileEncryptionModule';
import CryptoAttackModule from './crypto-lab/CryptoAttackModule';
import EncodingDetectorModule from './crypto-lab/EncodingDetectorModule';
import SecurityPipelineModule from './crypto-lab/SecurityPipelineModule';
import BlockchainModule from './crypto-lab/BlockchainModule';

const slides = [
  {
    id: 1,
    icon: 'fa-signature',
    title: 'Digital Signatures',
    description: 'RSA-2048 asymmetric cryptography for message authentication. Sign and verify documents with public/private key pairs.',
    metrics: [
      { value: 'RSA-PSS', label: 'Algorithm' },
      { value: '2048-bit', label: 'Key Size' },
      { value: 'SHA-256', label: 'Hash' },
    ],
    bgClass: 'slide-bg-1',
    component: SignatureModule,
    keywords: ['signature', 'rsa', 'key', 'sign', 'verify', 'asymmetric', 'authentication'],
  },
  {
    id: 2,
    icon: 'fa-fingerprint',
    title: 'SHA-256 Hashing',
    description: 'Generate cryptographic fingerprints for data integrity verification. Detect any tampering or modifications instantly.',
    metrics: [
      { value: 'SHA-256', label: 'Algorithm' },
      { value: '256-bit', label: 'Output' },
      { value: '∞', label: 'Input Size' },
    ],
    bgClass: 'slide-bg-2',
    component: HashingModule,
    keywords: ['hash', 'sha', 'integrity', 'fingerprint', 'tamper', 'verify'],
  },
  {
    id: 3,
    icon: 'fa-key',
    title: 'Password Security Analyzer',
    description: 'Real-time password strength analysis with entropy calculation, pattern detection, and brute-force time estimation.',
    metrics: [
      { value: 'Entropy', label: 'Analysis' },
      { value: 'GPU', label: 'Crack Time' },
      { value: 'NIST', label: 'Standards' },
    ],
    bgClass: 'slide-bg-3',
    component: PasswordAnalyzerModule,
    keywords: ['password', 'strength', 'entropy', 'crack', 'analyzer', 'security'],
  },
  {
    id: 4,
    icon: 'fa-file-shield',
    title: 'File Encryption',
    description: 'Encrypt real files (PDF, TXT, PNG, etc.) using AES-256-GCM with password-based key derivation. Download and restore securely.',
    metrics: [
      { value: 'AES-256', label: 'Cipher' },
      { value: 'Any File', label: 'Support' },
      { value: 'PBKDF2', label: 'Key Derivation' },
    ],
    bgClass: 'slide-bg-4',
    component: FileEncryptionModule,
    keywords: ['file', 'encrypt', 'decrypt', 'pdf', 'document', 'download'],
  },
  {
    id: 5,
    icon: 'fa-crosshairs',
    title: 'Crypto Attack Simulator',
    description: 'Educational attack simulation: brute-force and dictionary attacks demonstrate why strong passwords matter.',
    metrics: [
      { value: 'Brute', label: 'Force' },
      { value: 'Dict', label: 'Attack' },
      { value: 'Ethical', label: 'Purpose' },
    ],
    bgClass: 'slide-bg-5',
    component: CryptoAttackModule,
    keywords: ['attack', 'brute', 'force', 'dictionary', 'crack', 'simulate', 'educational'],
  },
  {
    id: 6,
    icon: 'fa-image',
    title: 'Image Steganography',
    description: 'Hide secret messages within images using LSB (Least Significant Bit) encoding. Covert communication through pixel manipulation.',
    metrics: [
      { value: 'LSB', label: 'Encoding' },
      { value: 'PNG', label: 'Format' },
      { value: '3 bits', label: 'Per Pixel' },
    ],
    bgClass: 'slide-bg-1',
    component: SteganographyModule,
    keywords: ['steganography', 'image', 'hide', 'pixel', 'lsb', 'covert'],
  },
  {
    id: 7,
    icon: 'fa-unlock',
    title: 'Secure Decryption',
    description: 'Restore encrypted data with password verification and integrity validation. AES-GCM provides authenticated decryption.',
    metrics: [
      { value: 'AES-GCM', label: 'Algorithm' },
      { value: 'HMAC', label: 'Integrity' },
      { value: '96-bit', label: 'IV Size' },
    ],
    bgClass: 'slide-bg-2',
    component: DecryptionModule,
    keywords: ['decrypt', 'restore', 'password', 'aes', 'gcm'],
  },
  {
    id: 8,
    icon: 'fa-lock',
    title: 'AES-256 Encryption',
    description: 'Military-grade encryption using AES-256-GCM with PBKDF2 key derivation. Secure your sensitive data with password-based encryption.',
    metrics: [
      { value: '256-bit', label: 'Key Size' },
      { value: '100K', label: 'PBKDF2 Iterations' },
      { value: 'GCM', label: 'Mode' },
    ],
    bgClass: 'slide-bg-3',
    component: EncryptionModule,
    keywords: ['encrypt', 'aes', '256', 'gcm', 'pbkdf2', 'military'],
  },
  {
    id: 9,
    icon: 'fa-magnifying-glass',
    title: 'Encoding vs Encryption',
    description: 'Detect and classify input as plaintext, Base64, hex, URL-encoded, or encrypted data using entropy analysis and pattern detection.',
    metrics: [
      { value: 'Shannon', label: 'Entropy' },
      { value: 'Pattern', label: 'Detection' },
      { value: 'Auto', label: 'Classify' },
    ],
    bgClass: 'slide-bg-4',
    component: EncodingDetectorModule,
    keywords: ['encoding', 'base64', 'hex', 'detect', 'entropy', 'classify'],
  },
  {
    id: 10,
    icon: 'fa-layer-group',
    title: 'Security Pipeline',
    description: 'Multi-layer defense: Plaintext → Encryption → Hashing → Steganography. Enterprise-grade security workflow demonstration.',
    metrics: [
      { value: '3-Layer', label: 'Defense' },
      { value: 'Auto', label: 'Pipeline' },
      { value: 'Visual', label: 'Steps' },
    ],
    bgClass: 'slide-bg-5',
    component: SecurityPipelineModule,
    keywords: ['pipeline', 'multi', 'layer', 'defense', 'enterprise', 'workflow'],
  },
  {
    id: 11,
    icon: 'fa-link',
    title: 'Blockchain Hash Chain',
    description: 'Interactive blockchain fundamentals: linked hash blocks, tamper detection, and chain integrity validation.',
    metrics: [
      { value: 'SHA-256', label: 'Hashing' },
      { value: 'Chain', label: 'Integrity' },
      { value: 'Tamper', label: 'Detection' },
    ],
    bgClass: 'slide-bg-1',
    component: BlockchainModule,
    keywords: ['blockchain', 'chain', 'block', 'hash', 'tamper', 'integrity', 'ledger'],
  },
];

const CryptoLab = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  // Touch/swipe state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  const filteredSlides = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return slides
      .map((slide, index) => ({ slide, index }))
      .filter(({ slide }) =>
        slide.title.toLowerCase().includes(q) ||
        slide.description.toLowerCase().includes(q) ||
        slide.keywords.some(k => k.includes(q))
      );
  }, [searchQuery]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setShowSelector(false);
    setSearchQuery('');
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  // Click-outside to close selector panel
  useEffect(() => {
    if (!showSelector) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setShowSelector(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSelector]);

  // Keyboard: Escape closes selector, arrows navigate slides
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA';
      if (e.key === 'Escape') {
        setShowSelector(false);
        setSearchQuery('');
      }
      if (!isInput) {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nextSlide, prevSlide]);

  // Touch handlers for swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
    // Only claim swipe if horizontal movement dominates (prevents scroll hijacking)
    if (deltaX > deltaY && deltaX > 10) {
      isSwiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || !isSwiping.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 50; // px minimum to register as swipe
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        nextSlide(); // swipe left → next
      } else {
        prevSlide(); // swipe right → prev
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
  }, [nextSlide, prevSlide]);

  const progressWidth = ((currentSlide + 1) / slides.length) * 100;

  // Context-aware suggested modules
  const suggestedModules = useMemo(() => {
    const related: Record<number, number[]> = {
      0: [1, 4],   // Signatures → Hashing, Attack Sim
      1: [0, 10],  // Hashing → Signatures, Blockchain
      2: [4, 7],   // Password → Attack, Encryption
      3: [6, 7],   // File Encrypt → Decrypt, Encryption
      4: [2, 7],   // Attack → Password, Encryption
      5: [9, 3],   // Stego → Pipeline, File Encrypt
      6: [7, 3],   // Decrypt → Encryption, File Encrypt
      7: [6, 3],   // Encryption → Decrypt, File Encrypt
      8: [7, 1],   // Encoding → Encryption, Hashing
      9: [5, 7],   // Pipeline → Stego, Encryption
      10: [1, 0],  // Blockchain → Hashing, Signatures
    };
    return (related[currentSlide] || []).map(i => ({ index: i, ...slides[i] }));
  }, [currentSlide]);

  return (
    <section id="crypto-lab" className="section hacks-section">
      <div className="section-bg">
        <div className="section-pattern"></div>
      </div>
      
      <div className="container">
        <div className="section-header">
          <div className="section-header-top">
            <span className="section-number">03</span>
            <h2 className="section-title">
              <i className="fa-solid fa-flask"></i>
              Cybersecurity Lab
            </h2>
          </div>
          <span className="title-underline"></span>
          <p className="section-description" style={{ fontFamily: 'var(--font-code)', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>
            <i className="fa-solid fa-keyboard"></i> Use <kbd style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '4px', padding: '1px 5px', fontSize: '0.7rem', color: 'var(--primary-hex)' }}>←</kbd>&nbsp;<kbd style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '4px', padding: '1px 5px', fontSize: '0.7rem', color: 'var(--primary-hex)' }}>→</kbd> to navigate · <kbd style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '4px', padding: '1px 5px', fontSize: '0.7rem', color: 'var(--primary-hex)' }}>Esc</kbd> to close selector
          </p>
        </div>

        {/* Module Toolbar: Search + Selector + Auto-play */}
        <div className="module-toolbar" ref={selectorRef}>
          <div className="module-search-wrapper">
            <i className="fa-solid fa-search" style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}></i>
            <input
              ref={searchRef}
              type="text"
              className="module-search-input"
              placeholder="Search modules... (e.g. 'hash', 'encrypt')"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSelector(true); }}
              onFocus={() => setShowSelector(true)}
              aria-label="Search modules"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
                style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', padding: '4px' }}
                aria-label="Clear search"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            )}
          </div>
          <button
            className="module-selector-toggle"
            onClick={() => setShowSelector(prev => !prev)}
            aria-expanded={showSelector}
            aria-label="Toggle module selector"
          >
            <i className={`fa-solid ${showSelector ? 'fa-chevron-up' : 'fa-grid-2'}`}></i>
            <span>{showSelector ? 'Close' : `All Modules (${slides.length})`}</span>
          </button>
          <button
            className="module-selector-toggle"
            onClick={() => setIsAutoPlaying(prev => !prev)}
            style={{ borderColor: isAutoPlaying ? 'var(--secondary-hex)' : undefined, color: isAutoPlaying ? 'var(--secondary-hex)' : undefined }}
            aria-label={isAutoPlaying ? 'Stop auto-play' : 'Start auto-play'}
            title={isAutoPlaying ? 'Stop auto-play' : 'Auto-advance slides every 10s'}
          >
            <i className={`fa-solid ${isAutoPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            <span className="hide-mobile">{isAutoPlaying ? 'Pause' : 'Auto'}</span>
          </button>

          {/* Module Selector Dropdown */}
          {showSelector && (
            <div className="module-selector-panel">
              {(filteredSlides || slides.map((slide, index) => ({ slide, index }))).map(({ slide, index }) => (
                <button
                  key={slide.id}
                  className={`module-selector-item ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                >
                  <span className="module-selector-num">{String(index + 1).padStart(2, '0')}</span>
                  <i className={`fa-solid ${slide.icon}`}></i>
                  <span>{slide.title}</span>
                </button>
              ))}
              {filteredSlides && filteredSlides.length === 0 && (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-code)', fontSize: '0.8rem', gridColumn: '1/-1' }}>
                  No modules match "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hacks-slider">
          <div
            className="slider-viewport"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-y' }}
          >
            <div 
              className="slider-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div key={slide.id} className="slider-slide">
                  <div className="slide-card">
                    <div className={`slide-bg-gradient ${slide.bgClass}`}></div>
                    <div className="slide-pattern"></div>
                    
                    <div className="slide-content-wrapper">
                      <div className="slide-icon-container">
                        <div className="slide-icon-border"></div>
                        <i className={`fa-solid ${slide.icon}`}></i>
                        <div className="icon-ripple"></div>
                      </div>
                      
                      <h3 className="slide-title">{slide.title}</h3>
                      <p className="slide-description">{slide.description}</p>
                      
                      <div className="slide-metrics">
                        {slide.metrics.map((metric, idx) => (
                          <div key={idx} className="metric-item">
                            <span className="metric-value">{metric.value}</span>
                            <span className="metric-label">{metric.label}</span>
                          </div>
                        ))}
                      </div>

                      <slide.component />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="slider-controls">
            <button className="slider-nav-btn" onClick={prevSlide} aria-label="Previous slide">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            
            <div className="slider-indicators">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  className={`slider-indicator ${idx === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            
            <button className="slider-nav-btn" onClick={nextSlide} aria-label="Next slide">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <div className="slider-footer">
            <div className="slider-counter">
              <span className="current-slide">{String(currentSlide + 1).padStart(2, '0')}</span>
              <span className="slide-separator">/</span>
              <span className="total-slides">{String(slides.length).padStart(2, '0')}</span>
            </div>
            
            <div className="swipe-hint hide-desktop" aria-hidden="true">
              <i className="fa-solid fa-hand-pointer"></i>
              <span>Swipe to navigate</span>
            </div>

            <div className="slider-progress-wrapper">
              <div className="slider-progress-bar">
                <div 
                  className="slider-progress-fill"
                  style={{ width: `${progressWidth}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Suggested Modules */}
          {suggestedModules.length > 0 && (
            <div className="suggested-modules">
              <span className="suggested-label">
                <i className="fa-solid fa-lightbulb"></i> Try Next:
              </span>
              {suggestedModules.map((mod) => (
                <button
                  key={mod.index}
                  className="suggested-module-btn"
                  onClick={() => goToSlide(mod.index)}
                >
                  <i className={`fa-solid ${mod.icon}`}></i>
                  <span>{mod.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CryptoLab;
