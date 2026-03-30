const Services = () => {
  const services = [
    {
      icon: 'fa-bug',
      number: '01',
      title: 'Penetration Testing',
      description: 'Comprehensive security assessments to identify vulnerabilities before attackers do.',
      features: [
        'Web Application Testing',
        'Network Penetration Testing',
        'Mobile App Security',
        'API Security Assessment',
      ],
    },
    {
      icon: 'fa-shield-halved',
      number: '02',
      title: 'Security Architecture',
      description: 'Designing robust security frameworks and implementing defense-in-depth strategies.',
      features: [
        'Zero Trust Architecture',
        'Security Policy Design',
        'Compliance Frameworks',
        'Risk Assessment',
      ],
    },
    {
      icon: 'fa-key',
      number: '03',
      title: 'Cryptography Services',
      description: 'Implementing encryption solutions and secure key management systems.',
      features: [
        'Encryption Implementation',
        'Key Management',
        'Digital Signatures',
        'Secure Communications',
      ],
    },
    {
      icon: 'fa-magnifying-glass',
      number: '04',
      title: 'Incident Response',
      description: 'Rapid response to security incidents with forensic analysis and remediation.',
      features: [
        'Threat Hunting',
        'Malware Analysis',
        'Digital Forensics',
        'Recovery Planning',
      ],
    },
    {
      icon: 'fa-graduation-cap',
      number: '05',
      title: 'Security Training',
      description: 'Empowering teams with security awareness and technical training programs.',
      features: [
        'Security Awareness',
        'Secure Coding Practices',
        'Phishing Simulations',
        'CTF Workshops',
      ],
    },
    {
      icon: 'fa-cloud',
      number: '06',
      title: 'Cloud Security',
      description: 'Securing cloud infrastructure and implementing cloud-native security controls.',
      features: [
        'Cloud Configuration Audit',
        'Container Security',
        'Serverless Security',
        'Multi-Cloud Strategy',
      ],
    },
  ];

  return (
    <section id="services" className="section">
      <div className="section-bg">
        <div className="section-pattern"></div>
      </div>
      
      <div className="container">
        <div className="section-header">
          <div className="section-header-top">
            <span className="section-number">02</span>
            <h2 className="section-title">
              <i className="fa-solid fa-shield-halved"></i>
              Services
            </h2>
          </div>
          <span className="title-underline"></span>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-header">
                <div className="service-icon">
                  <i className={`fa-solid ${service.icon}`}></i>
                </div>
                <span className="service-number">{service.number}</span>
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <ul className="service-features">
                {service.features.map((feature, idx) => (
                  <li key={idx}>
                    <i className="fa-solid fa-check"></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
