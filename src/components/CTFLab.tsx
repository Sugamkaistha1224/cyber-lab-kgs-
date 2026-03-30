import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CHALLENGES,
  DIFFICULTY_CONFIG,
  CATEGORY_CONFIG,
  validateFlag,
  type CTFChallenge,
  type Category,
  type Difficulty,
} from '@/utils/ctfChallenges';

// ─── localStorage helpers ───────────────────────────────────────────────────
const STORAGE_KEY = 'ctf_progress_v1';

interface CTFProgress {
  solved: Record<string, boolean>;
  score: number;
  hintsUsed: Record<string, number[]>; // challenge id → hint indices revealed
  playerName: string;
  startedAt: number;
}

const defaultProgress = (): CTFProgress => ({
  solved: {},
  score: 0,
  hintsUsed: {},
  playerName: 'Hacker',
  startedAt: Date.now(),
});

function loadProgress(): CTFProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultProgress();
}

function saveProgress(p: CTFProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// ─── Leaderboard (simulated + real local) ──────────────────────────────────
interface LeaderboardEntry { name: string; score: number; solved: number; }

const MOCK_LEADERS: LeaderboardEntry[] = [
  { name: 'CipherGhost',   score: 1200, solved: 9 },
  { name: 'ByteBandit',    score: 950,  solved: 7 },
  { name: 'NullByte_X',    score: 800,  solved: 6 },
  { name: 'RedTeamR00t',   score: 600,  solved: 5 },
  { name: 'ProxyHunter',   score: 425,  solved: 4 },
];

// ─── Challenge Card ─────────────────────────────────────────────────────────
const ChallengeCard = ({
  challenge,
  solved,
  hintsUsed,
  onOpen,
}: {
  challenge: CTFChallenge;
  solved: boolean;
  hintsUsed: number[];
  onOpen: () => void;
}) => {
  const diff = DIFFICULTY_CONFIG[challenge.difficulty];
  const cat  = CATEGORY_CONFIG[challenge.category];
  const hintCost = hintsUsed.reduce((acc, i) => acc + challenge.hints[i].cost, 0);

  return (
    <div
      className={`ctf-card ${solved ? 'ctf-card-solved' : ''}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
    >
      <div className="ctf-card-header">
        <span className="ctf-category-badge">
          <i className={`fa-solid ${cat.icon}`}></i>
          {cat.label}
        </span>
        <span className="ctf-difficulty-badge" style={{ color: diff.color, borderColor: diff.border }}>
          {diff.label}
        </span>
      </div>

      <h3 className="ctf-card-title">{challenge.title}</h3>

      <div className="ctf-card-footer">
        <span className="ctf-points">
          <i className="fa-solid fa-star"></i>
          {solved ? challenge.points - hintCost : challenge.points} pts
        </span>
        {solved ? (
          <span className="ctf-solved-badge">
            <i className="fa-solid fa-check-circle"></i> SOLVED
          </span>
        ) : (
          <span className="ctf-open-badge">
            <i className="fa-solid fa-arrow-right"></i> Attempt
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Challenge Modal ─────────────────────────────────────────────────────────
const ChallengeModal = ({
  challenge,
  solved,
  hintsUsed,
  onClose,
  onSolve,
  onHint,
}: {
  challenge: CTFChallenge;
  solved: boolean;
  hintsUsed: number[];
  onClose: () => void;
  onSolve: (c: CTFChallenge, flag: string) => Promise<boolean>;
  onHint: (c: CTFChallenge, hintIdx: number) => void;
}) => {
  const [flagInput, setFlagInput] = useState('');
  const [result, setResult] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showSolution, setShowSolution] = useState(false);
  const diff = DIFFICULTY_CONFIG[challenge.difficulty];
  const cat  = CATEGORY_CONFIG[challenge.category];

  const handleSubmit = async () => {
    if (!flagInput.trim()) return;
    const ok = await onSolve(challenge, flagInput);
    setResult(ok ? 'correct' : 'wrong');
    if (!ok) setTimeout(() => setResult('idle'), 1500);
  };

  // Markdown-style rendering (simple)
  const renderDesc = (text: string) =>
    text.split('\n').map((line, i) => {
      if (line.startsWith('```')) return null;
      if (line.startsWith('**') && line.endsWith('**'))
        return <p key={i} style={{ fontFamily: 'var(--font-code)', color: 'var(--primary-hex)', margin: '0.5rem 0' }}>{line.replace(/\*\*/g, '')}</p>;
      return <p key={i} style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.7', margin: '0.4rem 0' }}>{line}</p>;
    });

  return (
    <div className="ctf-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ctf-modal">
        {/* Header */}
        <div className="ctf-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <span className="ctf-category-badge">
              <i className={`fa-solid ${cat.icon}`}></i> {cat.label}
            </span>
            <span className="ctf-difficulty-badge" style={{ color: diff.color, borderColor: diff.border }}>
              {diff.label}
            </span>
            <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: 'var(--primary-hex)' }}>
              <i className="fa-solid fa-star"></i> {challenge.points} pts
            </span>
          </div>
          <button className="ctf-modal-close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <h2 className="ctf-modal-title">{challenge.title}</h2>

        {/* Description */}
        <div className="ctf-modal-body">
          {renderDesc(challenge.description)}

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '1rem 0' }}>
            {challenge.tags.map(tag => (
              <span key={tag} style={{
                padding: '0.2rem 0.6rem', borderRadius: '4px',
                background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
                fontFamily: 'var(--font-code)', fontSize: '0.7rem', color: 'var(--secondary-hex)',
              }}>#{tag}</span>
            ))}
          </div>

          {/* Hints */}
          {challenge.hints.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontFamily: 'var(--font-tech)', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '0.5rem' }}>
                HINTS (deducts points)
              </h4>
              {challenge.hints.map((hint, i) => (
                <div key={i} style={{ marginBottom: '0.5rem' }}>
                  {hintsUsed.includes(i) ? (
                    <div className="ctf-hint-revealed">
                      <i className="fa-solid fa-lightbulb" style={{ color: 'hsl(var(--warning))' }}></i>
                      <span>{hint.text}</span>
                    </div>
                  ) : (
                    <button
                      className="ctf-hint-btn"
                      onClick={() => onHint(challenge, i)}
                      disabled={solved}
                    >
                      <i className="fa-solid fa-eye"></i>
                      Hint {i + 1} (−{hint.cost} pts)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Solved state: show flag + solution */}
          {solved && (
            <div className="ctf-solved-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                <i className="fa-solid fa-trophy" style={{ color: 'hsl(var(--warning))', fontSize: '1.2rem' }}></i>
                <span style={{ fontFamily: 'var(--font-tech)', color: 'var(--primary-hex)', fontSize: '0.9rem' }}>CHALLENGE SOLVED!</span>
              </div>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.85rem', color: 'var(--primary-hex)', marginBottom: '0.8rem' }}>
                Flag: <strong>{challenge.flag}</strong>
              </div>
              <button
                className="ctf-hint-btn"
                onClick={() => setShowSolution(!showSolution)}
                style={{ borderColor: 'rgba(0,212,255,0.3)', color: 'var(--secondary-hex)' }}
              >
                <i className={`fa-solid ${showSolution ? 'fa-chevron-up' : 'fa-book-open'}`}></i>
                {showSolution ? 'Hide' : 'Show'} Solution Walkthrough
              </button>
              {showSolution && (
                <div style={{
                  marginTop: '0.8rem', padding: '1rem',
                  background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.2)',
                  borderRadius: '8px', fontFamily: 'var(--font-code)', fontSize: '0.8rem',
                  color: 'hsl(var(--text-secondary))', lineHeight: '1.7',
                }}>
                  {challenge.solution}
                </div>
              )}
            </div>
          )}

          {/* Flag input */}
          {!solved && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ fontFamily: 'var(--font-tech)', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '0.5rem' }}>
                SUBMIT FLAG
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="crypto-input"
                  placeholder="CTF{...}"
                  value={flagInput}
                  onChange={e => setFlagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{
                    flex: 1,
                    borderColor: result === 'correct' ? 'var(--primary-hex)'
                      : result === 'wrong' ? 'hsl(var(--danger))' : undefined,
                  }}
                />
                <button className="crypto-btn" onClick={handleSubmit} style={{ whiteSpace: 'nowrap' }}>
                  <i className="fa-solid fa-flag"></i> Submit
                </button>
              </div>
              {result === 'wrong' && (
                <div className="ctf-wrong-msg">
                  <i className="fa-solid fa-times-circle"></i> Wrong flag. Try again!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main CTF Lab Component ──────────────────────────────────────────────────
const CTFLab = () => {
  const [progress, setProgress] = useState<CTFProgress>(loadProgress);
  const [activeChallenge, setActiveChallenge] = useState<CTFChallenge | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'learn'>('challenges');
  const [playerNameInput, setPlayerNameInput] = useState(progress.playerName);
  const [editingName, setEditingName] = useState(false);
  const [solveAnimation, setSolveAnimation] = useState<string | null>(null);

  const persist = useCallback((p: CTFProgress) => {
    setProgress(p);
    saveProgress(p);
  }, []);

  const handleSolve = useCallback(async (challenge: CTFChallenge, submitted: string): Promise<boolean> => {
    const ok = await validateFlag(challenge, submitted);
    if (!ok) return false;
    if (progress.solved[challenge.id]) return true;

    const hintCost = (progress.hintsUsed[challenge.id] || [])
      .reduce((acc, i) => acc + challenge.hints[i].cost, 0);
    const earned = challenge.points - hintCost;

    setSolveAnimation(challenge.id);
    setTimeout(() => setSolveAnimation(null), 2000);

    persist({
      ...progress,
      solved: { ...progress.solved, [challenge.id]: true },
      score: progress.score + earned,
    });
    return true;
  }, [progress, persist]);

  const handleHint = useCallback((challenge: CTFChallenge, hintIdx: number) => {
    const already = progress.hintsUsed[challenge.id] || [];
    if (already.includes(hintIdx)) return;
    persist({
      ...progress,
      hintsUsed: {
        ...progress.hintsUsed,
        [challenge.id]: [...already, hintIdx],
      },
    });
  }, [progress, persist]);

  const handleNameSave = () => {
    persist({ ...progress, playerName: playerNameInput.trim() || 'Hacker' });
    setEditingName(false);
  };

  const handleReset = () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      const fresh = defaultProgress();
      persist(fresh);
      setPlayerNameInput(fresh.playerName);
    }
  };

  const filtered = useMemo(() =>
    CHALLENGES.filter(c =>
      (filterCategory === 'all' || c.category === filterCategory) &&
      (filterDifficulty === 'all' || c.difficulty === filterDifficulty)
    ), [filterCategory, filterDifficulty]);

  const solvedCount = Object.keys(progress.solved).length;
  const totalChallenges = CHALLENGES.length;
  const completionPct = Math.round((solvedCount / totalChallenges) * 100);

  // Build leaderboard: insert player at correct position
  const leaderboard = useMemo((): LeaderboardEntry[] => {
    const playerEntry: LeaderboardEntry = {
      name: progress.playerName + ' (You)',
      score: progress.score,
      solved: solvedCount,
    };
    const combined = [...MOCK_LEADERS, playerEntry].sort((a, b) => b.score - a.score);
    return combined.slice(0, 8);
  }, [progress.playerName, progress.score, solvedCount]);

  const categories = ['all', 'cryptography', 'web', 'forensics', 'binary', 'steganography', 'network', 'osint'] as const;
  const difficulties = ['all', 'easy', 'medium', 'hard', 'expert'] as const;

  return (
    <section id="ctf-lab" className="section hacks-section">
      <div className="section-bg">
        <div className="section-pattern"></div>
      </div>

      <div className="container">
        <div className="section-header">
          <div className="section-header-top">
            <span className="section-number">04</span>
            <h2 className="section-title">
              <i className="fa-solid fa-flag"></i>
              CTF Lab
            </h2>
          </div>
          <span className="title-underline"></span>
          <p className="section-description">
            Capture The Flag — interactive cybersecurity challenges. Solve puzzles across cryptography, web security, and forensics to earn points and climb the leaderboard.
          </p>
        </div>

        {/* Player stats bar */}
        <div className="ctf-stats-bar">
          <div className="ctf-player-info">
            {editingName ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="crypto-input"
                  value={playerNameInput}
                  onChange={e => setPlayerNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: '160px' }}
                  maxLength={20}
                  autoFocus
                />
                <button className="crypto-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleNameSave}>
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span className="ctf-player-name">
                  <i className="fa-solid fa-user-secret"></i> {progress.playerName}
                </span>
                <i className="fa-solid fa-pencil" style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}></i>
              </button>
            )}
          </div>

          <div className="ctf-stats">
            <div className="ctf-stat">
              <span className="ctf-stat-value" style={{ color: 'hsl(var(--warning))' }}>
                <i className="fa-solid fa-star"></i> {progress.score}
              </span>
              <span className="ctf-stat-label">Score</span>
            </div>
            <div className="ctf-stat">
              <span className="ctf-stat-value" style={{ color: 'var(--primary-hex)' }}>
                {solvedCount}/{totalChallenges}
              </span>
              <span className="ctf-stat-label">Solved</span>
            </div>
            <div className="ctf-stat">
              <span className="ctf-stat-value" style={{ color: 'var(--secondary-hex)' }}>
                {completionPct}%
              </span>
              <span className="ctf-stat-label">Complete</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ width: '100%', height: '6px', background: 'rgba(0,255,136,0.1)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(0,255,136,0.2)' }}>
              <div style={{
                width: `${completionPct}%`, height: '100%',
                background: 'linear-gradient(90deg, var(--primary-hex), var(--secondary-hex))',
                transition: 'width 0.6s ease',
                boxShadow: '0 0 10px var(--primary-hex)',
              }} />
            </div>
          </div>

          <button
            onClick={handleReset}
            style={{
              background: 'none', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '6px',
              color: 'hsl(var(--danger))', cursor: 'pointer', padding: '0.4rem 0.8rem',
              fontFamily: 'var(--font-code)', fontSize: '0.72rem',
            }}
            title="Reset all progress"
          >
            <i className="fa-solid fa-rotate-left"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="ctf-tabs">
          {([['challenges', 'fa-flag', 'Challenges'], ['leaderboard', 'fa-trophy', 'Leaderboard'], ['learn', 'fa-graduation-cap', 'Learn']] as const).map(([id, icon, label]) => (
            <button
              key={id}
              className={`ctf-tab ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <i className={`fa-solid ${icon}`}></i>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ── CHALLENGES TAB ── */}
        {activeTab === 'challenges' && (
          <>
            {/* Filters */}
            <div className="ctf-filters">
              <div className="ctf-filter-group">
                <span className="ctf-filter-label"><i className="fa-solid fa-layer-group"></i> Category:</span>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`ctf-filter-btn ${filterCategory === cat ? 'active' : ''}`}
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat === 'all' ? 'All' : CATEGORY_CONFIG[cat]?.label ?? cat}
                  </button>
                ))}
              </div>
              <div className="ctf-filter-group">
                <span className="ctf-filter-label"><i className="fa-solid fa-signal"></i> Difficulty:</span>
                {difficulties.map(diff => (
                  <button
                    key={diff}
                    className={`ctf-filter-btn ${filterDifficulty === diff ? 'active' : ''}`}
                    onClick={() => setFilterDifficulty(diff)}
                    style={diff !== 'all' ? { borderColor: DIFFICULTY_CONFIG[diff]?.border } : {}}
                  >
                    {diff === 'all' ? 'All' : DIFFICULTY_CONFIG[diff]?.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Challenge grid */}
            <div className="ctf-grid">
              {filtered.map(challenge => (
                <div key={challenge.id} style={{ position: 'relative' }}>
                  {solveAnimation === challenge.id && (
                    <div className="ctf-solve-burst">
                      <i className="fa-solid fa-check-circle"></i> +{challenge.points} pts!
                    </div>
                  )}
                  <ChallengeCard
                    challenge={challenge}
                    solved={!!progress.solved[challenge.id]}
                    hintsUsed={progress.hintsUsed[challenge.id] || []}
                    onOpen={() => setActiveChallenge(challenge)}
                  />
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-code)' }}>
                  No challenges match the current filters.
                </div>
              )}
            </div>
          </>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {activeTab === 'leaderboard' && (
          <div className="ctf-leaderboard">
            <div style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', textAlign: 'center' }}>
              <i className="fa-solid fa-info-circle" style={{ color: 'var(--secondary-hex)', marginRight: '0.4rem' }}></i>
              Top entries are simulated for demo. Your score is tracked locally.
            </div>
            {leaderboard.map((entry, idx) => {
              const isYou = entry.name.includes('(You)');
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={idx} className={`ctf-leaderboard-row ${isYou ? 'ctf-leaderboard-you' : ''}`}>
                  <span className="ctf-rank">
                    {idx < 3 ? medals[idx] : `#${idx + 1}`}
                  </span>
                  <span className="ctf-lb-name">
                    <i className="fa-solid fa-user-secret" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>
                    {entry.name}
                  </span>
                  <span className="ctf-lb-solved">{entry.solved} solved</span>
                  <span className="ctf-lb-score">
                    <i className="fa-solid fa-star" style={{ color: 'hsl(var(--warning))', marginRight: '0.3rem' }}></i>
                    {entry.score}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── LEARN TAB ── */}
        {activeTab === 'learn' && (
          <div className="ctf-learn">
            {[
              {
                icon: 'fa-lock', title: 'What is Cryptography?',
                content: 'Cryptography is the practice of securing communication by transforming data into an unreadable format. Modern cryptography uses algorithms like AES-256-GCM, RSA-2048, and SHA-256 to protect data in transit and at rest.',
                topics: ['Symmetric Encryption (AES)', 'Asymmetric Encryption (RSA)', 'Hash Functions (SHA-256)', 'Key Derivation (PBKDF2)'],
              },
              {
                icon: 'fa-globe', title: 'Web Security Fundamentals',
                content: 'Web applications face threats like SQL Injection, XSS, CSRF, and authentication bypasses. The OWASP Top 10 defines the most critical web application security risks.',
                topics: ['SQL Injection (SQLi)', 'Cross-Site Scripting (XSS)', 'CSRF Attacks', 'Insecure Direct Object References'],
              },
              {
                icon: 'fa-magnifying-glass-chart', title: 'Digital Forensics Basics',
                content: 'Digital forensics involves recovering, analyzing, and presenting data from digital devices. Key skills include file analysis, metadata extraction, and steganography detection.',
                topics: ['File Signatures (Magic Bytes)', 'EXIF Metadata', 'LSB Steganography', 'Log Analysis'],
              },
              {
                icon: 'fa-code', title: 'Binary & Reverse Engineering',
                content: 'Reverse engineering involves analyzing compiled software to understand its behavior. Binary skills include reading assembly, understanding memory layout, and identifying vulnerabilities.',
                topics: ['ASCII & Encoding', 'Assembly Basics', 'Buffer Overflows', 'CTF Tools: Ghidra, GDB'],
              },
            ].map((topic, i) => (
              <div key={i} className="ctf-learn-card">
                <div className="ctf-learn-icon">
                  <i className={`fa-solid ${topic.icon}`}></i>
                </div>
                <div>
                  <h3 className="ctf-learn-title">{topic.title}</h3>
                  <p className="ctf-learn-desc">{topic.content}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.8rem' }}>
                    {topic.topics.map(t => (
                      <span key={t} className="ctf-topic-pill">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Challenge Modal */}
      {activeChallenge && (
        <ChallengeModal
          challenge={activeChallenge}
          solved={!!progress.solved[activeChallenge.id]}
          hintsUsed={progress.hintsUsed[activeChallenge.id] || []}
          onClose={() => setActiveChallenge(null)}
          onSolve={handleSolve}
          onHint={handleHint}
        />
      )}
    </section>
  );
};

export default CTFLab;
