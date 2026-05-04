import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProfile({ name, email });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaving(true);
    try {
      await changePassword(passwordForm);
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.errors?.current_password?.[0] || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="font-bold text-[20px] tracking-widest dark:text-white">Profile & Settings</h1>

      <div className="neu-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 dark:text-gray-400" />
          <h2 className="font-bold text-[14px] dark:text-white">Personal Information</h2>
        </div>

        {error && (
          <div className="p-2 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-[12px]">
            {error}
          </div>
        )}

        {saved && (
          <div className="p-2 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded text-green-700 dark:text-green-300 text-[12px] flex items-center gap-2">
            <Check className="w-3 h-3" /> Profile updated successfully
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="neu-label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="neu-input"
              required
            />
          </div>
          <div>
            <label className="neu-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neu-input"
              required
            />
          </div>
          <button type="submit" disabled={saving} className="neu-btn text-[12px]">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="neu-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 dark:text-gray-400" />
          <h2 className="font-bold text-[14px] dark:text-white">Change Password</h2>
        </div>

        {passwordError && (
          <div className="p-2 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-[12px]">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="p-2 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded text-green-700 dark:text-green-300 text-[12px] flex items-center gap-2">
            <Check className="w-3 h-3" /> Password changed successfully
          </div>
        )}

        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="neu-label">Current Password</label>
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              className="neu-input"
              required
            />
          </div>
          <div>
            <label className="neu-label">New Password</label>
            <input
              type="password"
              value={passwordForm.password}
              onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
              className="neu-input"
              required
            />
          </div>
          <div>
            <label className="neu-label">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.password_confirmation}
              onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
              className="neu-input"
              required
            />
          </div>
          <button type="submit" disabled={passwordSaving} className="neu-btn text-[12px]">
            {passwordSaving ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}