import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Upload, Sparkles, AlertCircle, History, Award, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import Loader from '../components/Loader';

const ResumeUpload = () => {
  const [targetRole, setTargetRole] = useState('Python Developer');
  const [file, setFile] = useState(null);
  
  const [scanning, setScanning] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/resume/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching resume history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please upload a PDF resume file first.');
      return;
    }

    setScanning(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_role', targetRole);

    try {
      const res = await axios.post('/api/resume/analyze-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Parse JSON lists for skills
      let found = [];
      let missing = [];
      try {
        found = JSON.parse(res.data.skills_found || '[]');
        missing = JSON.parse(res.data.missing_skills || '[]');
      } catch (e) {
        console.error('Failed parsing skills arrays', e);
      }

      setFeedback({
        score: res.data.ats_score,
        content: res.data.feedback,
        filename: file.name,
        skillsFound: found,
        missingSkills: missing
      });

      fetchHistory(); // Refresh history list
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to scan PDF resume. Make sure it is a valid text-based PDF document.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="animated-fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Resume <span className="gradient-text">Optimizer</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Scan your PDF resume against ATS parameters and customize for keyword hits</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left column: Upload & feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <form onSubmit={handleScan} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>ATS Scan Configuration</h3>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Target Role Profile</label>
              <select className="input-field select-field" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
                <option value="Python Developer">Python Developer Focus</option>
                <option value="Full Stack Developer">Full Stack Developer Focus</option>
                <option value="AI/ML Engineer">AI/ML Engineer Focus</option>
                <option value="Data Analyst">Data Analyst Focus</option>
                <option value="Frontend Developer">Frontend Developer Focus</option>
                <option value="Backend Developer">Backend Developer Focus</option>
              </select>
            </div>

            <div style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '2.5rem',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }} onClick={() => document.getElementById('pdf-picker').click()}>
              <input
                type="file"
                id="pdf-picker"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Upload size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                {file ? file.name : 'Choose PDF Resume'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Only text-accessible PDF files are supported up to 5MB</p>
            </div>

            <button type="submit" className="btn btn-accent" disabled={scanning} style={{ alignSelf: 'flex-end' }}>
              {scanning ? (
                <>AI Parsing PDF & Evaluating...</>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Scan Resume Compatibility</span>
                </>
              )}
            </button>
          </form>

          {/* Scanned Report */}
          {feedback && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: feedback.score >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: feedback.score >= 80 ? '#10b981' : '#f59e0b',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem'
                }}>
                  {feedback.score}%
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>ATS Compatibility Report</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>File: {feedback.filename} | Target: {targetRole}</p>
                </div>
              </div>

              {/* Skills distribution visual grids */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.75rem' }}>
                    <CheckCircle size={14} />
                    <span>Skills Found ({feedback.skillsFound.length})</span>
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {feedback.skillsFound.length === 0 ? <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None detected</span> :
                      feedback.skillsFound.map((s, idx) => (
                        <span key={idx} className="question-status-pill" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.7rem' }}>
                          {s.toUpperCase()}
                        </span>
                      ))
                    }
                  </div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.75rem' }}>
                    <XCircle size={14} />
                    <span>Missing Skills ({feedback.missingSkills.length})</span>
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {feedback.missingSkills.length === 0 ? <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None! Perfect alignment</span> :
                      feedback.missingSkills.map((s, idx) => (
                        <span key={idx} className="question-status-pill" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.7rem' }}>
                          {s.toUpperCase()}
                        </span>
                      ))
                    }
                  </div>
                </div>
              </div>

              {/* Suggestions text markup */}
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.6', color: '#c7d5e6', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                {feedback.content}
              </div>
            </div>
          )}
        </div>

        {/* Right column: history list */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <History size={16} color="var(--primary)" />
            <span>Scanning History</span>
          </h3>
          {loadingHistory ? (
            <Loader size="small" />
          ) : history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>No resumes scanned yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map((h) => {
                const name = h.resume_path.split('/').pop().slice(13) || 'Resume.pdf'; // truncate prefix timestamp
                return (
                  <div key={h.id} style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem', flex: 1 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{name}</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(h.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: h.ats_score >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: h.ats_score >= 80 ? '#10b981' : '#f59e0b'
                    }}>
                      {h.ats_score}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
