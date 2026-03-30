const Certifications = () => {
  const certifications = [
    {
      icon: 'fa-shield-halved',
      title: 'OSCP',
      issuer: 'Offensive Security Certified Professional',
    },
    {
      icon: 'fa-bug',
      title: 'CEH',
      issuer: 'Certified Ethical Hacker',
    },
    {
      icon: 'fa-lock',
      title: 'CISSP',
      issuer: 'Certified Information Systems Security Professional',
    },
    {
      icon: 'fa-cloud',
      title: 'AWS Security',
      issuer: 'AWS Certified Security Specialty',
    },
    {
      icon: 'fa-network-wired',
      title: 'CCNA Security',
      issuer: 'Cisco Certified Network Associate Security',
    },
    {
      icon: 'fa-code',
      title: 'GWAPT',
      issuer: 'GIAC Web Application Penetration Tester',
    },
  ];

  return (
    <section id="certifications" className="section">
      <div className="section-bg">
        <div className="section-pattern"></div>
      </div>
      
      <div className="container">
        <div className="section-header">
          <div className="section-header-top">
            <span className="section-number">08</span>
            <h2 className="section-title">
              <i className="fa-solid fa-certificate"></i>
              Certifications
            </h2>
          </div>
          <span className="title-underline"></span>
        </div>

        <div className="certs-grid">
          {certifications.map((cert, index) => (
            <div key={index} className="cert-card">
              <div className="cert-badge">
                <i className={`fa-solid ${cert.icon}`}></i>
              </div>
              <h3 className="cert-title">{cert.title}</h3>
              <p className="cert-issuer">{cert.issuer}</p>
              <span className="cert-year">Verified</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
