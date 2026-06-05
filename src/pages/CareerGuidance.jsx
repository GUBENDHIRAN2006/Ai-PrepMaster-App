import React, { useState } from 'react';
import axios from 'axios';
import {
  Briefcase, Sparkles, Plus, X, Star, Building2,
  ChevronRight, Loader2, AlertTriangle, GraduationCap,
  Lightbulb, CheckCircle2, TrendingUp
} from 'lucide-react';

const EXPERIENCE_OPTIONS = ['Fresher (0 years)', '1-2 years', '3-5 years', '5-8 years', '8+ years'];
const SKILL_SUGGESTIONS = ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Java', 'Machine Learning', 'Docker', 'AWS', 'TypeScript', 'Django', 'FastAPI', 'C++', 'Data Analysis', 'MongoDB', 'Kubernetes'];

const MatchBar = ({ score }) => {
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#3b82f6';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: '3px', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color, minWidth: '36px', textAlign: 'right' }}>{score}%</span>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    {[80, 50, 100, 60, 90].map((w, i) => (
      <div key={i} style={{ height: i === 0 ? '20px' : '12px', width: `${w}%`, borderRadius: '6px', background: 'rgba(255,255,255,0.06)', animation: 'shimmer 1.5s infinite' }} />
    ))}
    <style>{`@keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
  </div>
);

const CareerGuidance = () => {
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [education, setEducation] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.find(s => s.toLowerCase() === trimmed.toLowerCase()) && skills.length < 12) {
      setSkills(prev => [...prev, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => setSkills(prev => prev.filter(s => s !== skill));

  const handleSkillKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!experience) { setError('Please select your experience level.'); return; }
    if (skills.length === 0) { setError('Please add at least one skill.'); return; }
    if (!education.trim()) { setError('Please enter your education background.'); return; }

    setLoading(true);
    try {
      const res = await axios.post('/api/career/recommend', { experience, skills, education, interests });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const industryColors = {
    'Technology': '#3b82f6',
    'Artificial Intelligence': '#8b5cf6',
    'AI Research': '#7c3aed',
    'AI Tools': '#a855f7',
    'FinTech': '#10b981',
    'E-Commerce': '#f59e0b',
    'Data & AI': '#06b6d4',
    'Cloud Data Warehousing': '#06b6d4',
    'Developer Tools': '#ec4899',
    'Social Media / Technology': '#3b82f6',
    'Streaming / Entertainment': '#ef4444',
    'Travel & Hospitality': '#f97316',
    'Productivity Software': '#84cc16',
    'IT Services': '#6366f1',
    'IT Consulting': '#6366f1',
    'Cloud & E-Commerce': '#f59e0b',
    'Cloud & Productivity': '#0ea5e9',
    'Data Analytics': '#06b6d4',
  };

  return (
    <div className="animated-fade-in">
      {/* Header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}>
            <Briefcase size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.1rem' }}>
              Career <span className="gradient-text">Guidance</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              AI-powered job & company recommendations tailored to your profile
            </p>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.6fr' : '1fr', gap: '2rem', alignItems: 'start' }}>

        {/* === INPUT FORM === */}
        <div className="glass-card" style={{ position: 'sticky', top: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="var(--primary)" />
            Your Profile
          </h2>

          {error && (
            <div style={{
              display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem',
              color: '#fca5a5', fontSize: '0.875rem', animation: 'fadeSlide 0.3s ease'
            }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Experience */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                Experience Level *
              </label>
              <select
                value={experience}
                onChange={e => setExperience(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
                  background: 'rgba(15,23,42,0.6)', border: `1px solid ${!experience && error ? 'var(--danger)' : 'var(--border-color)'}`,
                  color: experience ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.95rem',
                  outline: 'none', cursor: 'pointer', boxSizing: 'border-box'
                }}
              >
                <option value="" disabled>Select experience level…</option>
                {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Skills */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                Known Skills * <span style={{ fontWeight: 400, fontSize: '0.75rem' }}>(press Enter or comma to add)</span>
              </label>
              {/* Tag chips */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem',
                minHeight: skills.length ? 'auto' : '0'
              }}>
                {skills.map(skill => (
                  <span key={skill} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: '20px', padding: '0.25rem 0.65rem', fontSize: '0.8rem',
                    color: '#c084fc', fontWeight: 600
                  }}>
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c084fc', padding: 0, display: 'flex', alignItems: 'center' }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter…"
                style={{
                  width: '100%', padding: '0.65rem 1rem', borderRadius: '10px',
                  background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                }}
              />
              {/* Quick-add suggestions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.6rem' }}>
                {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
                  <button
                    key={s} type="button" onClick={() => addSkill(s)}
                    style={{
                      fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem'
                    }}
                  >
                    <Plus size={10} />{s}
                  </button>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <GraduationCap size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Education *
              </label>
              <input
                type="text"
                value={education}
                onChange={e => setEducation(e.target.value)}
                placeholder="e.g. B.Tech Computer Science, MBA, Self-taught…"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
                  background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Interests */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <Lightbulb size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Interests / Preferred Industries <span style={{ fontWeight: 400, fontSize: '0.75rem' }}>(optional)</span>
              </label>
              <textarea
                value={interests}
                onChange={e => setInterests(e.target.value)}
                placeholder="e.g. FinTech, AI startups, SaaS products, gaming…"
                rows={2}
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
                  background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none',
                  resize: 'vertical', minHeight: '64px', boxSizing: 'border-box', fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', opacity: loading ? 0.85 : 1 }}
              disabled={loading}
            >
              {loading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /><span>Analysing your profile…</span></>
                : <><Sparkles size={18} /><span>Get AI Recommendations</span></>
              }
            </button>
          </form>
        </div>

        {/* === RESULTS === */}
        {(loading || result) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Summary Card */}
            {loading ? (
              <SkeletonCard />
            ) : result?.summary && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.08) 100%)',
                border: '1px solid rgba(16,185,129,0.25)', borderRadius: '16px', padding: '1.25rem 1.5rem',
                display: 'flex', gap: '1rem', alignItems: 'flex-start', animation: 'fadeSlide 0.5s ease'
              }}>
                <TrendingUp size={22} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', color: '#10b981' }}>Career Outlook</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>{result.summary}</p>
                </div>
              </div>
            )}

            {/* Recommendation Cards */}
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={16} color="var(--accent)" />
                {loading ? 'Generating Recommendations…' : `${result?.recommendations?.length || 0} Matched Opportunities`}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                  : result?.recommendations?.map((rec, idx) => {
                      const indColor = industryColors[rec.industry] || '#8b5cf6';
                      return (
                        <div
                          key={idx}
                          className="glass-card"
                          style={{
                            padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                            borderLeft: `3px solid ${indColor}`,
                            animation: `fadeSlide 0.4s ease ${idx * 0.08}s both`
                          }}
                        >
                          {/* Header row */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{rec.company}</h3>
                                <span style={{
                                  fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                                  borderRadius: '20px', background: `${indColor}20`, color: indColor, border: `1px solid ${indColor}40`
                                }}>{rec.industry}</span>
                              </div>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>{rec.role}</p>
                            </div>
                            <div style={{ textAlign: 'center', flexShrink: 0 }}>
                              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: rec.match_score >= 85 ? '#10b981' : rec.match_score >= 70 ? '#f59e0b' : '#3b82f6' }}>
                                {rec.match_score}%
                              </div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>MATCH</div>
                            </div>
                          </div>

                          {/* Match bar */}
                          <MatchBar score={rec.match_score} />

                          {/* Reason */}
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', margin: 0 }}>
                            {rec.reason}
                          </p>

                          {/* Skills needed */}
                          <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                              <CheckCircle2 size={11} style={{ display: 'inline', marginRight: '4px' }} />
                              Skills to Strengthen
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {rec.skills_needed.map(skill => (
                                <span key={skill} style={{
                                  fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px',
                                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                                  color: 'var(--text-muted)', fontWeight: 600
                                }}>{skill}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                }
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no result yet */}
        {!loading && !result && (
          <div style={{ display: 'none' }} /> // Hidden - grid is single column when no result
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default CareerGuidance;
