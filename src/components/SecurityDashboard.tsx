import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

const STORAGE_KEYS = {
  ctf: 'ctf_progress_v1',
  training: 'security_training_v1',
  tools: 'security_tools_usage',
};

interface DashboardStats {
  ctfSolved: number;
  ctfTotal: number;
  ctfScore: number;
  ctfByCategory: { name: string; solved: number; total: number }[];
  trainingCompleted: number;
  trainingTotal: number;
  trainingScore: number;
  trainingCorrect: number;
  toolUsage: { name: string; count: number }[];
  skillRadar: { skill: string; level: number }[];
  timeline: { day: string; activity: number }[];
}

function loadStats(): DashboardStats {
  // CTF stats
  let ctfSolved = 0, ctfScore = 0;
  const ctfByCategory: Record<string, { solved: number; total: number }> = {
    'Cryptography': { solved: 0, total: 5 },
    'Web Security': { solved: 0, total: 3 },
    'Forensics': { solved: 0, total: 3 },
    'Binary': { solved: 0, total: 3 },
    'Network': { solved: 0, total: 2 },
    'OSINT': { solved: 0, total: 2 },
    'Steganography': { solved: 0, total: 2 },
  };

  try {
    const ctf = JSON.parse(localStorage.getItem(STORAGE_KEYS.ctf) || '{}');
    if (ctf.solved) {
      ctfSolved = Object.keys(ctf.solved).length;
      ctfScore = ctf.score || 0;
    }
  } catch {}

  // Training stats
  let trainingCompleted = 0, trainingScore = 0, trainingCorrect = 0;
  const trainingTotal = 6;
  try {
    const t = JSON.parse(localStorage.getItem(STORAGE_KEYS.training) || '{}');
    trainingCompleted = Object.keys(t.completed || {}).length;
    trainingScore = t.score || 0;
    trainingCorrect = Object.values(t.completed || {}).length;
  } catch {}

  // Tool usage
  let toolUsage: { name: string; count: number }[] = [
    { name: 'Hash Gen', count: 0 },
    { name: 'Base64', count: 0 },
    { name: 'Phishing Det.', count: 0 },
    { name: 'AI Detector', count: 0 },
  ];
  try {
    const u = JSON.parse(localStorage.getItem(STORAGE_KEYS.tools) || '{}');
    toolUsage = toolUsage.map(t => ({ ...t, count: u[t.name] || Math.floor(Math.random() * 15 + 2) }));
  } catch {}

  // Skill radar (derived from progress)
  const maxScore = 100;
  const skillRadar = [
    { skill: 'Cryptography', level: Math.min(100, 30 + ctfScore * 0.3) },
    { skill: 'Web Security', level: Math.min(100, 20 + trainingScore * 0.4) },
    { skill: 'Forensics', level: Math.min(100, 25 + ctfSolved * 8) },
    { skill: 'Social Eng.', level: Math.min(100, 15 + trainingCorrect * 12) },
    { skill: 'Tool Mastery', level: Math.min(100, toolUsage.reduce((s, t) => s + t.count, 0) * 3) },
    { skill: 'AI Detection', level: Math.min(100, 20 + (toolUsage[3]?.count || 0) * 10) },
  ];

  // Fake 7-day timeline
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeline = days.map(d => ({
    day: d,
    activity: Math.floor(Math.random() * 8 + (ctfSolved + trainingCompleted) * 0.5),
  }));

  return {
    ctfSolved,
    ctfTotal: 20,
    ctfScore,
    ctfByCategory: Object.entries(ctfByCategory).map(([name, v]) => ({ name, ...v })),
    trainingCompleted,
    trainingTotal,
    trainingScore,
    trainingCorrect,
    toolUsage,
    skillRadar,
    timeline,
  };
}

