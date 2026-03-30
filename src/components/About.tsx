const About = () => {
  const features = [
    {
      icon: 'fa-shield-halved',
      title: 'Threat Analysis',
      description: 'Advanced threat detection and vulnerability assessment using cutting-edge security tools.',
    },
    {
      icon: 'fa-code',
      title: 'Secure Development',
      description: 'Building secure applications with security-first architecture and code review.',
    },
    {
      icon: 'fa-network-wired',
      title: 'Network Security',
      description: 'Comprehensive network protection with firewall configuration and intrusion detection.',
    },
    {
      icon: 'fa-user-lock',
      title: 'Identity Management',
      description: 'Implementing robust authentication and authorization systems.',
    },
  ];

  return (
    <section id="about" className="section">
      <div className="section-bg">
        <div className="section-pattern"></div>
      </div>
      
      <div className="container">
        <div className="section-header">
          <div className="section-header-top">
            <span className="section-number">01</span>
            <h2 className="section-title">
              <i className="fa-solid fa-user-secret"></i>
              About Me
            </h2>
          </div>
          <span className="title-underline"></span>
        </div>

        <div className="about-wrapper">
          <div className="about-intro-section">
            <div className="about-badge">
              <i className="fa-solid fa-terminal"></i>
              CYBERSECURITY PROFESSIONAL
            </div>
            <p className="about-text">
              A passionate cybersecurity expert with extensive experience in penetration testing, 
              cryptography, and enterprise security architecture. I specialize in protecting 
              digital assets and building secure systems that withstand modern cyber threats.
              With a deep understanding of both offensive and defensive security strategies,
              I help organizations strengthen their security posture and maintain compliance
              with industry standards.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-content">
              <div className="hack-terminal">
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <span className="terminal-title">security_profile.sh</span>
                </div>
                <div className="terminal-body">
                  <div className="terminal-line">
                    <span className="prompt">$</span>
                    <span className="command">cat ./skills.json</span>
                  </div>
                  <span className="output">
                    <span className="success">✓</span> Penetration Testing (OWASP, Burp Suite)
                  </span>
                  <span className="output">
                    <span className="success">✓</span> Cryptography (AES, RSA, SHA)
                  </span>
                  <span className="output">
                    <span className="success">✓</span> Network Security (Firewalls, IDS/IPS)
                  </span>
                  <span className="output">
                    <span className="success">✓</span> Cloud Security (AWS, Azure)
                  </span>
                  <span className="output">
                    <span className="success">✓</span> Incident Response & Forensics
                  </span>
                  <div className="terminal-line">
                    <span className="prompt">$</span>
                    <span className="cursor">_</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-features">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <i className={`fa-solid ${feature.icon}`}></i>
                  </div>
                  <div className="feature-content">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-desc">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
