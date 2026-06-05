import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get('admin') === 'true';
  const [role, setRole] = useState('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({ name: false, email: false, password: false });
  const { register, loginLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError({ name: false, email: false, password: false });

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      setFieldError({ name: !name, email: !email, password: !password });
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setFieldError(f => ({ ...f, password: true }));
      return;
    }

    const isRegisteringAdmin = isAdminMode && role === 'admin';
    const res = await register(name, email, password, isRegisteringAdmin);
    if (res.success) {
      if (res.user?.is_admin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
      if (res.message?.toLowerCase().includes('email') || res.message?.toLowerCase().includes('registered')) {
        setFieldError(f => ({ ...f, email: true }));
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

  const passwordStrength = password.length === 0 ? null : password.length < 6 ? 'weak' : password.length < 10 ? 'medium' : 'strong';
  const strengthColor = { weak: '#ef4444', medium: '#f59e0b', strong: '#10b981' };
  const strengthLabel = { weak: 'Too short', medium: 'Moderate', strong: 'Strong' };

  return (
    <div className="auth-page-container animated-fade-in">
      <div className="auth-form-card">
        <div className="auth-header">
          <div className="logo-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px', fontSize: '1.25rem' }}>AI</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Start your customized AI preparation path</p>
        </div>

        {/* Role Selector */}
        {isAdminMode && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {['candidate', 'admin'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem', transition: 'var(--transition)',
                  background: role === r ? 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)' : 'transparent',
                  color: role === r ? 'white' : 'var(--text-muted)',
                }}
              >{r === 'candidate' ? 'Candidate' : 'Administrator'}</button>
            ))}
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
            <div>
              <span>{error}</span>
              {error.toLowerCase().includes('already registered') && (
                <div style={{ marginTop: '0.35rem' }}>
                  <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'underline' }}>
                    Click here to sign in →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              style={inputStyle(fieldError.name)}
              placeholder="John Doe"
              value={name}
              onChange={(e) => { setName(e.target.value); setFieldError(f => ({ ...f, name: false })); setError(''); }}
              disabled={loginLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              style={inputStyle(fieldError.email)}
              placeholder={role === 'admin' ? 'admin-name@example.com' : 'name@example.com'}
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
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldError(f => ({ ...f, password: false })); setError(''); }}
              disabled={loginLoading}
            />
            {/* Password strength indicator */}
            {passwordStrength && (
              <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px', transition: 'width 0.3s, background 0.3s',
                    width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                    background: strengthColor[passwordStrength]
                  }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: strengthColor[passwordStrength], fontWeight: 600 }}>
                  {strengthLabel[passwordStrength]}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', opacity: loginLoading ? 0.8 : 1 }}
            disabled={loginLoading}
          >
            {loginLoading
              ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /><span>Creating Account…</span></>
              : <><UserPlus size={18} /><span>Create {role === 'admin' ? 'Admin' : 'Candidate'} Account</span></>
            }
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Register;
