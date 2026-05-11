import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { user, verifyEmail, sendVerificationEmail } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ email: '', token: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [resendError, setResendError] = useState('');
  const [resendSending, setResendSending] = useState(false);
  const hasAttempted = useRef(false);

  useEffect(() => {
    const email = searchParams.get('email') || '';
    const token = searchParams.get('token') || '';
    setForm({ email, token });
    hasAttempted.current = false;
    if (!email || !token) {
      setError('This verification link is incomplete. Please request a new one.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!form.email || !form.token || hasAttempted.current) return;
    hasAttempted.current = true;
    handleVerify();
  }, [form.email, form.token]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);
    if (!form.email || !form.token) {
      setError('This verification link is invalid. Please request a new one.');
      setLoading(false);
      return;
    }
    try {
      const res = await verifyEmail({
        email: form.email.trim(),
        token: form.token.trim(),
      });
      setStatus(res.data?.message || 'Email verified successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message
          || err.response?.data?.errors?.token?.[0]
          || 'Unable to verify email'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendError('');
    setResendStatus('');
    setResendSending(true);
    try {
      const res = await sendVerificationEmail();
      setResendStatus(res.data?.message || 'Verification link sent.');
    } catch (err) {
      setResendError(err.response?.data?.message || 'Unable to send verification email');
    } finally {
      setResendSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-sm bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-xl shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] flex flex-col overflow-hidden">
        <div className="bg-gray-50 dark:bg-[#1a1a1a] border-b-2 border-[#111] dark:border-gray-800 p-5 text-center shrink-0 flex justify-between items-center">
          <div className="w-8" />
          <h1 className="font-bold text-[22px] tracking-widest dark:text-white">Applyr</h1>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 dark:text-white" />}
          </button>
        </div>
        <div className="p-6">
          <h2 className="font-bold text-[16px] mb-4 text-center dark:text-gray-200">Verify your email</h2>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-5 text-center">
            We will verify your email automatically when you open this link.
          </p>
          {loading && (
            <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-800 rounded-md text-blue-700 dark:text-blue-300 text-[12px]">
              Verifying your email...
            </div>
          )}
          {status && (
            <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded-md text-green-700 dark:text-green-300 text-[12px]">
              {status}
            </div>
          )}
          {error && (
            <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-[12px]">
              {error}
            </div>
          )}
          {!loading && !status && !error && (
            <div className="mb-4 text-[12px] text-gray-500 dark:text-gray-400 text-center">
              Waiting for verification link details...
            </div>
          )}
          {!user?.email_verified_at && user && (
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
              <div className="text-[11px] text-gray-600 dark:text-gray-400 mb-2">
                Need a new verification link?
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendSending}
                className="neu-btn text-[11px] px-3 py-1.5"
              >
                {resendSending ? 'Sending...' : 'Resend verification link'}
              </button>
              {resendStatus && (
                <div className="mt-2 text-[11px] text-green-700 dark:text-green-300">
                  {resendStatus}
                </div>
              )}
              {resendError && (
                <div className="mt-2 text-[11px] text-red-700 dark:text-red-300">
                  {resendError}
                </div>
              )}
            </div>
          )}
          <div className="mt-6 text-center border-t border-dashed border-gray-300 dark:border-gray-800 pt-5">
            <Link
              to={user ? '/dashboard' : '/login'}
              className="border-2 border-[#111] dark:border-gray-700 rounded-md bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white px-4 py-1.5 text-[11px] font-bold hover:bg-gray-50 dark:hover:bg-[#222] transition-colors shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]"
            >
              {user ? 'Back to dashboard' : 'Back to sign in'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
