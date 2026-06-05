import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileQuestion,
  Code2,
  FileText,
  Trophy,
  Activity,
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import Loader from '../components/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [historyItems, setHistoryItems] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({ interview: 0, coding: 0, resume: 0 });
  const [averages, setAverages] = useState({ interview: 0, coding: 0, resume: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Primary call – if this fails, show error (auth issue / server down)
        const statsRes = await axios.get('/api/dashboard/stats');
        setStats(statsRes.data);

        // Secondary calls – each handled independently; failures produce empty arrays
        let intHistory = [], codeHistory = [], resHistory = [];

        try { intHistory = (await axios.get('/api/interviews/history')).data; } catch (_) {}
        try { codeHistory = (await axios.get('/api/challenges/submissions/history')).data; } catch (_) {}
        try { resHistory = (await axios.get('/api/resume/history')).data; } catch (_) {}

        const items = [];
        let totalIntScore = 0, countInt = 0;
        let totalCodeScore = 0, countCode = 0;
        let totalResScore = 0, countRes = 0;

        intHistory.forEach(item => {
          if (item.score !== null) {
            items.push({ type: 'interview', title: `Interview: ${item.question?.slice(0, 15) ?? ''}...`, score: item.score, date: new Date(item.created_at) });
            totalIntScore += item.score; countInt++;
          }
        });
        codeHistory.forEach(item => {
          items.push({ type: 'coding', title: 'Code Submission', score: item.score, date: new Date(item.submitted_at) });
          totalCodeScore += item.score; countCode++;
        });
        resHistory.forEach(item => {
          items.push({ type: 'resume', title: 'Resume Audit', score: item.ats_score, date: new Date(item.uploaded_at) });
          totalResScore += item.ats_score; countRes++;
        });

        items.sort((a, b) => a.date - b.date);
        setHistoryItems(items);
        setCategoryCounts({ interview: countInt, coding: countCode, resume: countRes });
        setAverages({
          interview: countInt ? Math.round(totalIntScore / countInt) : 0,
          coding: countCode ? Math.round(totalCodeScore / countCode) : 0,
          resume: countRes ? Math.round(totalResScore / countRes) : 0,
        });
      } catch (err) {
        console.error('Dashboard stats failed', err);
        setError('Could not load your dashboard. Please ensure the backend is running and you are logged in.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader size="large" />;

  if (error) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: '1rem', textAlign: 'center', padding: '2rem'
    }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AlertCircle size={32} color="var(--danger)" />
      </div>
      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Dashboard Unavailable</h3>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.9rem', lineHeight: 1.6 }}>{error}</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>
        <Sparkles size={16} /><span>Retry</span>
      </button>
    </div>
  );

  // Safely default stats so the page never crashes even if some fields are missing
  const safeStats = {
    total_interviews: stats?.total_interviews ?? 0,
    challenges_completed: stats?.challenges_completed ?? 0,
    average_score: stats?.average_score ?? 0,
    resume_score: stats?.resume_score ?? 0,
    recent_activity: stats?.recent_activity ?? [],
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'interview': return <FileQuestion size={18} color="#3b82f6" />;
      case 'challenge': case 'coding': return <Code2 size={18} color="#10b981" />;
      case 'resume': return <FileText size={18} color="#a855f7" />;
      default: return <Activity size={18} color="#94a3b8" />;
    }
  };

  const getActivityBg = (type) => {
    switch (type) {
      case 'interview': return 'rgba(59, 130, 246, 0.1)';
      case 'coding': case 'challenge': return 'rgba(16, 185, 129, 0.1)';
      case 'resume': return 'rgba(168, 85, 247, 0.1)';
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  };

  // --- CHART 1: LINE CHART ---
  const lineWidth = 500;
  const lineScaleHeight = 150;
  let pointsStr = '';
  if (historyItems.length > 1) {
    pointsStr = historyItems.map((item, idx) => {
      const x = Math.round((idx / (historyItems.length - 1)) * (lineWidth - 40) + 20);
      const y = Math.round(lineScaleHeight - (item.score / 100) * (lineScaleHeight - 20) - 10);
      return `${x},${y}`;
    }).join(' ');
  }

  // --- CHART 2: PIE/DONUT CHART ---
  const pieRadius = 36;
  const pieCircumference = 2 * Math.PI * pieRadius;
  const totalSubmissions = categoryCounts.interview + categoryCounts.coding + categoryCounts.resume;
  const intPct = totalSubmissions ? categoryCounts.interview / totalSubmissions : 0;
  const codePct = totalSubmissions ? categoryCounts.coding / totalSubmissions : 0;
  const resPct = totalSubmissions ? categoryCounts.resume / totalSubmissions : 0;
  const intOffset = pieCircumference;
  const codeOffset = pieCircumference - intPct * pieCircumference;
  const resOffset = codeOffset - codePct * pieCircumference;

  const isEmpty = safeStats.total_interviews === 0 && safeStats.challenges_completed === 0 && safeStats.resume_score === 0;

  return (
    <div className="animated-fade-in">
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Performance <span className="gradient-text">Telemetry</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Granular NLP tracking, coding reviews, and score improvement curves over time</p>
        </div>
      </header>

      {/* Empty State Banner for fresh users */}
      {isEmpty && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.08) 100%)',
          border: '1px solid rgba(139,92,246,0.25)', borderRadius: '16px', padding: '1.5rem 2rem',
          marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.25rem'
        }}>
          <div style={{ fontSize: '2rem' }}>👋</div>
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Welcome! Your journey starts here.</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Complete your first mock interview, coding challenge, or resume scan to see your performance analytics populate here.
            </p>
          </div>
        </div>
      )}

      {/* Stats Summary Cards */}
      <section className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-header">
            <span>Interviews Taken</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <FileQuestion size={20} color="#3b82f6" />
            </div>
          </div>
          <div>
            <div className="stat-value">{safeStats.total_interviews}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mock Recruiter Sessions</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-header">
            <span>Challenges Solved</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Code2 size={20} color="#10b981" />
            </div>
          </div>
          <div>
            <div className="stat-value">{safeStats.challenges_completed}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Algorithms Compiled</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-header">
            <span>Platform Average</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
              <Trophy size={20} color="#8b5cf6" />
            </div>
          </div>
          <div>
            <div className="stat-value">{safeStats.average_score}%</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>Overall Accuracy</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-header">
            <span>Resume ATS Score</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
              <FileText size={20} color="#ec4899" />
            </div>
          </div>
          <div>
            <div className="stat-value">{safeStats.resume_score ? `${safeStats.resume_score}%` : 'N/A'}</div>
            <span style={{ fontSize: '0.8rem', color: safeStats.resume_score ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
              {safeStats.resume_score ? 'ATS Optimised' : 'No Resume Uploaded'}
            </span>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Graph 1: LINE CHART */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={16} color="var(--primary)" />
            <span>Score Improvement Curve</span>
          </h3>
          {historyItems.length < 2 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
              <TrendingUp size={32} style={{ opacity: 0.2 }} />
              <span>Complete at least 2 scored activities to see your improvement curve.</span>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <svg viewBox={`0 0 ${lineWidth} ${lineScaleHeight}`} style={{ overflow: 'visible', width: '100%' }}>
                <line x1="10" y1="10" x2={lineWidth} y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="10" y1="75" x2={lineWidth} y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="10" y1="140" x2={lineWidth} y2="140" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <polyline fill="none" stroke="url(#line-grad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={pointsStr} style={{ filter: 'drop-shadow(0px 4px 8px rgba(139, 92, 246, 0.3))' }} />
                {historyItems.map((item, idx) => {
                  const x = Math.round((idx / (historyItems.length - 1)) * (lineWidth - 40) + 20);
                  const y = Math.round(lineScaleHeight - (item.score / 100) * (lineScaleHeight - 20) - 10);
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="5" fill="var(--bg-dark)" stroke={item.type === 'coding' ? '#10b981' : item.type === 'resume' ? '#a855f7' : '#3b82f6'} strokeWidth="2.5" />
                    </g>
                  );
                })}
                <defs>
                  <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--accent)" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>First ({historyItems[0].score}%)</span>
                <span>Latest ({historyItems[historyItems.length - 1].score}%)</span>
              </div>
            </div>
          )}
        </div>

        {/* Graph 2: PIE CHART */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', width: '100%' }}>
            <PieIcon size={16} color="var(--accent)" />
            <span>Practice Distribution</span>
          </h3>
          {totalSubmissions === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
              <PieIcon size={32} style={{ opacity: 0.2 }} />
              <span>No practice logs yet.</span>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', width: '100%' }}>
              <svg viewBox="0 0 100 100" style={{ width: '120px', height: '120px' }}>
                {intPct > 0 && <circle cx="50" cy="50" r={pieRadius} fill="transparent" stroke="#3b82f6" strokeWidth="10" strokeDasharray={`${intPct * pieCircumference} ${pieCircumference}`} strokeDashoffset={intOffset} transform="rotate(-90 50 50)" />}
                {codePct > 0 && <circle cx="50" cy="50" r={pieRadius} fill="transparent" stroke="#10b981" strokeWidth="10" strokeDasharray={`${codePct * pieCircumference} ${pieCircumference}`} strokeDashoffset={codeOffset} transform="rotate(-90 50 50)" />}
                {resPct > 0 && <circle cx="50" cy="50" r={pieRadius} fill="transparent" stroke="#a855f7" strokeWidth="10" strokeDasharray={`${resPct * pieCircumference} ${pieCircumference}`} strokeDashoffset={resOffset} transform="rotate(-90 50 50)" />}
                <circle cx="50" cy="50" r="28" fill="var(--bg-dark)" />
                <text x="50" y="54" textAnchor="middle" fill="var(--text-main)" fontSize="10" fontWeight="bold">{totalSubmissions}</text>
              </svg>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} /> Interview ({categoryCounts.interview})</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Code ({categoryCounts.coding})</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} /> Resume ({categoryCounts.resume})</span>
              </div>
            </div>
          )}
        </div>

        {/* Graph 3: BAR CHART */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <BarChart2 size={16} color="var(--success)" />
            <span>Category Averages</span>
          </h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
            {[
              { label: 'Mock Interviews', value: averages.interview, color: '#3b82f6' },
              { label: 'Coding Challenges', value: averages.coding, color: '#10b981' },
              { label: 'ATS Resume Scanner', value: averages.resume, color: '#a855f7' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 'bold' }}>{value > 0 ? `${value}%` : '—'}</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${value}%`, backgroundColor: color, borderRadius: '4px', transition: 'width 1s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Log */}
      <section className="glass-card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} color="var(--primary)" />
          <span>Recent Performance Activities</span>
        </h3>
        {safeStats.recent_activity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <Activity size={36} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '0.9rem' }}>No activity yet. Start practicing to see your history here!</p>
          </div>
        ) : (
          <div className="activity-list">
            {safeStats.recent_activity.map((activity, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-info">
                  <div className="activity-icon-badge" style={{ backgroundColor: getActivityBg(activity.type) }}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <h4 className="activity-title">{activity.title}</h4>
                    <p className="activity-date">
                      {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {activity.score !== null && (
                  <div className="activity-score-badge" style={{
                    backgroundColor: activity.score >= 80 ? 'rgba(16,185,129,0.1)' : activity.score >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                    color: activity.score >= 80 ? '#10b981' : activity.score >= 60 ? '#f59e0b' : '#ef4444'
                  }}>
                    {activity.score}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
