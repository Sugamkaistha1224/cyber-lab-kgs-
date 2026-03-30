import { useState, useRef, useCallback } from 'react';
import { hashSHA256 } from '@/utils/crypto';

interface AttackResult {
  attempt: number;
  guess: string;
  hashMatch: boolean;
}

const DICTIONARY = [
  'password', '123456', 'qwerty', 'admin', 'letmein', 'welcome', 'monkey',
  'dragon', 'master', 'login', 'abc123', 'hello', 'shadow', 'sunshine',
  'trustno1', 'iloveyou', 'football', 'superman', 'starwars', 'access',
  'batman', 'michael', 'ninja', 'mustang', 'passw0rd', 'solo', 'princess',
  'hottie', 'loveme', 'charlie', 'test', 'guest', 'changeme', 'donald',
];

const CryptoAttackModule = () => {
  const [targetPassword, setTargetPassword] = useState('');
  const [attackType, setAttackType] = useState<'brute' | 'dictionary'>('dictionary');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AttackResult[]>([]);
  const [found, setFound] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const cancelRef = useRef(false);

  const runDictionaryAttack = useCallback(async () => {
    if (!targetPassword.trim()) return;
    setIsRunning(true); setFound(false); setResults([]); setTotalAttempts(0); setElapsedTime(0);
    cancelRef.current = false;
    const startTime = Date.now();
    const targetHash = await hashSHA256(targetPassword);
    const newResults: AttackResult[] = [];

    for (let i = 0; i < DICTIONARY.length; i++) {
      if (cancelRef.current) break;
      const guess = DICTIONARY[i];
      const guessHash = await hashSHA256(guess);
      const match = guessHash === targetHash;
      newResults.push({ attempt: i + 1, guess, hashMatch: match });
      setResults([...newResults]);
      setTotalAttempts(i + 1);
      setElapsedTime(Date.now() - startTime);

      if (match) { setFound(true); setIsRunning(false); return; }
      // Small delay for visual feedback
      await new Promise(r => setTimeout(r, 80));
    }
    setIsRunning(false);
  }, [targetPassword]);

  const runBruteForce = useCallback(async () => {
    if (!targetPassword.trim()) return;
    setIsRunning(true); setFound(false); setResults([]); setTotalAttempts(0); setElapsedTime(0);
    cancelRef.current = false;
    const startTime = Date.now();
    const targetHash = await hashSHA256(targetPassword);
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const maxLen = Math.min(targetPassword.length, 4); // Cap at 4 chars for demo
    const newResults: AttackResult[] = [];
    let attempts = 0;

    const tryGuess = async (prefix: string, depth: number): Promise<boolean> => {
      if (cancelRef.current) return false;
      if (depth === 0) {
        attempts++;
        const guessHash = await hashSHA256(prefix);
        const match = guessHash === targetHash;
        if (attempts % 50 === 0 || match) {
          newResults.push({ attempt: attempts, guess: prefix, hashMatch: match });
          if (newResults.length > 100) newResults.shift();
          setResults([...newResults]);
          setTotalAttempts(attempts);
          setElapsedTime(Date.now() - startTime);
          await new Promise(r => setTimeout(r, 1));
        }
        if (match) { setFound(true); return true; }
        return false;
      }
      for (let i = 0; i < charset.length; i++) {
        if (cancelRef.current) return false;
        if (await tryGuess(prefix + charset[i], depth - 1)) return true;
        if (attempts > 5000) {
          cancelRef.current = true;
          setResults(prev => [...prev, { attempt: attempts, guess: '...max attempts reached', hashMatch: false }]);
          return false;
        }
      }
      return false;
    };

    for (let len = 1; len <= maxLen; len++) {
      if (cancelRef.current) break;
      if (await tryGuess('', len)) break;
    }
    setIsRunning(false);
  }, [targetPassword]);

  const handleStop = () => { cancelRef.current = true; };

  return (
    <div className="crypto-lab-container">
      <div className="crypto-buttons" style={{ marginBottom: '1rem' }}>
        <button className={`crypto-btn ${attackType === 'dictionary' ? '' : 'crypto-btn-secondary'}`} onClick={() => setAttackType('dictionary')}>
          <i className="fa-solid fa-book"></i> Dictionary Attack
        </button>
        <button className={`crypto-btn ${attackType === 'brute' ? '' : 'crypto-btn-secondary'}`} onClick={() => setAttackType('brute')}>
          <i className="fa-solid fa-hammer"></i> Brute Force
        </button>
      </div>

      <div className="crypto-input-group">
        <label>Target Password (set a password to crack)</label>
        <input type="text" className="crypto-input" placeholder={attackType === 'dictionary' ? 'Try "password" or "admin"...' : 'Try a 3-4 char password like "abc"...'} value={targetPassword} onChange={(e) => setTargetPassword(e.target.value)} />
      </div>

      <div className="crypto-buttons">
        {!isRunning ? (
          <button className="crypto-btn" onClick={attackType === 'dictionary' ? runDictionaryAttack : runBruteForce} disabled={!targetPassword.trim()}>
            <i className="fa-solid fa-crosshairs"></i> Launch {attackType === 'dictionary' ? 'Dictionary' : 'Brute Force'} Attack
          </button>
        ) : (
          <button className="crypto-btn" onClick={handleStop} style={{ background: 'hsl(var(--danger))' }}>
            <i className="fa-solid fa-stop"></i> Stop Attack
          </button>
        )}
      </div>

      {/* Stats */}
      {totalAttempts > 0 && (
        <div className="hash-comparison">
          <div className="hash-box">
            <h4>Attempts</h4>
            <code>{totalAttempts.toLocaleString()}</code>
          </div>
          <div className="hash-box">
            <h4>Time Elapsed</h4>
            <code>{(elapsedTime / 1000).toFixed(2)}s</code>
          </div>
        </div>
      )}

      {/* Results feed */}
      {results.length > 0 && (
        <div style={{
          maxHeight: '200px', overflow: 'auto', background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px', padding: '1rem', fontFamily: 'var(--font-code)', fontSize: '0.75rem',
          border: '1px solid hsl(var(--border))', marginTop: '1rem',
        }}>
          {results.slice(-20).map((r, i) => (
            <div key={i} style={{ color: r.hashMatch ? 'var(--primary-hex)' : 'hsl(var(--text-muted))', marginBottom: '0.2rem' }}>
              [{String(r.attempt).padStart(4, '0')}] "{r.guess}" → {r.hashMatch ? '✓ MATCH FOUND!' : '✗ No match'}
            </div>
          ))}
        </div>
      )}

      {found && (
        <div className="crypto-status error" style={{ marginTop: '1rem' }}>
          <i className="fa-solid fa-skull-crossbones"></i>
          Password CRACKED in {totalAttempts} attempts ({(elapsedTime / 1000).toFixed(2)}s)! This demonstrates why strong passwords matter.
        </div>
      )}

      {!isRunning && totalAttempts > 0 && !found && (
        <div className="crypto-status success" style={{ marginTop: '1rem' }}>
          <i className="fa-solid fa-shield-halved"></i>
          Attack FAILED after {totalAttempts} attempts. Strong passwords resist {attackType} attacks!
        </div>
      )}

      {/* Educational note */}
      <div style={{
        marginTop: '1rem', padding: '1rem', background: 'rgba(0,212,255,0.05)',
        border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px',
        fontSize: '0.8rem', color: 'hsl(var(--text-secondary))',
      }}>
        <i className="fa-solid fa-info-circle" style={{ color: 'var(--secondary-hex)', marginRight: '0.5rem' }}></i>
        <strong>Educational Purpose:</strong> This simulator demonstrates why weak passwords fail.
        {attackType === 'dictionary' ? ' Dictionary attacks test common passwords.' : ' Brute force tries all combinations (limited to 4 chars for demo).'}
      </div>
    </div>
  );
};

export default CryptoAttackModule;
