import { useState, useEffect, useCallback } from 'react';
import { Shield, Home, User, Briefcase, FlaskConical, Flag, Wrench, Eye, GraduationCap, Award, BarChart3, Mail, X, Menu, ChevronRight } from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  group?: string;
}

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for active section detection
  useEffect(() => {
    const sectionIds = [
      'home', 'about', 'services', 'crypto-lab', 'ctf-lab',
      'security-tools', 'deepfake-detector', 'security-training',
      'certifications', 'security-dashboard', 'contact'
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const navLinks: NavItem[] = [
    { href: '#home', icon: <Home size={18} />, label: 'Home' },
    { href: '#about', icon: <User size={18} />, label: 'About' },
    { href: '#services', icon: <Briefcase size={18} />, label: 'Services' },
    { href: '#crypto-lab', icon: <FlaskConical size={18} />, label: 'Crypto Lab', group: 'Labs' },
    { href: '#ctf-lab', icon: <Flag size={18} />, label: 'CTF Lab', group: 'Labs' },
    { href: '#security-tools', icon: <Wrench size={18} />, label: 'Tools', group: 'Security' },
    { href: '#deepfake-detector', icon: <Eye size={18} />, label: 'AI Detector', group: 'Security' },
    { href: '#security-training', icon: <GraduationCap size={18} />, label: 'Training', group: 'Security' },
    { href: '#certifications', icon: <Award size={18} />, label: 'Certs' },
    { href: '#security-dashboard', icon: <BarChart3 size={18} />, label: 'Dashboard' },
    { href: '#contact', icon: <Mail size={18} />, label: 'Contact' },
  ];

  const scrollToSection = useCallback((href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  }, []);

  const primaryLinks = navLinks.slice(0, 7);
  const secondaryLinks = navLinks.slice(7);

  return (
    <>
      <header className={`cyber-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="cyber-header-inner">
          <a
            href="#home"
            className="cyber-brand"
            onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}
          >
            <span className="cyber-brand-icon">
              <Shield size={24} />
              <span className="cyber-pulse-ring" />
            </span>
            <span className="cyber-brand-text">CYBERFOLIO</span>
          </a>

          {/* Desktop nav */}
          <nav className="cyber-desktop-nav" aria-label="Main navigation">
            {primaryLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`cyber-nav-item ${activeSection === link.href ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
            {secondaryLinks.length > 0 && (
              <div className="cyber-nav-more">
                <button className={`cyber-nav-item cyber-more-btn ${secondaryLinks.some(l => activeSection === l.href) ? 'active' : ''}`}>
                  <ChevronRight size={18} />
                  <span>More</span>
                </button>
                <div className="cyber-more-dropdown">
                  {secondaryLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className={`cyber-dropdown-item ${activeSection === link.href ? 'active' : ''}`}
                      onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Hamburger */}
          <button
            className="cyber-hamburger"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      <div
        className={`cyber-sidebar-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile sidebar */}
      <aside
        className={`cyber-sidebar ${isMenuOpen ? 'active' : ''}`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="cyber-sidebar-header">
          <a href="#home" className="cyber-brand" onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}>
            <Shield size={22} />
            <span className="cyber-brand-text">CYBERFOLIO</span>
          </a>
          <button
            className="cyber-sidebar-close"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="cyber-sidebar-nav">
          <div className="cyber-sidebar-group">
            <span className="cyber-sidebar-group-label">Navigation</span>
            {navLinks.filter(l => !l.group).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`cyber-sidebar-link ${activeSection === link.href ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          <div className="cyber-sidebar-group">
            <span className="cyber-sidebar-group-label">Labs</span>
            {navLinks.filter(l => l.group === 'Labs').map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`cyber-sidebar-link ${activeSection === link.href ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          <div className="cyber-sidebar-group">
            <span className="cyber-sidebar-group-label">Security Features</span>
            {navLinks.filter(l => l.group === 'Security').map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`cyber-sidebar-link ${activeSection === link.href ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </nav>

        <div className="cyber-sidebar-footer">
          <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
            © 2024 Cyberfolio
          </span>
        </div>
      </aside>
    </>
  );
};

export default Header;