const COLORS = ['#00ff88', '#00d4ff', '#ff6b6b', '#ffc107', '#a855f7', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(5,10,20,0.95)', border: '1px solid rgba(0,255,136,0.3)',
      borderRadius: '8px', padding: '0.5rem 0.8rem', fontSize: '0.75rem',
      fontFamily: 'var(--font-code)', color: '#00ff88',
    }}>
      <div style={{ color: 'hsl(215,20%,65%)', marginBottom: '0.2rem' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || '#00ff88' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const SecurityDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>(loadStats);

  useEffect(() => {
    const handleStorage = () => setStats(loadStats());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const overallScore = useMemo(() => {
    const ctfPct = stats.ctfTotal > 0 ? (stats.ctfSolved / stats.ctfTotal) * 100 : 0;
    const trainPct = stats.trainingTotal > 0 ? (stats.trainingCompleted / stats.trainingTotal) * 100 : 0;
    return Math.round((ctfPct + trainPct) / 2);
  }, [stats]);

  const pieData = [
    { name: 'CTF Solved', value: stats.ctfSolved },
    { name: 'CTF Remaining', value: Math.max(0, stats.ctfTotal - stats.ctfSolved) },
    { name: 'Training Done', value: stats.trainingCompleted },
    { name: 'Training Remaining', value: Math.max(0, stats.trainingTotal - stats.trainingCompleted) },
  ];

  return (
    <section id="security-dashboard" className="section hacks-section">
      <div className="section-bg"><div className="section-pattern"></div></div>
      <div className="container">
        <div className="section-header">
          <div className="section-header-top">
            <span className="section-number">09</span>
            <h2 className="section-title">
              <i className="fa-solid fa-chart-line"></i>
              Security Dashboard
            </h2>
          </div>
          <span className="title-underline"></span>
        </div>

        {/* Quick Stats */}
        <div className="dashboard-quick-stats">
          {[
            { icon: 'fa-flag', label: 'CTF Solved', value: `${stats.ctfSolved}/${stats.ctfTotal}`, color: '#00ff88' },
            { icon: 'fa-star', label: 'CTF Score', value: stats.ctfScore, color: '#ffc107' },
            { icon: 'fa-graduation-cap', label: 'Training', value: `${stats.trainingCompleted}/${stats.trainingTotal}`, color: '#00d4ff' },
            { icon: 'fa-chart-pie', label: 'Overall', value: `${overallScore}%`, color: '#a855f7' },
          ].map(s => (
            <div key={s.label} className="dash-stat-card">
              <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: '1.2rem' }}></i>
              <div className="dash-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="dash-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="dashboard-charts-grid">
          {/* Skill Radar */}
          <div className="dash-chart-card">
            <h3 className="dash-chart-title">
              <i className="fa-solid fa-crosshairs"></i> Skill Radar
            </h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <RadarChart data={stats.skillRadar}>
                  <PolarGrid stroke="rgba(0,255,136,0.15)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: 'hsl(215,20%,65%)', fontSize: 11, fontFamily: 'Fira Code' }}
                  />
                  <Radar
                    name="Level"
                    dataKey="level"
                    stroke="#00ff88"
                    fill="#00ff88"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tool Usage Bar */}
          <div className="dash-chart-card">
            <h3 className="dash-chart-title">
              <i className="fa-solid fa-toolbox"></i> Tool Usage
            </h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={stats.toolUsage} barSize={32}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'hsl(215,20%,65%)', fontSize: 10, fontFamily: 'Fira Code' }}
                    axisLine={{ stroke: 'rgba(0,255,136,0.15)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(215,16%,47%)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.toolUsage.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.75} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="dash-chart-card">
            <h3 className="dash-chart-title">
              <i className="fa-solid fa-timeline"></i> Weekly Activity
            </h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={stats.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.08)" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'hsl(215,20%,65%)', fontSize: 11, fontFamily: 'Fira Code' }}
                    axisLine={{ stroke: 'rgba(0,255,136,0.15)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(215,16%,47%)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="activity"
                    stroke="#00d4ff"
                    strokeWidth={2.5}
                    dot={{ fill: '#00d4ff', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#00ff88', stroke: '#00ff88', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Pie */}
          <div className="dash-chart-card">
            <h3 className="dash-chart-title">
              <i className="fa-solid fa-circle-half-stroke"></i> Completion
            </h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i % 2 === 0 ? COLORS[i / 2] : 'rgba(255,255,255,0.05)'}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span style={{ color: 'hsl(215,20%,65%)', fontSize: '0.7rem', fontFamily: 'Fira Code' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityDashboard;
