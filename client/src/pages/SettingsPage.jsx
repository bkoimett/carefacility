import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../utils/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Role verification
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Form states safely initialized with fallback strings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Sync profile data if user context changes late
  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  // Clean error message parser to prevent UI crashes
  const handleCatchError = (err, defaultText) => {
    console.error(err);
    const msg = err.response?.data?.message || err.response?.data?.error || err.message || defaultText;
    setFeedback({ type: 'error', message: msg });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setLoading(true);
    try {
      const res = await authApi.updateProfile({
        name: profileData.name,
        email: profileData.email
      });
      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      handleCatchError(err, 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setFeedback({ type: 'error', message: 'New passwords do not match' });
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setFeedback({ type: 'success', message: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      handleCatchError(err, 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Navigation Sidebar / Mobile Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <div className="tabs tabs-boxed md:flex-col items-stretch p-2 bg-base-200 gap-1">
            <button 
              className={`tab justify-start ${activeTab === 'profile' ? 'tab-active' : ''}`}
              onClick={() => { setFeedback({ type: '', message: '' }); setActiveTab('profile'); }}
            >
              👤 Profile Settings
            </button>
            <button 
              className={`tab justify-start ${activeTab === 'password' ? 'tab-active' : ''}`}
              onClick={() => { setFeedback({ type: '', message: '' }); setActiveTab('password'); }}
            >
              🔒 Security Settings
            </button>
            {isAdmin && (
              <button 
                className={`tab justify-start text-error ${activeTab === 'admin' ? 'tab-active !text-white' : ''}`}
                onClick={() => { setFeedback({ type: '', message: '' }); setActiveTab('admin'); }}
              >
                🛠️ User Management
              </button>
            )}
          </div>

          {/* Account Info Read-Only Badge Section */}
          <div className="card bg-base-200 p-4 rounded-xl text-xs space-y-2 hidden md:block">
            <div className="font-semibold text-base-content/70">Account Context</div>
            <div>Role: <span className="badge badge-sm badge-secondary capitalize">{user?.role || 'user'}</span></div>
            <div className="truncate">ID: {user?._id || 'N/A'}</div>
          </div>
        </div>

        {/* Dynamic Display Panels */}
        <div className="flex-1 bg-base-100 p-6 rounded-xl border border-base-200 shadow-sm min-h-[400px]">
          
          {feedback.message && (
            <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} mb-6 shadow-sm`}>
              <span>{feedback.message}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Update Profile Information</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <div className="form-control w-full">
                  <label className="label"><span className="label-text">Full Name</span></label>
                  <input 
                    type="text" className="input input-bordered w-full" required
                    value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text">Email Address</span></label>
                  <input 
                    type="email" className="input input-bordered w-full" required
                    value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
                  {loading ? <span className="loading loading-spinner"></span> : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="form-control w-full">
                  <label className="label"><span className="label-text">Current Password</span></label>
                  <input 
                    type="password" className="input input-bordered w-full" required
                    value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text">New Password</span></label>
                  <input 
                    type="password" className="input input-bordered w-full" required
                    value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text">Confirm New Password</span></label>
                  <input 
                    type="password" className="input input-bordered w-full" required
                    value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
                  {loading ? <span className="loading loading-spinner"></span> : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'admin' && isAdmin && (
            <AdminUserDashboard handleCatchError={handleCatchError} />
          )}
        </div>

      </div>
    </div>
  );
}

// Nested Sub-component utilizing verified API method signatures 
function AdminUserDashboard({ handleCatchError }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', role: 'user'
  });

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const res = await authApi.getAllUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      handleCatchError(err, 'Failed to fetch user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await authApi.createUser(newUser);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      alert('User added successfully!');
      loadAllUsers();
    } catch (err) {
      handleCatchError(err, 'Could not create new user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    setActionLoading(true);
    try {
      await authApi.deleteUser(id);
      loadAllUsers();
    } catch (err) {
      handleCatchError(err, 'Could not remove user');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Administrative Administration</h2>
        <p className="text-sm text-base-content/60">Create, control, and delete application user directory access.</p>
      </div>

      {/* Add New User Interactive Card Form */}
      <div className="card bg-base-200 p-4 rounded-xl">
        <h3 className="font-semibold mb-3">Add New System User</h3>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text" placeholder="Full Name" className="input input-bordered w-full bg-base-100" required
            value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
          />
          <input
            type="email" placeholder="Email Address" className="input input-bordered w-full bg-base-100" required
            value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
          />
          <input
            type="password" placeholder="Access Password" className="input input-bordered w-full bg-base-100" required
            value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
          />
          <select
            className="select select-bordered w-full bg-base-100"
            value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
          >
            <option value="user">Standard User</option>
            <option value="admin">Administrator</option>
            <option value="superadmin">Super Administrator</option>
          </select>
          <button type="submit" disabled={actionLoading} className="btn btn-primary md:col-span-2">
            {actionLoading ? 'Processing...' : 'Provision User Account'}
          </button>
        </form>
      </div>

      {/* Users Registry List */}
      <div>
        <h3 className="font-semibold mb-3">User Registry Directory ({users.length})</h3>
        {loading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-base-300">
                  <th>User Details</th>
                  <th>System Identity</th>
                  <th>Role</th>
                  <th>Management</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-base-200">
                    <td>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-base-content/60">{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge badge-sm uppercase text-[10px] font-bold ${u.role === 'superadmin' ? 'badge-error' : u.role === 'admin' ? 'badge-warning' : 'badge-ghost'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-sm ${u.isActive ? 'badge-success' : 'badge-error'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={actionLoading}
                        className="btn btn-square btn-ghost btn-xs text-error hover:bg-error/20"
                        title="Delete User"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-base-content/60">
                      No registration data records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}