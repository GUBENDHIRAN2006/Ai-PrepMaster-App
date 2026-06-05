import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Code2, Briefcase, Upload, Lock, Save, CheckCircle2 } from 'lucide-react';
import Loader from '../components/Loader';

const Settings = () => {
  const { user } = useAuth();
  
  // Profile settings state
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [avatar, setAvatar] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status/Alert states
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/profile');
        setBio(res.data.bio || '');
        setGithub(res.data.github || '');
        setLinkedin(res.data.linkedin || '');
        setAvatar(res.data.image || '');
      } catch (err) {
        console.error('Failed to fetch user profile', err);
        setProfileError('Failed to load profile details.');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await axios.put('/api/profile', {
        bio,
        github,
        linkedin
      });
      setProfileSuccess('Profile information successfully updated.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setProfileError('Failed to update profile settings.');
    }
  };

  const handleAvatarChange = async (e) => {
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    setProfileSuccess('');
    setProfileError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('/api/profile/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatar(res.data.image_url);
      setProfileSuccess('Avatar image uploaded successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.detail || 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await axios.put('/api/profile/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setPasswordSuccess('Password successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.detail || 'Failed to change password. Double check current password.');
    }
  };

  if (profileLoading) return <Loader size="large" />;

  return (
    <div className="animated-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Account <span className="gradient-text">Settings</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal credentials, social profiles, and portal login information</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <User size={18} color="var(--primary)" />
            <span>Profile Details</span>
          </h2>
          
          {profileSuccess && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: '#a7f3d0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}
          
          {profileError && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {profileError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            {/* Left: Profile photo upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {avatar ? (
                  <img src={`http://localhost:8000${avatar}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                    {user?.name?.[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => document.getElementById('avatar-input').click()}
                disabled={uploading}
              >
                <Upload size={14} />
                <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
              </button>
              <input 
                type="file" 
                id="avatar-input" 
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Right: details input form */}
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <input type="text" className="input-field" value={user?.name || ''} disabled style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', color: 'var(--text-muted)' }} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input type="text" className="input-field" value={user?.email || ''} disabled style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', color: 'var(--text-muted)' }} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Professional Bio</label>
                <textarea 
                  className="input-field" 
                  placeholder="Introduce yourself, target roles, and special skill niches..." 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Code2 size={14} />
                  <span>GitHub Profile Link</span>
                </label>
                <input 
                  type="url" 
                  className="input-field" 
                  placeholder="https://github.com/yourusername" 
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Briefcase size={14} />
                  <span>LinkedIn Profile Link</span>
                </label>
                <input 
                  type="url" 
                  className="input-field" 
                  placeholder="https://linkedin.com/in/yourusername" 
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                <Save size={16} />
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Lock size={18} color="var(--accent)" />
            <span>Update Password</span>
          </h2>
          
          {passwordSuccess && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: '#a7f3d0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}
          
          {passwordError && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '500px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Current Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">New Password (min. 6 characters)</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-accent" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              <Shield size={16} />
              <span>Apply Security Shift</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
