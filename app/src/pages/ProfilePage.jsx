import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Check, AlertTriangle } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, sendVerificationEmail } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verificationSending, setVerificationSending] = useState(false);

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

  const handleSendVerification = async () => {
    setVerificationError('');
    setVerificationStatus('');
    setVerificationSending(true);
    try {
      const res = await sendVerificationEmail();
      setVerificationStatus(res.data?.message || 'Verification link sent.');
    } catch (err) {
      setVerificationError(err.response?.data?.message || 'Unable to send verification email');
    } finally {
      setVerificationSending(false);
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto h-full flex flex-col transition-colors duration-300 space-y-6">
      <h1 className="font-bold text-[20px] flex items-center gap-2 dark:text-white tracking-widest"><User className="w-5 h-5" /> My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2">
                  {user?.email_verified_at ? (
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-[12px] dark:text-gray-200">Email verification</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {user?.email_verified_at
                        ? 'Your email is verified.'
                        : 'Your email is not verified yet.'}
                    </div>
                  </div>
                </div>
                {!user?.email_verified_at && (
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={verificationSending}
                    className="neu-btn text-[11px] px-3 py-1.5"
                  >
                    {verificationSending ? 'Sending...' : 'Send link'}
                  </button>
                )}
              </div>
              {verificationStatus && (
                <div className="mt-2 text-[11px] text-green-700 dark:text-green-300">
                  {verificationStatus}
                </div>
              )}
              {verificationError && (
                <div className="mt-2 text-[11px] text-red-700 dark:text-red-300">
                  {verificationError}
                </div>
              )}
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
    </div>
  );
}