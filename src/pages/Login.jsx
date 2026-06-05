import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertTriangle, Loader2 } from 'lucide-react';

const Login = () => {
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get('admin') === 'true';
  const [role, setRole] = useState('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({ email: false, password: false });
  const { login, loginLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError({ email: false, password: false });

    if (!email || !password) {
      setError('Please fill in all fields.');
      setFieldError({ email: !email, password: !password });
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      if (res.user?.is_admin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
      // Only highlight fields for credential errors, not server/network errors
      const isCredentialError = res.message?.toLowerCase().includes('invalid email') ||
        res.message?.toLowerCase().includes('password') ||
        res.message?.toLowerCase().includes('credentials');
      if (isCredentialError) {
        setFieldError({ email: true, password: true });
      }
    }
  };


  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '0.75rem 1rem',
    background: hasError ? 'rgba(239, 68, 68, 0.08)' : 'rgba(15, 23, 42, 0.6)',
    border: `1px solid ${hasError ? 'var(--danger)' : 'var(--border-color)'}`,
    borderRadius: '10px',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    boxShadow: hasError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
  });

  return (
    <div className="auth-page-container animated-fade-in">
      <div className="auth-form-card">
        <div className="auth-header">
          <div className="logo-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px', fontSize: '1.25rem' }}>AI</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to continue your preparation</p>
        </div>

        {/* Role Selector Tabs */}
        {isAdminMode && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => setRole('candidate')}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem', transition: 'var(--transition)',
                background: role === 'candidate' ? 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)' : 'transparent',
                color: role === 'candidate' ? 'white' : 'var(--text-muted)'
              }}
            >Candidate</button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem', transition: 'var(--transition)',
                background: role === 'admin' ? 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)' : 'transparent',
                color: role === 'admin' ? 'white' : 'var(--text-muted)'
              }}
            >Administrator</button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#fca5a5', padding: '0.85rem 1rem', borderRadius: '10px',
            fontSize: '0.875rem', marginBottom: '1.25rem', animation: 'fadeIn 0.3s ease'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '1px', color: '#f87171' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Tip */}
        {isAdminMode && role === 'admin' && (
          <div style={{
            backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem',
            fontSize: '0.85rem', color: '#c084fc', display: 'flex', flexDirection: 'column', gap: '0.5rem'
          }}>
            <span>Tip: Default administrator credentials for testing:</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <code>admin@prepmaster.com / admin123</code>
              <button
                type="button"
                onClick={() => { setEmail('admin@prepmaster.com'); setPassword('admin123'); }}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', padding: '0.25rem 0.6rem', borderRadius: '4px',
                  cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600
                }}
              >Autofill</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              style={inputStyle(fieldError.email)}
              placeholder={role === 'admin' ? 'admin@prepmaster.com' : 'name@example.com'}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldError(f => ({ ...f, email: false })); setError(''); }}
              disabled={loginLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              style={inputStyle(fieldError.password)}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldError(f => ({ ...f, password: false })); setError(''); }}
              disabled={loginLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', opacity: loginLoading ? 0.8 : 1 }}
            disabled={loginLoading}
          >
            {loginLoading
              ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /><span>Signing in…</span></>
              : <><LogIn size={18} /><span>Sign In as {role === 'admin' ? 'Admin' : 'Candidate'}</span></>
            }
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create Account</Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Login;
