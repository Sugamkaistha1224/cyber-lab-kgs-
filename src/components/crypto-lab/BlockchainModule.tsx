import { useState, useEffect } from 'react';
import { createGenesisBlock, createBlock, validateChain, tamperBlock, type Block } from '@/utils/blockchain';

const BlockchainModule = () => {
  const [chain, setChain] = useState<Block[]>([]);
  const [newBlockData, setNewBlockData] = useState('');
  const [tamperIndex, setTamperIndex] = useState<number | null>(null);
  const [tamperData, setTamperData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chainValid, setChainValid] = useState(true);

  // Create genesis block on mount
  useEffect(() => {
    (async () => {
      const genesis = await createGenesisBlock();
      setChain([genesis]);
    })();
  }, []);

  const handleAddBlock = async () => {
    if (!newBlockData.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const block = await createBlock(chain, newBlockData);
      const newChain = [...chain, block];
      const validated = await validateChain(newChain);
      setChain(validated);
      setChainValid(validated.every(b => b.isValid));
      setNewBlockData('');
    } catch (err) {
      console.error('Failed to add block:', err);
    } finally { setIsLoading(false); }
  };

  const handleTamper = async () => {
    if (tamperIndex === null || !tamperData.trim()) return;
    setIsLoading(true);
    try {
      const tampered = tamperBlock(chain, tamperIndex, tamperData);
      const validated = await validateChain(tampered);
      setChain(validated);
      setChainValid(validated.every(b => b.isValid));
      setTamperIndex(null);
      setTamperData('');
    } catch (err) {
      console.error(err);
    } finally { setIsLoading(false); }
  };

  const handleReset = async () => {
    const genesis = await createGenesisBlock();
    setChain([genesis]);
    setChainValid(true);
    setTamperIndex(null);
  };

  return (
    <div className="crypto-lab-container">
      {/* Chain status */}
      <div style={{
        padding: '1rem', marginBottom: '1rem', borderRadius: '8px',
        background: chainValid ? 'rgba(0,255,136,0.05)' : 'rgba(255,68,68,0.08)',
        border: `2px solid ${chainValid ? 'var(--primary-hex)' : 'hsl(var(--danger))'}`,
        display: 'flex', alignItems: 'center', gap: '0.8rem',
        fontFamily: 'var(--font-tech)', fontSize: '0.85rem',
      }}>
        <i className={`fa-solid ${chainValid ? 'fa-link' : 'fa-link-slash'}`} style={{ color: chainValid ? 'var(--primary-hex)' : 'hsl(var(--danger))', fontSize: '1.2rem' }}></i>
        <span style={{ color: chainValid ? 'var(--primary-hex)' : 'hsl(var(--danger))' }}>
          Chain: {chainValid ? 'VALID ✓' : 'BROKEN ✗'} — {chain.length} blocks
        </span>
      </div>

      {/* Add block */}
      <div className="crypto-input-group">
        <label>Block Data</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="text" className="crypto-input" placeholder="Enter block data..." value={newBlockData} onChange={(e) => setNewBlockData(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBlock()} style={{ flex: 1 }}
          />
          <button className="crypto-btn" onClick={handleAddBlock} disabled={isLoading || !newBlockData.trim()} style={{ whiteSpace: 'nowrap' }}>
            <i className="fa-solid fa-plus"></i> Add Block
          </button>
        </div>
      </div>

      {/* Block chain visual */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
        {chain.map((block, i) => (
          <div key={`${block.index}-${i}`}>
            <div style={{
              padding: '1rem', borderRadius: '10px',
              background: block.isValid ? 'rgba(0,0,0,0.25)' : 'rgba(255,68,68,0.08)',
              border: `1px solid ${block.isValid ? 'hsl(var(--border))' : 'hsl(var(--danger))'}`,
              transition: 'all 0.3s ease', position: 'relative',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.8rem', color: block.isValid ? 'var(--primary-hex)' : 'hsl(var(--danger))' }}>
                  Block #{block.index} {!block.isValid && '⚠️ TAMPERED'}
                </span>
                {i > 0 && (
                  <button onClick={() => { setTamperIndex(i); setTamperData(block.data); }}
                    style={{
                      background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
                      color: 'hsl(var(--danger))', padding: '0.2rem 0.6rem', borderRadius: '4px',
                      fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'var(--font-code)',
                    }}>
                    Tamper
                  </button>
                )}
              </div>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.8' }}>
                <div><span style={{ color: 'hsl(var(--text-muted))' }}>Data:</span> {block.data}</div>
                <div style={{ wordBreak: 'break-all' }}><span style={{ color: 'hsl(var(--text-muted))' }}>Hash:</span> {block.hash.substring(0, 32)}...</div>
                <div style={{ wordBreak: 'break-all' }}><span style={{ color: 'hsl(var(--text-muted))' }}>Prev:</span> {block.previousHash.substring(0, 32)}...</div>
              </div>
            </div>
            {i < chain.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.2rem 0' }}>
                <i className="fa-solid fa-arrow-down" style={{ color: chain[i + 1]?.isValid ? 'var(--primary-hex)' : 'hsl(var(--danger))', fontSize: '0.8rem' }}></i>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tamper modal */}
      {tamperIndex !== null && (
        <div style={{
          marginTop: '1rem', padding: '1rem', background: 'rgba(255,68,68,0.05)',
          border: '1px solid hsl(var(--danger))', borderRadius: '8px',
        }}>
          <h4 style={{ fontFamily: 'var(--font-tech)', fontSize: '0.85rem', color: 'hsl(var(--danger))', marginBottom: '0.5rem' }}>
            Tamper Block #{tamperIndex}
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" className="crypto-input" placeholder="New data..." value={tamperData} onChange={(e) => setTamperData(e.target.value)} style={{ flex: 1 }} />
            <button className="crypto-btn" onClick={handleTamper} style={{ background: 'hsl(var(--danger))', whiteSpace: 'nowrap' }}>
              <i className="fa-solid fa-skull"></i> Tamper
            </button>
            <button className="crypto-btn crypto-btn-secondary" onClick={() => setTamperIndex(null)} style={{ whiteSpace: 'nowrap' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="crypto-buttons" style={{ marginTop: '1rem' }}>
        <button className="crypto-btn crypto-btn-secondary" onClick={handleReset}>
          <i className="fa-solid fa-rotate-left"></i> Reset Chain
        </button>
      </div>

      {/* Educational note */}
      <div style={{
        marginTop: '1rem', padding: '1rem', background: 'rgba(0,212,255,0.05)',
        border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px',
        fontSize: '0.8rem', color: 'hsl(var(--text-secondary))',
      }}>
        <i className="fa-solid fa-info-circle" style={{ color: 'var(--secondary-hex)', marginRight: '0.5rem' }}></i>
        <strong>Blockchain Demo:</strong> Each block contains the previous block's hash.
        Tampering with any block breaks the chain — all subsequent blocks become invalid.
        This is the core principle behind blockchain integrity.
      </div>
    </div>
  );
};

export default BlockchainModule;
