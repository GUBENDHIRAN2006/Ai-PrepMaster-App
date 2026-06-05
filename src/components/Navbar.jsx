import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="user-profile-badge">
        <div className="avatar">
          {getInitials(user?.name)}
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name || 'User'}</span>
      </div>
    </nav>
  );
};

export default Navbar;
