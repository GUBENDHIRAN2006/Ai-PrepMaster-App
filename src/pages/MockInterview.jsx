import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, Send, Sparkles, User, RefreshCw, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';
import Loader from '../components/Loader';

const MockInterview = () => {
  // Config state
  const [role, setRole] = useState('Python Developer');
  const [experience, setExperience] = useState('Fresher');
  const [difficulty, setDifficulty] = useState('Medium');
  const [inProgress, setInProgress] = useState(false);

  // Chat conversation state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  // Load chat history from DB on component mount
  const loadChatHistory = async () => {
    try {
      const res = await axios.get('/api/chatbot/history');
      if (res.data.length > 0) {
        // Format database entries to local display format
        const formatted = [];
        res.data.forEach(chat => {
          formatted.push({ role: 'user', content: chat.message });
          formatted.push({ role: 'assistant', content: chat.response });
        });
        setMessages(formatted);
        setInProgress(true);
      }
    } catch (err) {
      console.error('Failed to load chat history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const startInterview = async () => {
    setInProgress(true);
    setLoading(true);
    setError('');

    try {
      // First call to initialize chat greetings
      const res = await axios.post('/api/chatbot/chat', {
        message: `Hello! I would like to start my mock interview.`,
        role,
        experience,
        difficulty
      });

      setMessages([
        { role: 'user', content: 'Hello! I would like to start my mock interview.' },
        { role: 'assistant', content: res.data.response }
      ]);
    } catch (err) {
      console.error(err);
      setError('Failed to initiate mock chatbot interview. Please try again.');
      setInProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userText = inputText;
    // Optimistically update UI
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInputText('');
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/chatbot/chat', {
        message: userText,
        role,
        experience,
        difficulty
      });

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.data.response }
      ]);
    } catch (err) {
      console.error(err);
      setError('Connection to the AI interviewer was lost. Please verify your server connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetHistory = async () => {
    if (!window.confirm('Clear all conversation logs? This resets the AI context back to step one.')) return;
    setLoading(true);
    try {
      await axios.delete('/api/chatbot/reset');
      setMessages([]);
      setInProgress(false);
    } catch (err) {
      console.error(err);
      alert('Failed to reset chat logs.');
    } finally {
      setLoading(false);
    }
  };

  if (historyLoading) return <Loader size="large" />;

  return (
    <div className="animated-fade-in" style={{ height: '100%' }}>
      {!inProgress ? (
        // SETUP SCREEN
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Interactive <span className="gradient-text">Mock Chatbot</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Perform a live conversation mock interview with a simulated HR & Technical lead</p>
          </header>

          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <div className="form-group">
              <label className="form-label">Interview Role Focus</label>
              <select className="input-field select-field" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Python Developer">Python Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Level</label>
              <select className="input-field select-field" value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option value="Fresher">Fresher (Entry Level)</option>
                <option value="1 Year">1 Year</option>
                <option value="2 Years">2 Years</option>
                <option value="3+ Years">3+ Years (Senior)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assess Severity</label>
              <select className="input-field select-field" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Easy">Easy (Conversational & core basics)</option>
                <option value="Medium">Medium (Scenarios & logical implementations)</option>
                <option value="Hard">Hard (Severe stress and scalability queries)</option>
              </select>
            </div>

            <button onClick={startInterview} className="btn btn-accent" style={{ width: '100%', marginTop: '1.25rem' }}>
              <MessageSquare size={18} />
              <span>Initiate Chat Session</span>
            </button>
          </div>
        </div>
      ) : (
        // ACTIVE INTERVIEW CHAT BOARD
        <div>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <button className="btn btn-secondary" onClick={() => setInProgress(false)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <ArrowLeft size={14} />
                <span>Configurations</span>
              </button>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                Interviewer AI <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 400 }}>({role} | {difficulty})</span>
              </h2>
            </div>
            <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={handleResetHistory} disabled={loading}>
              <Trash2 size={14} />
              <span>Reset Context</span>
            </button>
          </header>

          <div className="glass-card chat-container-layout">
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.role}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.75rem', color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
                    {msg.role === 'user' ? <User size={12} /> : <Sparkles size={12} />}
                    <span>{msg.role === 'user' ? 'You' : 'Interviewer AI'}</span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                </div>
              ))}

              {loading && (
                <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader size="small" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Interviewer is listening and analyzing...</span>
                </div>
              )}

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '0.75rem', borderRadius: '8px', width: 'fit-content' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="chat-input-area">
              <input
                type="text"
                className="input-field"
                placeholder="Type your response here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading || !inputText.trim()} style={{ padding: '0.75rem 1.25rem' }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
