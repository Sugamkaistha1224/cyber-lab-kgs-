import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactInfo = [
    {
      icon: 'fa-envelope',
      title: 'Email',
      value: 'contact@cybersec.dev',
      href: 'mailto:contact@cybersec.dev',
    },
    {
      icon: 'fa-location-dot',
      title: 'Location',
      value: 'Available Worldwide',
      href: null,
    },
    {
      icon: 'fa-clock',
      title: 'Response Time',
      value: '24-48 Hours',
      href: null,
    },
  ];

  return (
    <section id="contact" className="section">
      <div className="section-bg">
        <div className="section-pattern"></div>
      </div>
      
      <div className="container">
        <div className="section-header">
          <div className="section-header-top">
            <span className="section-number">09</span>
            <h2 className="section-title">
              <i className="fa-solid fa-envelope"></i>
              Contact
            </h2>
          </div>
          <span className="title-underline"></span>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-card">
                <div className="contact-icon">
                  <i className={`fa-solid ${info.icon}`}></i>
                </div>
                <div className="contact-details">
                  <h4>{info.title}</h4>
                  {info.href ? (
                    <a href={info.href}>{info.value}</a>
                  ) : (
                    <span>{info.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                name="subject"
                className="form-input"
                placeholder="How can I help?"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                name="message"
                className="form-input form-textarea"
                placeholder="Your message..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <i className="fa-solid fa-paper-plane"></i>
              <span>Send Message</span>
              <span className="btn-shine"></span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
