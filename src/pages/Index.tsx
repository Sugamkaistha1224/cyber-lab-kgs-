import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import QuickAccess from '@/components/QuickAccess';
import About from '@/components/About';
import Services from '@/components/Services';
import CryptoLab from '@/components/CryptoLab';
import CTFLab from '@/components/CTFLab';
import SecurityTools from '@/components/SecurityTools';
import DeepfakeDetector from '@/components/DeepfakeDetector';
import SecurityTraining from '@/components/SecurityTraining';
import Certifications from '@/components/Certifications';
import Contact from '@/components/Contact';
import SecurityDashboard from '@/components/SecurityDashboard';
import Footer from '@/components/Footer';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setLoadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(progressInterval);
  }, []);

  if (isLoading) {
    return (
      <div className="loader-screen">
        <div style={{ maxWidth: '600px', width: '90%', padding: '2rem' }}>
          <div className="hack-terminal">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="terminal-title">system_init.sh</span>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="prompt">$</span>
                <span className="command">./initialize_security_modules.sh</span>
              </div>
              <span className="output">
                <span className="success">✓</span> Loading cryptographic engines...
              </span>
              <span className="output">
                <span className="success">✓</span> Initializing AES-256-GCM...
              </span>
              <span className="output">
                <span className="success">✓</span> Loading steganography module...
              </span>
              <span className="output">
                <span className="success">✓</span> Initializing RSA-2048 keys...
              </span>
              <span className="output">
                <span className="success">✓</span> Security protocols active
              </span>
              <div className="terminal-line">
                <span className="prompt">$</span>
                <span className="cursor">_</span>
              </div>
            </div>
          </div>

          <div className="loader-progress-container">
            <div 
              className="loader-progress-bar" 
              style={{ width: `${Math.min(loadProgress, 100)}%` }}
            ></div>
          </div>
          <div className="loader-percentage">
            {Math.round(Math.min(loadProgress, 100))}% Loaded
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header />
      <main>
        <Hero />
        <QuickAccess />
        <About />
        <Services />
        <CryptoLab />
        <CTFLab />
        <SecurityTools />
        <DeepfakeDetector />
        <SecurityTraining />
        <Certifications />
        <SecurityDashboard />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
