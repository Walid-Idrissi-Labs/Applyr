import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { Users, Trash2, UserX, UserCheck, Crown, Search, Plus, Edit, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search for Users
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // User Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', is_admin: false, is_active: true });
  const [formError, setFormError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  const openConfirm = (options) => {
    return new Promise((resolve) => {
      setConfirmDialog({ isOpen: true, resolve, ...options });
    });
  };

  const handleConfirmDialogConfirm = () => {
    confirmDialog.resolve?.(true);
    setConfirmDialog({ isOpen: false });
  };

  const handleConfirmDialogCancel = () => {
    confirmDialog.resolve?.(false);
    setConfirmDialog({ isOpen: false });
  };

  useEffect(() => {
    loadData();
  }, [currentPage, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const u = await adminAPI.getUsers({ page: currentPage, search: searchQuery });
      setUsers(u.data.data || u.data);
      setTotalPages(u.data.last_page || 1);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    await adminAPI.deactivate(id);
    loadData();
  };

  const handleActivate = async (id) => {
    await adminAPI.activate(id);
    loadData();
  };

  const handleGrantAdmin = async (id) => {
    await adminAPI.grantAdmin(id);
    loadData();
  };

  const handleRevokeAdmin = async (id) => {
    await adminAPI.revokeAdmin(id);
    loadData();
  };

  const handleDeleteUser = async (id) => {
    const confirmed = await openConfirm({
      title: 'Delete User',
      message: 'Permanently delete this user and ALL their data? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    await adminAPI.deleteUser(id);
    loadData();
  };

  const openAddUserModal = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', is_admin: false, is_active: true });
    setFormError('');
    setShowModal(true);
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, is_admin: user.is_admin, is_active: user.is_active });
    setFormError('');
    setShowModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, userForm);
      } else {
        await adminAPI.createUser(userForm);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'An error occurred while saving the user.');
    }
  };

  if (loading && users.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="font-bold dark:text-white">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5 dark:text-white" />
        <h1 className="font-bold text-[20px] tracking-widest dark:text-white">User Management</h1>
      </div>

      <div className="neu-card overflow-hidden">
        <div className="p-3 border-b-2 border-[#111] dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] flex justify-between items-center">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-[12px] rounded-md border-2 border-[#111] dark:border-gray-700 bg-white dark:bg-[#0a0a0a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[12px] dark:text-white">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button onClick={openAddUserModal} className="flex items-center gap-2 px-3 py-1.5 bg-[#111] text-white dark:bg-white dark:text-[#111] text-[12px] font-bold rounded-md hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#111] dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a]">
              <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">User</th>
              <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Role</th>
              <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Applications</th>
              <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Joined</th>
              <th className="text-right p-3 font-bold text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <td className="p-3">
                  <div className="font-bold dark:text-white">{u.name}</div>
                  <div className="text-[11px] text-gray-400">{u.email}</div>
                </td>
                <td className="p-3">
                  {u.is_admin ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Admin</span>
                  ) : (
                    <span className="text-[10px] text-gray-400">User</span>
                  )}
                </td>
                <td className="p-3">
                  {u.is_active ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">Inactive</span>
                  )}
                </td>
                <td className="p-3 text-center dark:text-gray-300">{u.applications_count || 0}</td>
                <td className="p-3 text-gray-500 dark:text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2 flex-wrap">
                    <button onClick={() => openEditUserModal(u)} className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"><Edit className="w-3 h-3" /> Edit</button>
                    {u.is_admin
                      ? <button onClick={() => handleRevokeAdmin(u.id)} className="text-[11px] font-bold text-yellow-600 hover:underline flex items-center gap-1"><Crown className="w-3 h-3" /> Revoke</button>
                      : <button onClick={() => handleGrantAdmin(u.id)} className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"><Crown className="w-3 h-3" /> Grant</button>
                    }
                    {u.is_active
                      ? <button onClick={() => handleDeactivate(u.id)} className="text-[11px] font-bold text-orange-600 hover:underline flex items-center gap-1"><UserX className="w-3 h-3" /> Deactivate</button>
                      : <button onClick={() => handleActivate(u.id)} className="text-[11px] font-bold text-green-600 hover:underline flex items-center gap-1"><UserCheck className="w-3 h-3" /> Activate</button>
                    }
                    <button onClick={() => handleDeleteUser(u.id)} className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400 dark:text-gray-600">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-xl w-full max-w-md border-2 border-[#111] dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b-2 border-[#111] dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#1a1a1a] rounded-t-lg">
              <h2 className="font-bold text-[16px] dark:text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-[#111] dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 border-2 border-red-200 rounded text-[12px] font-bold">
                  {formError}
                </div>
              )}
              
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-gray-700 dark:text-gray-300">Name</label>
                <input 
                  type="text" 
                  value={userForm.name}
                  onChange={e => setUserForm({...userForm, name: e.target.value})}
                  required
                  className="px-3 py-2 rounded-md border-2 border-[#111] dark:border-gray-600 bg-white dark:bg-[#1a1a1a] dark:text-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-gray-700 dark:text-gray-300">Email Address</label>
                <input 
                  type="email" 
                  value={userForm.email}
                  onChange={e => setUserForm({...userForm, email: e.target.value})}
                  required
                  className="px-3 py-2 rounded-md border-2 border-[#111] dark:border-gray-600 bg-white dark:bg-[#1a1a1a] dark:text-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-400"
                />
              </div>

              {!editingUser && (
                <div className="text-[11px] text-gray-500 bg-gray-50 dark:bg-[#1a1a1a] p-2 rounded border border-gray-200 dark:border-gray-700">
                  A randomly generated password will be sent to the user's email address.
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="is_admin"
                  checked={userForm.is_admin}
                  onChange={e => setUserForm({...userForm, is_admin: e.target.checked})}
                  className="w-4 h-4 border-2 border-[#111] rounded text-[#111] focus:ring-[#111]"
                />
                <label htmlFor="is_admin" className="text-[14px] font-bold dark:text-white cursor-pointer">
                  Administrator Privileges
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="is_active"
                  checked={userForm.is_active}
                  onChange={e => setUserForm({...userForm, is_active: e.target.checked})}
                  className="w-4 h-4 border-2 border-[#111] rounded text-[#111] focus:ring-[#111]"
                />
                <label htmlFor="is_active" className="text-[14px] font-bold dark:text-white cursor-pointer">
                  Account Active
                </label>
              </div>

              <div className="mt-4 flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-[14px] border-2 border-[#111] dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 font-bold text-[14px] bg-[#111] text-white dark:bg-white dark:text-[#111] rounded-md hover:opacity-90 transition-opacity"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirmDialogConfirm}
        onCancel={handleConfirmDialogCancel}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
      />
    </div>
  );
}