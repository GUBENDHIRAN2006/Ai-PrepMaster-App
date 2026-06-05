import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileQuestion,
  MessageSquare,
  Code2,
  FileText,
  Settings,
  ShieldAlert,
  LogOut,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">AI</div>
        <div className="logo-text">Mock<span className="gradient-text">Mind</span></div>
      </div>

      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/interview" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FileQuestion size={20} />
          <span>AI Interview</span>
        </NavLink>

        <NavLink to="/chatbot" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} />
          <span>Mock Chatbot</span>
        </NavLink>

        <NavLink to="/coding" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Code2 size={20} />
          <span>Code Sandbox</span>
        </NavLink>

        <NavLink to="/resume" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Resume Score</span>
        </NavLink>

        <NavLink to="/career" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Briefcase size={20} />
          <span>Career Guidance</span>
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>

        {user?.is_admin && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <ShieldAlert size={20} color="var(--accent)" />
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={logout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
