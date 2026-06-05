import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  Send, 
  CheckCircle, 
  BookOpen, 
  HelpCircle, 
  ChevronRight, 
  ArrowLeft,
  MessageSquareQuote
} from 'lucide-react';
import Loader from '../components/Loader';

const InterviewGenerator = () => {
  // Form Config states
  const [role, setRole] = useState('Python Developer');
  const [experience, setExperience] = useState('Fresher');
  const [difficulty, setDifficulty] = useState('Medium');
  
  // Workspace states
  const [isGenerated, setIsGenerated] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { question_id: answer_text }
  const [evaluations, setEvaluations] = useState({}); // { question_id: { score, feedback, answer } }
  
  // Loading states
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');

  // Fetch history to see if there are pre-existing questions to show or continue
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/interviews/history');
        if (res.data.length > 0) {
          // Format pre-existing database evaluations into local state
          const loadedEvaluations = {};
          res.data.forEach(item => {
            if (item.answer) {
              loadedEvaluations[item.id] = {
                score: item.score,
                feedback: item.feedback,
                answer: item.answer,
                sample_answer: item.sample_answer
              };
            }
          });
          
          // Show historical questions in workspace
          const loadedQuestions = res.data.map(item => ({
            id: item.id,
            question: item.question,
            role: item.role,
            difficulty: item.difficulty,
            experience: item.experience,
            sample_answer: item.sample_answer
          }));
          
          // Sort or pick latest session
          // For simplicity, if there are questions in the history, load them so the user is in workspace.
          // The user can always click "New Session"
          setQuestions(loadedQuestions);
          setEvaluations(loadedEvaluations);
          setIsGenerated(true);
        }
      } catch (err) {
        console.error('Error fetching interview history', err);
      }
    };
    fetchHistory();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    try {
      const res = await axios.post('/api/interviews/generate', {
        role,
        experience,
        difficulty
      });
      setQuestions(res.data);
      setEvaluations({});
      setUserAnswers({});
      setActiveQuestionIdx(0);
      setIsGenerated(true);
    } catch (err) {
      console.error(err);
      setError('Could not generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSubmit = async () => {
    const activeQuestion = questions[activeQuestionIdx];
    const answer = userAnswers[activeQuestion.id] || '';
    
    if (!answer.trim()) {
      alert('Please type an answer before submitting.');
      return;
    }
    
    setEvaluating(true);
    try {
      const res = await axios.post('/api/interviews/submit-answer', {
        question_id: activeQuestion.id,
        answer: answer
      });
      
      setEvaluations(prev => ({
        ...prev,
        [activeQuestion.id]: {
          score: res.data.score,
          feedback: res.data.feedback,
          answer: res.data.answer,
          sample_answer: res.data.sample_answer
        }
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to evaluate answer. Try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const startNewSession = () => {
    setIsGenerated(false);
    setQuestions([]);
    setEvaluations({});
    setUserAnswers({});
  };

  if (generating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', justifyContent: 'center', alignItems: 'center' }}>
        <Loader size="large" />
        <h2 style={{ marginTop: '1.5rem', fontWeight: 600 }}>AI is generating custom interview questions...</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Creating 10 Technical and 5 HR scenarios for {role}</p>
      </div>
    );
  }

  const activeQuestion = questions[activeQuestionIdx];
  const activeEvaluation = activeQuestion ? evaluations[activeQuestion.id] : null;

  return (
    <div className="animated-fade-in" style={{ height: '100%' }}>
      {!isGenerated ? (
        // CONFIGURATION SCREEN
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              AI Interview <span className="gradient-text">Generator</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Generate tailor-made interview prep questions using GPT models</p>
          </header>

          <form onSubmit={handleGenerate} className="glass-card" style={{ padding: '2.5rem' }}>
            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
            
            <div className="form-group">
              <label className="form-label">Select Target Role</label>
              <select 
                className="input-field select-field" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Python Developer">Python Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <select 
                className="input-field select-field" 
                value={experience} 
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="Fresher">Fresher (Entry Level)</option>
                <option value="1 Year">1 Year</option>
                <option value="2 Years">2 Years</option>
                <option value="3+ Years">3+ Years (Senior)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Complexity / Difficulty</label>
              <select 
                className="input-field select-field" 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy (Conceptual foundations)</option>
                <option value="Medium">Medium (Implementation & Debugging)</option>
                <option value="Hard">Hard (System Architecture & Edge-Cases)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              <Sparkles size={18} />
              <span>Assemble AI Questions</span>
            </button>
          </form>
        </div>
      ) : (
        // INTERVIEW WORKSPACE SCREEN
        <div>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <button className="btn btn-secondary" onClick={startNewSession} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <ArrowLeft size={14} />
                <span>New Session</span>
              </button>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {activeQuestion?.role} Prep <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400 }}>({activeQuestion?.experience} | {activeQuestion?.difficulty})</span>
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="question-status-pill" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)' }}>
                {questions.length} Questions
              </span>
            </div>
          </header>

          <div className="interview-workspace">
            {/* Left Questions Sidebar */}
            <div className="question-selector-panel glass-card">
              <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
                Questions List
              </h3>
              {questions.map((q, idx) => {
                const evalItem = evaluations[q.id];
                const isAnswered = !!evalItem;
                return (
                  <button 
                    key={q.id}
                    className={`question-select-btn ${activeQuestionIdx === idx ? 'active' : ''}`}
                    onClick={() => setActiveQuestionIdx(idx)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span className="question-status-pill" style={{ 
                        backgroundColor: idx < 10 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)', 
                        color: idx < 10 ? '#3b82f6' : '#ec4899' 
                      }}>
                        {idx < 10 ? `Tech Q${idx+1}` : `HR Q${idx-9}`}
                      </span>
                      {isAnswered ? (
                        <span className="question-status-pill" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                          Score: {evalItem.score}%
                        </span>
                      ) : (
                        <span className="question-status-pill" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                          Pending
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', color: 'var(--text-main)' }}>
                      {q.question}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Question Workspace */}
            <div className="question-workspace-panel glass-card">
              {activeQuestion && (
                <>
                  <div className="workspace-header">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      Question {activeQuestionIdx + 1}
                    </h3>
                    <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-main)' }}>{activeQuestion.question}</p>
                  </div>

                  <div className="workspace-body">
                    {!activeEvaluation ? (
                      // INPUT INTERFACE
                      <>
                        <label className="form-label">Compose Your Response</label>
                        <textarea
                          className="answer-textarea"
                          placeholder="Explain your approach, code design, logic, and past project contexts here..."
                          value={userAnswers[activeQuestion.id] || ''}
                          onChange={(e) => setUserAnswers({ ...userAnswers, [activeQuestion.id]: e.target.value })}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                          <button 
                            className="btn btn-primary" 
                            onClick={handleAnswerSubmit}
                            disabled={evaluating}
                          >
                            {evaluating ? (
                              <>Evaluating...</>
                            ) : (
                              <>
                                <Send size={16} />
                                <span>Submit for AI Assessment</span>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      // EVALUATION & SOLUTION DISPLAY
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Score Indicator */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem',
                          background: 'rgba(255, 255, 255, 0.02)',
                          padding: '1rem 1.25rem',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: activeEvaluation.score >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: activeEvaluation.score >= 80 ? '#10b981' : '#f59e0b',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontWeight: 800,
                            fontSize: '1.1rem'
                          }}>
                            {activeEvaluation.score}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Response Graded</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI calculated score out of 100</p>
                          </div>
                        </div>

                        {/* Submitted Answer review */}
                        <div>
                          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <CheckCircle size={14} color="var(--success)" />
                            <span>Your Answer</span>
                          </h4>
                          <div style={{ background: 'rgba(0, 0, 0, 0.15)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'pre-wrap', border: '1px solid rgba(255, 255, 255, 0.02)' }}>
                            {activeEvaluation.answer}
                          </div>
                        </div>

                        {/* AI Feedback */}
                        <div className="feedback-box">
                          <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Sparkles size={14} />
                            <span>AI Feedback & Suggestions</span>
                          </h4>
                          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#c7d5e6' }}>{activeEvaluation.feedback}</p>
                        </div>

                        {/* Sample / Model answer */}
                        {activeEvaluation.sample_answer && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <BookOpen size={14} color="var(--accent)" />
                              <span>AI Sample Answer Guide</span>
                            </h4>
                            <div style={{ background: 'rgba(236, 72, 153, 0.02)', border: '1px dashed rgba(236, 72, 153, 0.2)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                              {activeEvaluation.sample_answer}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => {
                              // Reset evaluation locally so they can retry
                              const copy = { ...evaluations };
                              delete copy[activeQuestion.id];
                              setEvaluations(copy);
                            }}
                          >
                            <span>Retry Question</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewGenerator;
