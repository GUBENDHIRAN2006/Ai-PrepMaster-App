import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  Users,
  Code,
  Database,
  Trash2,
  Plus,
  AlertTriangle,
  Sparkles,
  BarChart,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Loader from '../components/Loader';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('openai'); // 'openai', 'users', 'challenges', 'analytics'

  // Tab states
  const [openaiActive, setOpenaiActive] = useState(null);
  const [checkingKey, setCheckingKey] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [challenges, setChallenges] = useState([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);

  // Challenge Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('Easy');
  const [prompt, setPrompt] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [constraints, setConstraints] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // OpenAI connection checker
  const handleCheckOpenAI = async () => {
    setCheckingKey(true);
    setOpenaiActive(null);
    try {
      const res = await axios.get('/api/admin/check-openai');
      setOpenaiActive(res.data.openai_active);
    } catch (err) {
      console.error(err);
      setOpenaiActive(false);
    } finally {
      setCheckingKey(false);
    }
  };

  // Fetch Users list
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get('/api/admin/users');
      setUsersList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user profile? All historical interviews, codes, and resumes will be deleted permanently.')) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setUsersList(usersList.filter(u => u.id !== userId));
      alert('User successfully deleted.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to delete user.');
    }
  };

  // Fetch Challenges
  const fetchChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const res = await axios.get('/api/challenges');
      setChallenges(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChallenges(false);
    }
  };

  // Create Challenge
  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!title || !prompt || !sampleInput || !sampleOutput || !constraints) {
      setFormError('Please fill in all database challenge fields.');
      return;
    }

    try {
      const res = await axios.post('/api/admin/challenges', {
        title,
        category,
        difficulty,
        prompt,
        sample_input: sampleInput,
        sample_output: sampleOutput,
        constraints
      });

      setFormSuccess(`Challenge "${title}" successfully added to the database!`);
      // Reset form fields
      setTitle('');
      setPrompt('');
      setSampleInput('');
      setSampleOutput('');
      setConstraints('');

      fetchChallenges(); // Refresh challenge list
      setTimeout(() => setFormSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setFormError('Failed to create new coding challenge.');
    }
  };

  // Delete Challenge
  const handleDeleteChallenge = async (chalId) => {
    if (!window.confirm('Delete this coding challenge?')) return;
    try {
      await axios.delete(`/api/admin/challenges/${chalId}`);
      setChallenges(challenges.filter(c => c.id !== chalId));
    } catch (err) {
      console.error(err);
      alert('Failed to remove challenge.');
    }
  };

  // Fetch Admin Analytics
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await axios.get('/api/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Load active tab data
  useEffect(() => {
    if (activeTab === 'openai') {
      handleCheckOpenAI();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'challenges') {
      fetchChallenges();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  return (
    <div className="animated-fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={36} color="var(--accent)" />
          <span>Admin <span className="gradient-text">Console</span></span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Administrative tools to moderate profiles, check OpenAI configurations, configure code challenges, and audit user logs.</p>
      </header>

      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button className={`btn ${activeTab === 'openai' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('openai')}>
          OpenAI Connection
        </button>
        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('users')}>
          Manage Users
        </button>
        <button className={`btn ${activeTab === 'challenges' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('challenges')}>
          Manage Challenges
        </button>
        <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('analytics')}>
          System Analytics
        </button>
      </div>

      {/* OpenAI connection check tab */}
      {activeTab === 'openai' && (
        <div className="glass-card" style={{ maxWidth: '600px', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>OpenAI API Credentials Test</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            फास्टएपी will call a quick OpenAI Models check to evaluate if your `OPENAI_API_KEY` environment variable is working correctly.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <button className="btn btn-primary" onClick={handleCheckOpenAI} disabled={checkingKey}>
              {checkingKey ? 'Pinging OpenAI...' : 'Test Connection'}
            </button>

            {openaiActive === true && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.95rem' }}>
                <CheckCircle size={20} />
                <span>OpenAI Connection Active (Models Loaded)</span>
              </div>
            )}
            {openaiActive === false && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontWeight: 600, fontSize: '0.95rem' }}>
                <XCircle size={20} />
                <span>OpenAI Connection Offline (Fallback Local DB Enabled)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manage Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="var(--primary)" />
            <span>Moderate Registered Users</span>
          </h3>

          {loadingUsers ? <Loader /> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Interviews</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Challenges Solved</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((usr) => (
                    <tr key={usr.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '1rem' }}>{usr.id}</td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{usr.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{usr.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className="question-status-pill" style={{
                          backgroundColor: usr.is_admin ? 'rgba(236,72,153,0.1)' : 'rgba(255,255,255,0.03)',
                          color: usr.is_admin ? 'var(--accent)' : 'var(--text-muted)'
                        }}>
                          {usr.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>{usr.interviews_taken}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>{usr.challenges_solved}</td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleDeleteUser(usr.id)}
                          disabled={usr.email === 'admin@prepmaster.com'}
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Manage Challenges Tab */}
      {activeTab === 'challenges' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Create challenge form */}
          <form onSubmit={handleCreateChallenge} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} color="var(--primary)" />
              <span>Create Coding Challenge</span>
            </h3>

            {formSuccess && (
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: '#a7f3d0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                {formSuccess}
              </div>
            )}

            {formError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Challenge Title</label>
              <input type="text" className="input-field" placeholder="e.g. Find Target Element" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select className="input-field select-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Arrays">Arrays</option>
                  <option value="Strings">Strings</option>
                  <option value="Linked Lists">Linked Lists</option>
                  <option value="Stack">Stack</option>
                  <option value="Queue">Queue</option>
                  <option value="Trees">Trees</option>
                  <option value="Graphs">Graphs</option>
                  <option value="Dynamic Programming">Dynamic Programming</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Difficulty</label>
                <select className="input-field select-field" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Problem Statement</label>
              <textarea className="input-field" placeholder="Explain the problem logic, expected arguments, and results..." value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ minHeight: '80px', fontFamily: 'inherit' }} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Sample Input</label>
              <input type="text" className="input-field" placeholder="e.g. nums = [1,2,3], val = 2" value={sampleInput} onChange={(e) => setSampleInput(e.target.value)} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Sample Output</label>
              <input type="text" className="input-field" placeholder="e.g. [0,1]" value={sampleOutput} onChange={(e) => setSampleOutput(e.target.value)} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Constraints</label>
              <input type="text" className="input-field" placeholder="e.g. 1 <= nums.length <= 10^5" value={constraints} onChange={(e) => setConstraints(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>Create Challenge</span>
            </button>
          </form>

          {/* Existing challenges list */}
          <div className="glass-card" style={{ maxHeight: '680px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} color="var(--accent)" />
              <span>Active Database Challenges</span>
            </h3>

            {loadingChallenges ? <Loader /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {challenges.map((c) => (
                  <div key={c.id} style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{c.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.category} | {c.difficulty}</p>
                    </div>
                    <button className="btn btn-danger" style={{ padding: '0.35rem 0.5rem' }} onClick={() => handleDeleteChallenge(c.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Analytics Tab */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {loadingAnalytics ? <Loader /> : analytics && (
            <>
              {/* Stats Grid */}
              <div className="dashboard-grid">
                <div className="glass-card stat-card">
                  <div className="stat-header">
                    <span>Total Registered Users</span>
                    <Users size={16} color="var(--primary)" />
                  </div>
                  <div className="stat-value">{analytics.total_users}</div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-header">
                    <span>Active Challenges</span>
                    <Code size={16} color="var(--success)" />
                  </div>
                  <div className="stat-value">{analytics.total_challenges}</div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-header">
                    <span>Total Code Submissions</span>
                    <Database size={16} color="var(--accent)" />
                  </div>
                  <div className="stat-value">{analytics.total_submissions}</div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-header">
                    <span>Interviews Created</span>
                    <BarChart size={16} color="#3b82f6" />
                  </div>
                  <div className="stat-value">{analytics.total_interviews}</div>
                </div>
              </div>

              {/* Analytics Graph representation */}
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Global Platform Performance Ratings</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', marginTop: '1.5rem' }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '5px solid var(--primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 800
                  }}>
                    <span style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>{analytics.avg_score}%</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Score</span>
                  </div>
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <p><span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Total Actions Audited:</span> {analytics.total_submissions + analytics.total_interviews} items</p>
                    <p><span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Moderation Threshold:</span> 100% Secure Access</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
