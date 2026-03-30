import { useState, useCallback, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface TrainingScenario {
  id: string;
  type: 'phishing-email' | 'fake-login' | 'social-engineering' | 'url-check';
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  content: ScenarioContent;
  correctAnswer: string;
  explanation: string;
}

interface ScenarioContent {
  from?: string;
  subject?: string;
  body: string;
  url?: string;
  choices: { id: string; label: string }[];
}

interface Badge {
  id: string;
  icon: string;
  label: string;
  description: string;
  requirement: string;
  earned: boolean;
}

interface TrainingProgress {
  completed: Record<string, string>; // id → chosen answer
  score: number;
  streak: number;
  bestStreak: number;
  badges: string[];
}

const STORAGE_KEY = 'security_training_v1';

function loadTrainingProgress(): TrainingProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { completed: {}, score: 0, streak: 0, bestStreak: 0, badges: [] };
}

function saveTrainingProgress(p: TrainingProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// ─── Scenarios ───────────────────────────────────────────────────────────────
const SCENARIOS: TrainingScenario[] = [
  {
    id: 'phish-1',
    type: 'phishing-email',
    title: 'Urgent Account Verification',
    difficulty: 'beginner',
    points: 50,
    content: {
      from: 'security@paypa1-support.tk',
      subject: '⚠️ Your account has been compromised! Verify NOW',
      body: 'Dear Valued Customer,\n\nWe detected unauthorized access to your account. Click the link below immediately to verify your identity or your account will be permanently suspended within 24 hours.\n\n[Verify Account Now → https://paypa1-secure.tk/verify]\n\nPayPal Security Team',
      choices: [
        { id: 'legit', label: 'This is a legitimate email — I should click the link' },
        { id: 'phishing', label: 'This is a phishing attempt — I should NOT click' },
        { id: 'unsure', label: 'I\'m not sure — I\'ll forward it to a friend' },
      ],
    },
    correctAnswer: 'phishing',
    explanation: 'Red flags: The sender domain "paypa1-support.tk" uses "1" instead of "l" (homograph), uses a suspicious .tk TLD, creates artificial urgency ("24 hours"), and the link goes to a non-PayPal domain. Always check sender addresses and hover over links before clicking.',
  },
  {
    id: 'phish-2',
    type: 'phishing-email',
    title: 'CEO Wire Transfer Request',
    difficulty: 'intermediate',
    points: 75,
    content: {
      from: 'ceo@company-internal.com',
      subject: 'Confidential: Urgent Wire Transfer Needed',
      body: 'Hi,\n\nI need you to process an urgent wire transfer of $45,000 to a new vendor. This is time-sensitive and confidential — don\'t discuss with anyone else. I\'m in a meeting and can\'t take calls.\n\nPlease use these bank details:\nBank: First National\nAccount: 8847291034\nRouting: 021000021\n\nConfirm when done.\n\nBest,\nJohn (CEO)',
      choices: [
        { id: 'process', label: 'Process the transfer — the CEO asked directly' },
        { id: 'verify', label: 'Call the CEO on a known number to verify' },
        { id: 'ignore', label: 'Delete the email — it\'s obviously fake' },
        { id: 'report', label: 'Verify through proper channels AND report to IT security' },
      ],
    },
    correctAnswer: 'report',
    explanation: 'This is a Business Email Compromise (BEC) attack. Red flags: urgency, secrecy demands ("don\'t discuss"), inability to verify via phone, unusual payment request. The BEST response is to verify through known channels AND report to IT — just ignoring it leaves the organization vulnerable.',
  },
  {
    id: 'url-1',
    type: 'url-check',
    title: 'Spot the Fake Login',
    difficulty: 'beginner',
    points: 50,
    content: {
      body: 'Which of these URLs is the REAL Google login page?',
      choices: [
        { id: 'a', label: 'https://accounts.google.com/signin' },
        { id: 'b', label: 'https://google-accounts.signin-verify.com/login' },
        { id: 'c', label: 'https://accounts.g00gle.com/signin' },
        { id: 'd', label: 'https://google.com.account-verify.tk/signin' },
      ],
    },
    correctAnswer: 'a',
    explanation: 'Only "accounts.google.com" is the real Google domain. Option B uses "signin-verify.com" (not Google), C uses "g00gle" with zeros, and D uses ".tk" TLD with google.com as a subdomain of a fake domain.',
  },
  {
    id: 'social-1',
    type: 'social-engineering',
    title: 'IT Support Phone Call',
    difficulty: 'intermediate',
    points: 75,
    content: {
      body: 'You receive a phone call:\n\n"Hi, this is Mike from IT Support. We\'ve detected a virus on your work computer and need to install a security patch remotely. I need your login credentials and for you to install this remote access tool — TeamViewer. Can you give me your password so we can start the cleanup immediately?"\n\nWhat do you do?',
      choices: [
        { id: 'comply', label: 'Give them my password — they\'re from IT' },
        { id: 'partial', label: 'Install TeamViewer but don\'t give the password' },
        { id: 'hangup', label: 'Hang up and call the IT department using the official number' },
        { id: 'ask', label: 'Ask for their employee ID to verify' },
      ],
    },
    correctAnswer: 'hangup',
    explanation: 'This is a vishing (voice phishing) attack. Red flags: unsolicited call, requesting credentials (legitimate IT never asks for passwords), requesting remote access software, creating urgency. The safest action is to hang up and call IT directly using a known, verified phone number.',
  },
  {
    id: 'phish-3',
    type: 'phishing-email',
    title: 'Delivery Notification',
    difficulty: 'beginner',
    points: 50,
    content: {
      from: 'delivery-notice@fedex-tracking.xyz',
      subject: 'Your package could not be delivered - Action Required',
      body: 'FedEx Delivery Notification\n\nTracking #: 7294810395\n\nWe attempted to deliver your package but no one was available. To reschedule delivery, please confirm your address and pay the $2.99 redelivery fee:\n\n[Reschedule Delivery → fedex-redelivery.xyz/pay]\n\nIf not claimed within 3 days, the package will be returned to sender.',
      choices: [
        { id: 'pay', label: 'Pay the $2.99 fee — I am expecting a package' },
        { id: 'phishing', label: 'This is phishing — FedEx doesn\'t charge redelivery fees via email' },
        { id: 'check', label: 'Go directly to fedex.com and check the tracking number' },
      ],
    },
    correctAnswer: 'phishing',
    explanation: 'Red flags: ".xyz" domain (not fedex.com), FedEx doesn\'t charge redelivery fees via email, the link goes to a fake domain, and the urgency creates pressure. If you\'re expecting a package, always go directly to the official FedEx website.',
  },
  {
    id: 'social-2',
    type: 'social-engineering',
    title: 'USB Drive Found',
    difficulty: 'advanced',
    points: 100,
    content: {
      body: 'You find a USB drive in the office parking lot. It has a label that says "HR - Salary Info Q4 2024 - Confidential." What do you do?',
      choices: [
        { id: 'plug', label: 'Plug it into my computer to see what\'s on it' },
        { id: 'hr', label: 'Bring it to HR — it might be important' },
        { id: 'security', label: 'Turn it in to IT Security without plugging it in' },
        { id: 'ignore', label: 'Leave it where it is' },
      ],
    },
    correctAnswer: 'security',
    explanation: 'This is a classic "USB drop" attack (baiting). Attackers leave infected USB drives with enticing labels to trick people into plugging them in, which can auto-install malware. The correct action is to turn it in to IT Security, who have isolated systems to safely examine it. Never plug unknown USB devices into any computer.',
  },
];

// ─── Badge definitions ───────────────────────────────────────────────────────
const BADGE_DEFS: Omit<Badge, 'earned'>[] = [
  { id: 'first-win', icon: 'fa-medal', label: 'First Blood', description: 'Complete your first challenge', requirement: '1 challenge completed' },
  { id: 'phish-hunter', icon: 'fa-fish', label: 'Phishing Detector', description: 'Correctly identify 3 phishing attempts', requirement: '3 phishing challenges correct' },
  { id: 'streak-3', icon: 'fa-fire', label: 'On Fire', description: 'Get 3 correct answers in a row', requirement: '3 streak' },
  { id: 'perfect', icon: 'fa-crown', label: 'Security Master', description: 'Complete all challenges with correct answers', requirement: 'All correct' },
  { id: 'all-done', icon: 'fa-trophy', label: 'Graduate', description: 'Complete all training scenarios', requirement: 'All completed' },
];

const SecurityTraining = () => {
  const [progress, setProgress] = useState<TrainingProgress>(loadTrainingProgress);
  const [activeScenario, setActiveScenario] = useState<TrainingScenario | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const persist = useCallback((p: TrainingProgress) => {
    setProgress(p);
    saveTrainingProgress(p);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!activeScenario || !selectedAnswer) return;
    const isCorrect = selectedAnswer === activeScenario.correctAnswer;
    const newStreak = isCorrect ? progress.streak + 1 : 0;
    const earnedPoints = isCorrect ? activeScenario.points : 0;

    const newProgress: TrainingProgress = {
      ...progress,
      completed: { ...progress.completed, [activeScenario.id]: selectedAnswer },
      score: progress.score + earnedPoints,
      streak: newStreak,
      bestStreak: Math.max(progress.bestStreak, newStreak),
    };

    // Check badges
    const completedCount = Object.keys(newProgress.completed).length;
    const correctCount = Object.values(newProgress.completed).filter((v, i) => {
      const scenario = SCENARIOS.find(s => Object.keys(newProgress.completed)[i] === undefined ? false : s.id === Object.keys(newProgress.completed)[i]);
      return scenario && v === scenario.correctAnswer;
    }).length;

    const badges = [...newProgress.badges];
    if (completedCount >= 1 && !badges.includes('first-win')) badges.push('first-win');
    if (correctCount >= 3 && !badges.includes('phish-hunter')) badges.push('phish-hunter');
    if (newStreak >= 3 && !badges.includes('streak-3')) badges.push('streak-3');
    if (completedCount >= SCENARIOS.length && !badges.includes('all-done')) badges.push('all-done');
    if (completedCount >= SCENARIOS.length && correctCount >= SCENARIOS.length && !badges.includes('perfect')) badges.push('perfect');
    newProgress.badges = badges;

    persist(newProgress);
    setSubmitted(true);
  }, [activeScenario, selectedAnswer, progress, persist]);

  const openScenario = (s: TrainingScenario) => {
    setActiveScenario(s);
    setSelectedAnswer(progress.completed[s.id] || null);
    setSubmitted(!!progress.completed[s.id]);
    setShowExplanation(false);
  };

  const closeScenario = () => {
    setActiveScenario(null);
    setSelectedAnswer(null);
    setSubmitted(false);
    setShowExplanation(false);
  };

  const completedCount = Object.keys(progress.completed).length;
  const badges: Badge[] = BADGE_DEFS.map(b => ({ ...b, earned: progress.badges.includes(b.id) }));
  const diffColors = { beginner: 'var(--primary-hex)', intermediate: 'hsl(var(--warning))', advanced: 'hsl(var(--danger))' };
  const typeIcons = { 'phishing-email': 'fa-envelope', 'fake-login': 'fa-right-to-bracket', 'social-engineering': 'fa-people-arrows', 'url-check': 'fa-link' };

  return (
    <section id="security-training" className="section hacks-section">
      <div className="section-bg"><div className="section-pattern"></div></div>
      <div className="container">
        <div className="section-header">
          <div className="section-header-top">
            <span className="section-number">07</span>
            <h2 className="section-title">
              <i className="fa-solid fa-graduation-cap"></i>
              Security Training
            </h2>
          </div>
          <span className="title-underline"></span>
          <p className="section-description">
            Interactive cybersecurity awareness training. Learn to identify phishing, social engineering, and other attacks through realistic simulations.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {[
            { icon: 'fa-star', label: 'Score', value: progress.score, color: 'hsl(var(--warning))' },
            { icon: 'fa-check-circle', label: 'Completed', value: `${completedCount}/${SCENARIOS.length}`, color: 'var(--primary-hex)' },
            { icon: 'fa-fire', label: 'Best Streak', value: progress.bestStreak, color: 'hsl(var(--danger))' },
            { icon: 'fa-medal', label: 'Badges', value: `${progress.badges.length}/${BADGE_DEFS.length}`, color: 'var(--secondary-hex)' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '0.8rem 1.2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px',
              border: '1px solid rgba(0,255,136,0.1)', textAlign: 'center', minWidth: '100px',
            }}>
              <div style={{ fontSize: '1.2rem', color: s.color, fontFamily: 'var(--font-tech)' }}>
                <i className={`fa-solid ${s.icon}`}></i> {s.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {badges.map(b => (
            <div key={b.id} title={b.earned ? b.description : b.requirement} style={{
              padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem',
              background: b.earned ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${b.earned ? 'var(--primary-hex)' : 'rgba(255,255,255,0.1)'}`,
              color: b.earned ? 'var(--primary-hex)' : 'hsl(var(--text-muted))',
              opacity: b.earned ? 1 : 0.5, cursor: 'help',
            }}>
              <i className={`fa-solid ${b.icon}`}></i> {b.label}
            </div>
          ))}
        </div>

        {/* Scenario cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', maxWidth: '900px', margin: '0 auto' }}>
          {SCENARIOS.map(s => {
            const done = !!progress.completed[s.id];
            const correct = done && progress.completed[s.id] === s.correctAnswer;
            return (
              <div key={s.id} className="ctf-card" onClick={() => openScenario(s)} role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && openScenario(s)}
                style={{ borderColor: done ? (correct ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)') : undefined }}>
                <div className="ctf-card-header">
                  <span className="ctf-category-badge">
                    <i className={`fa-solid ${typeIcons[s.type]}`}></i>
                    {s.type.replace(/-/g, ' ')}
                  </span>
                  <span className="ctf-difficulty-badge" style={{ color: diffColors[s.difficulty] }}>{s.difficulty}</span>
                </div>
                <h3 className="ctf-card-title">{s.title}</h3>
                <div className="ctf-card-footer">
                  <span className="ctf-points"><i className="fa-solid fa-star"></i> {s.points} pts</span>
                  {done && (
                    <span style={{ color: correct ? 'var(--primary-hex)' : 'hsl(var(--danger))', fontSize: '0.8rem' }}>
                      <i className={`fa-solid ${correct ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                      {correct ? ' Correct' : ' Wrong'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scenario modal */}
        {activeScenario && (
          <div className="ctf-modal-overlay" onClick={e => e.target === e.currentTarget && closeScenario()}>
            <div className="ctf-modal">
              <div className="ctf-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span className="ctf-category-badge"><i className={`fa-solid ${typeIcons[activeScenario.type]}`}></i> {activeScenario.type.replace(/-/g, ' ')}</span>
                  <span className="ctf-difficulty-badge" style={{ color: diffColors[activeScenario.difficulty] }}>{activeScenario.difficulty}</span>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: 'hsl(var(--warning))' }}>
                    <i className="fa-solid fa-star"></i> {activeScenario.points} pts
                  </span>
                </div>
                <button className="ctf-modal-close" onClick={closeScenario}><i className="fa-solid fa-times"></i></button>
              </div>

              <h2 className="ctf-modal-title">{activeScenario.title}</h2>

              <div className="ctf-modal-body">
                {/* Email header */}
                {activeScenario.content.from && (
                  <div style={{
                    padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,136,0.1)',
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                      <strong>From:</strong> {activeScenario.content.from}
                    </div>
                    {activeScenario.content.subject && (
                      <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '0.3rem' }}>
                        <strong>Subject:</strong> {activeScenario.content.subject}
                      </div>
                    )}
                  </div>
                )}

                {/* Body */}
                <div style={{
                  padding: '1rem', borderRadius: '6px', marginBottom: '1rem',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)',
                  fontFamily: 'var(--font-code)', fontSize: '0.85rem',
                  color: 'hsl(var(--text-secondary))', lineHeight: '1.8', whiteSpace: 'pre-wrap',
                }}>
                  {activeScenario.content.body}
                </div>

                {/* Choices */}
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-tech)', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '0.6rem' }}>
                    YOUR RESPONSE:
                  </h4>
                  {activeScenario.content.choices.map(choice => {
                    const isSelected = selectedAnswer === choice.id;
                    const isCorrect = choice.id === activeScenario.correctAnswer;
                    let borderColor = 'rgba(0,255,136,0.15)';
                    if (submitted) {
                      if (isCorrect) borderColor = 'var(--primary-hex)';
                      else if (isSelected && !isCorrect) borderColor = 'hsl(var(--danger))';
                    } else if (isSelected) borderColor = 'var(--secondary-hex)';

                    return (
                      <button key={choice.id} onClick={() => !submitted && setSelectedAnswer(choice.id)}
                        disabled={submitted}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left', padding: '0.8rem 1rem',
                          marginBottom: '0.5rem', borderRadius: '6px', cursor: submitted ? 'default' : 'pointer',
                          background: isSelected ? 'rgba(0,212,255,0.08)' : 'rgba(0,0,0,0.2)',
                          border: `1px solid ${borderColor}`, color: 'hsl(var(--text-secondary))',
                          fontSize: '0.85rem', transition: 'all 0.2s ease',
                        }}>
                        {submitted && isCorrect && <i className="fa-solid fa-check" style={{ color: 'var(--primary-hex)', marginRight: '0.5rem' }}></i>}
                        {submitted && isSelected && !isCorrect && <i className="fa-solid fa-times" style={{ color: 'hsl(var(--danger))', marginRight: '0.5rem' }}></i>}
                        {choice.label}
                      </button>
                    );
                  })}
                </div>

                {!submitted && (
                  <button className="crypto-btn" onClick={handleSubmit} disabled={!selectedAnswer} style={{ marginTop: '1rem' }}>
                    <i className="fa-solid fa-paper-plane"></i> Submit Answer
                  </button>
                )}

                {submitted && (
                  <div style={{ marginTop: '1rem' }}>
                    <button className="ctf-hint-btn" onClick={() => setShowExplanation(!showExplanation)}
                      style={{ borderColor: 'rgba(0,212,255,0.3)', color: 'var(--secondary-hex)' }}>
                      <i className={`fa-solid ${showExplanation ? 'fa-chevron-up' : 'fa-book-open'}`}></i>
                      {showExplanation ? 'Hide' : 'Show'} Explanation
                    </button>
                    {showExplanation && (
                      <div style={{
                        marginTop: '0.8rem', padding: '1rem', borderRadius: '8px',
                        background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.2)',
                        fontFamily: 'var(--font-code)', fontSize: '0.8rem',
                        color: 'hsl(var(--text-secondary))', lineHeight: '1.7',
                      }}>
                        {activeScenario.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reset */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="crypto-btn-outline" onClick={() => {
            if (confirm('Reset all training progress?')) {
              const fresh: TrainingProgress = { completed: {}, score: 0, streak: 0, bestStreak: 0, badges: [] };
              persist(fresh);
            }
          }} style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
            <i className="fa-solid fa-rotate"></i> Reset Progress
          </button>
        </div>
      </div>
    </section>
  );
};

export default SecurityTraining;
