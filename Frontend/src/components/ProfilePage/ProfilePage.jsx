import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, LogOut, Trash2, Check, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import apiClient from '../../services/apiClient';
import './ProfilePage.css';

const ProfilePage = ({ onBack, onLogout }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setIsLoading(true);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      setError('Failed to load profile');
    } else if (user) {
      setUser(user);
      setEmail(user.email);
      setNewEmail(user.email);
    }
    setIsLoading(false);
  };

  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}&background=random`;
  };

  const handleEditEmail = () => {
    setIsEditingEmail(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleCancelEdit = () => {
    setIsEditingEmail(false);
    setNewEmail(email);
    setError(null);
  };

  const handleSaveEmail = async () => {
    const trimmedEmail = newEmail.trim();
    if (!trimmedEmail) {
      setError('Email cannot be empty.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Invalid email format.');
      return;
    }
    if (trimmedEmail === email) {
      setError('Email is unchanged.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    const { data, error } = await supabase.auth.updateUser({ email: trimmedEmail });

    if (error) {
      setError(error.message);
    } else {
      setSuccessMsg('Email change requested. Please check your email to confirm the new address.');
      setIsEditingEmail(false);
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    setIsSaving(true);
    await supabase.auth.signOut();
    onLogout();
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await apiClient.delete('/user/account');
      // On success, backend deletes auth user, which invalidates token
      // Wait a moment then log out locally
      await supabase.auth.signOut();
      onLogout();
    } catch (err) {
      setError(err.message || 'Failed to delete account. Please try again later.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page-loading">
        <div className="spin-icon"><RefreshCw size={24} /></div>
        <p>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <h2 className="profile-title">Account Settings</h2>
      </div>

      <div className="profile-page-card">
        <div className="profile-page-avatar-container">
          <img src={getAvatarUrl()} alt="User Avatar" className="profile-page-avatar" />
        </div>

        <div className="profile-section">
          <label className="profile-label">Email</label>
          {isEditingEmail ? (
            <div className="profile-edit-email-group">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="profile-input"
                disabled={isSaving}
              />
              <div className="profile-edit-actions">
                <button 
                  className="profile-action-btn cancel-btn" 
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X size={16} /> Cancel
                </button>
                <button 
                  className="profile-action-btn save-btn" 
                  onClick={handleSaveEmail}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : <><Check size={16} /> Save</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-display-email-group">
              <span className="profile-email">{email}</span>
              <button className="profile-edit-btn" onClick={handleEditEmail}>
                <Edit2 size={14} /> Edit
              </button>
            </div>
          )}
        </div>

        {error && <div className="profile-error">{error}</div>}
        {successMsg && <div className="profile-success">{successMsg}</div>}

        <div className="profile-divider"></div>

        <div className="profile-danger-zone">
          <button className="profile-danger-btn logout-btn" onClick={() => setShowLogoutModal(true)}>
            <LogOut size={18} /> Logout
          </button>
          
          <button className="profile-danger-btn delete-btn" onClick={() => setShowDeleteModal(true)}>
            <Trash2 size={18} /> Delete Account
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <h3>Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="profile-modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => setShowLogoutModal(false)}>No</button>
              <button className="modal-btn confirm-btn" onClick={handleLogout} disabled={isSaving}>
                {isSaving ? 'Logging out...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal danger-modal">
            <h3>Delete Account?</h3>
            <p>If you delete this account, all your data will be permanently lost.<br/>This action cannot be undone.</p>
            <div className="profile-modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>No</button>
              <button className="modal-btn danger-confirm-btn" onClick={handleDeleteAccount} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
