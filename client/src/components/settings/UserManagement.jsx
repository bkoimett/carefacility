import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function UserManagement({ isSuperAdmin }) {
  const { getAllUsers, createUser, updateUser, deleteUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userList = await getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'staff' });
      await loadUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await updateUser(editUserId, updateData);
      setShowEditModal(false);
      setFormData({ name: '', email: '', password: '', role: 'staff' });
      setEditUserId(null);
      await loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await deleteUser(userId);
        await loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleEditUser = (user) => {
    setEditUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password for security
      role: user.role
    });
    setShowEditModal(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add User Button (Super Admin only) */}
      {isSuperAdmin && (
        <div className="flex justify-end">
          <button 
            onClick={() => {
              setShowAddModal(true);
              setFormData({ name: '', email: '', password: '', role: 'staff' });
            }}
            className="btn btn-primary"
          >
            Add User
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span 
                    className={`badge ${user.role === 'superadmin' ? 'badge-primary' : user.role === 'admin' ? 'badge-secondary' : 'badge-outline'}`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td>
                  <span 
                    className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-center">
                  <div className="flex justify-center space-x-2">
                    {(isSuperAdmin || (user.role !== 'superadmin' && user.id !== editUserId)) && (
                      <button
                        onClick={() => handleEditUser(user)}
                        className="btn btn-sm btn-outline btn-primary"
                        disabled={user.role === 'superadmin' && !isSuperAdmin}
                      >
                        Edit
                      </button>
                    )}
                    {(isSuperAdmin || (user.role !== 'superadmin' && user.id !== editUserId)) && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="btn btn-sm btn-outline btn-error"
                        disabled={user.role === 'superadmin' && !isSuperAdmin}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center ${showAddModal ? 'block' : 'hidden'}`}
        onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
      >
        <div className="relative w-96 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">Add New User</h3>
            <button 
              onClick={() => setShowAddModal(false)}
              className="btn btn-sm btn-ghost"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="input input-bordered w-full"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="input input-bordered w-full"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={8}
                className="input input-bordered w-full"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Role</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="select select-bordered w-full"
                disabled={!isSuperAdmin && formData.role === 'superadmin'}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                {isSuperAdmin && <option value="superadmin">Super Admin</option>}
              </select>
              {!isSuperAdmin && formData.role === 'superadmin' && (
                <>
                  <p className="text-xs text-red-500 mt-1">
                    Only Super Admins can create Super Admin users
                  </p>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-primary"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit User Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center ${showEditModal ? 'block' : 'hidden'}`}
        onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
      >
        <div className="relative w-96 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">Edit User</h3>
            <button 
              onClick={() => {
                setShowEditModal(false);
                setEditUserId(null);
                setFormData({ name: '', email: '', password: '', role: 'staff' });
              }}
              className="btn btn-sm btn-ghost"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Password (leave blank to keep current)</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="input input-bordered w-full"
                placeholder="Enter new password (optional)"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Role</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="select select-bordered w-full"
                disabled={editUserId && !isSuperAdmin && users.find(u => u.id === editUserId)?.role === 'superadmin'}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                {isSuperAdmin && <option value="superadmin">Super Admin</option>}
              </select>
              {(!isSuperAdmin || (editUserId && users.find(u => u.id === editUserId)?.role === 'superadmin')) && 
                formData.role === 'superadmin' && !isSuperAdmin && (
                  <>
                    <p className="text-xs text-red-500 mt-1">
                      Only Super Admins can assign Super Admin role
                    </p>
                  </>
                )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditUserId(null);
                  setFormData({ name: '', email: '', password: '', role: 'staff' });
                }}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-primary"
              >
                Update User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}