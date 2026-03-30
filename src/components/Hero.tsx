import { useEffect, useRef } from 'react';

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 10, 20, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff88';
      ctx.font = `${fontSize}px 'Fira Code', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const stats = [
    { icon: 'fa-shield-halved', number: '500+', label: 'Threats Neutralized' },
    { icon: 'fa-bug', number: '150+', label: 'Vulnerabilities Found' },
    { icon: 'fa-clock', number: '99.9%', label: 'Uptime Secured' },
    { icon: 'fa-trophy', number: '50+', label: 'Projects Delivered' },
  ];

  return (
    <section id="home" className="hero section">
      <div className="hero-bg">
        <canvas ref={canvasRef} id="matrixCanvas"></canvas>
        <div className="grid-overlay"></div>
        <div className="scan-line"></div>
        <div className="hack-particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            >
              {Math.random() > 0.5 ? '1' : '0'}
            </div>
          ))}
        </div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fa-solid fa-terminal"></i>
            <span>SECURITY SPECIALIST</span>
            <span className="badge-pulse"></span>
          </div>

          <h1 className="hero-title">
            <span className="title-word">ELITE</span>
            <span className="title-word highlight">CYBERSECURITY</span>
            <span className="title-word">EXPERT</span>
          </h1>

          <div className="hero-subtitle">
            <span className="subtitle-text">Penetration Testing</span>
            <span className="subtitle-separator">|</span>
            <span className="subtitle-text">Cryptography</span>
            <span className="subtitle-separator">|</span>
            <span className="subtitle-text">Security Architecture</span>
          </div>

          <p className="hero-description">
            Specialized in advanced threat detection, vulnerability assessment, and enterprise security solutions. 
            Protecting digital assets with cutting-edge cryptographic protocols and zero-trust architecture.
          </p>

          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">
                  <i className={`fa-solid ${stat.icon}`}></i>
                </div>
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="hero-buttons">
            <a href="#crypto-lab" className="btn btn-primary">
              <i className="fa-solid fa-flask"></i>
              <span>Explore Crypto Lab</span>
              <span className="btn-shine"></span>
            </a>
            <a href="#contact" className="btn btn-secondary">
              <i className="fa-solid fa-paper-plane"></i>
              <span>Get In Touch</span>
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="security-monitor">
            <div className="monitor-frame">
              <div className="monitor-screen">
                <div className="screen-content">
                  <div className="screen-header">
                    <div className="screen-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="screen-title">SECURITY_DASHBOARD.exe</span>
                  </div>
                  <div className="screen-body">
                    <div className="dashboard-item">
                      <span className="dashboard-label">System Status</span>
                      <span className="dashboard-value active">● SECURE</span>
                      <div className="dashboard-bar">
                        <div className="dashboard-progress" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                    <div className="dashboard-item">
                      <span className="dashboard-label">Threat Level</span>
                      <span className="dashboard-value" style={{ color: 'hsl(var(--warning))' }}>● MODERATE</span>
                      <div className="dashboard-bar">
                        <div className="dashboard-progress" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div className="dashboard-item">
                      <span className="dashboard-label">Encryption Active</span>
                      <span className="dashboard-value active">● AES-256-GCM</span>
                      <div className="dashboard-bar">
                        <div className="dashboard-progress" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="monitor-stand"></div>
            <div className="floating-icons">
              <div className="float-icon icon-1"><i className="fa-solid fa-lock"></i></div>
              <div className="float-icon icon-2"><i className="fa-solid fa-key"></i></div>
              <div className="float-icon icon-3"><i className="fa-solid fa-shield-halved"></i></div>
              <div className="float-icon icon-4"><i className="fa-solid fa-fingerprint"></i></div>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-hint">
        <div className="scroll-mouse">
          <div className="scroll-wheel"></div>
        </div>
        <span>Scroll to Explore</span>
      </div>
    </section>
  );
};

export default Hero;
