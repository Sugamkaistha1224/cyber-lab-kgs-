const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      href: 'https://www.kaisthagroups.com',
      icon: null,
      image: 'https://www.kaisthagroups.com/logo.png',
      label: 'KaisthaGroups',
    },
    {
      href: 'https://www.linkedin.com/in/sugam-kaistha-52148b207/',
      icon: 'fa-brands fa-linkedin-in',
      image: null,
      label: 'LinkedIn',
    },
    {
      href: 'https://github.com/Sugamkaistha1224',
      icon: 'fa-brands fa-github',
      image: null,
      label: 'GitHub',
    },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p className="footer-text">
            © {currentYear} All Rights Reserved. Built with{' '}
            <i className="fa-solid fa-heart" style={{ color: 'hsl(var(--danger))' }}></i> by{' '}
            <a
              href="https://www.kaisthagroups.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://www.kaisthagroups.com/logo.png"
                alt="KaisthaGroups"
                style={{
                  height: '18px',
                  width: 'auto',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  marginRight: '4px',
                }}
              />
              KaisthaGroups
            </a>
          </p>

          <div className="footer-social">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label={link.label}
              >
                {link.image ? (
                  <img src={link.image} alt={link.label} />
                ) : (
                  <i className={link.icon}></i>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
