import { FlaskConical, Flag, Wrench, Eye, GraduationCap, BarChart3, Shield, Lock } from 'lucide-react';

const modules = [
  { href: '#crypto-lab', icon: <FlaskConical size={24} />, label: 'Crypto Lab', desc: 'Encryption & Hashing' },
  { href: '#ctf-lab', icon: <Flag size={24} />, label: 'CTF Lab', desc: 'Capture The Flag' },
  { href: '#security-tools', icon: <Wrench size={24} />, label: 'Security Tools', desc: 'Hash & Encode' },
  { href: '#deepfake-detector', icon: <Eye size={24} />, label: 'AI Detector', desc: 'Deepfake Analysis' },
  { href: '#security-training', icon: <GraduationCap size={24} />, label: 'Training', desc: 'Phishing Sims' },
  { href: '#security-dashboard', icon: <BarChart3 size={24} />, label: 'Dashboard', desc: 'Progress Charts' },
  { href: '#services', icon: <Shield size={24} />, label: 'Services', desc: 'Security Solutions' },
  { href: '#certifications', icon: <Lock size={24} />, label: 'Certifications', desc: 'Credentials' },
];

const QuickAccess = () => {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="quick-access-section">
      <div className="container">
        <div className="quick-access-header">
          <h2 className="quick-access-title">
            <span style={{ color: 'var(--primary-hex)' }}>⚡</span> Quick Access Dashboard
          </h2>
          <p className="quick-access-subtitle">Jump directly to any module</p>
        </div>
        <div className="quick-access-grid">
          {modules.map((mod) => (
            <button
              key={mod.href}
              className="quick-access-card"
              onClick={() => scrollTo(mod.href)}
            >
              <div className="qa-card-icon">{mod.icon}</div>
              <div className="qa-card-text">
                <span className="qa-card-label">{mod.label}</span>
                <span className="qa-card-desc">{mod.desc}</span>
              </div>
              <div className="qa-card-arrow">→</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccess;
