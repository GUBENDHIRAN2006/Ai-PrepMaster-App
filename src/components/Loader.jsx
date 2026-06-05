import React from 'react';

const Loader = ({ size = 'medium', fullPage = false }) => {
  const spinnerStyle = {
    border: '3px solid rgba(255, 255, 255, 0.05)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    width: size === 'small' ? '24px' : size === 'large' ? '60px' : '40px',
    height: size === 'small' ? '24px' : size === 'large' ? '60px' : '40px',
    animation: 'spin 1s linear infinite',
  };

  const containerStyle = fullPage
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-dark)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        gap: '1rem',
      }
    : {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        width: '100%',
      };

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle}></div>
      {fullPage && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading Interview Platform...</p>}
    </div>
  );
};

export default Loader;
