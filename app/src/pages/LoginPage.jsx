import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password, form.password_confirmation);
      } else {
        await login(form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

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
          <h2 className="font-bold text-[16px] mb-6 text-center dark:text-gray-200">
            {isRegister ? 'Create an Account' : 'Sign In'}
          </h2>
          {error && (
            <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-[12px]">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="mb-4">
                <label className="neu-label">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={setField('name')}
                  className="neu-input"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="neu-label">Email Address</label>
              <input
                required
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={setField('email')}
                className="neu-input"
              />
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <label className="neu-label">Password</label>
                {!isRegister && (
                  <a href="#" className="text-[10px] text-gray-500 hover:text-[#111] dark:hover:text-white hover:underline">
                    Forgot?
                  </a>
                )}
              </div>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={setField('password')}
                className="neu-input"
              />
            </div>
            {isRegister && (
              <div className="mb-6">
                <label className="neu-label">Confirm Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={form.password_confirmation}
                  onChange={setField('password_confirmation')}
                  className="neu-input"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full border-2 border-[#111] dark:border-gray-700 rounded-md bg-[#111] dark:bg-white text-white dark:text-[#111] p-2.5 font-bold hover:bg-white dark:hover:bg-[#eee] hover:text-[#111] transition-colors shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isRegister ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center border-t border-dashed border-gray-300 dark:border-gray-800 pt-5">
            <p className="text-[11px] text-gray-500 mb-3">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="border-2 border-[#111] dark:border-gray-700 rounded-md bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white px-4 py-1.5 text-[11px] font-bold hover:bg-gray-50 dark:hover:bg-[#222] transition-colors shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]"
            >
              {isRegister ? 'Sign In' : 'Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}