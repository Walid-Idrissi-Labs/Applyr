import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionRestorationFailed, setSessionRestorationFailed] = useState(false);
  const [postAuthTransition, setPostAuthTransition] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      authAPI.getUser()
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setSessionRestorationFailed(true);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user, token } = res.data;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setPostAuthTransition(true);
    setUser(user);
    return user;
  };

  const register = async (name, email, password, password_confirmation) => {
    const res = await authAPI.register({ name, email, password, password_confirmation });
    const { user, token } = res.data;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setPostAuthTransition(true);
    setUser(user);
    return user;
  };

  const completeGoogleLogin = async (code) => {
    const res = await authAPI.exchangeGoogleCode(code);
    const { user, token } = res.data;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setPostAuthTransition(true);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setPostAuthTransition(false);
    setUser(null);
  };

  const consumePostAuthTransition = useCallback(() => {
    setPostAuthTransition(false);
  }, []);

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    setUser(res.data);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  };

  const changePassword = async (data) => {
    const res = await authAPI.changePassword(data);
    if (res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const sendVerificationEmail = async () => {
    return authAPI.sendVerificationEmail();
  };

  const verifyEmail = async (data) => {
    const res = await authAPI.verifyEmail(data);
    const token = localStorage.getItem('auth_token');
    if (token && res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, loading, sessionRestorationFailed, postAuthTransition, consumePostAuthTransition, login, register, completeGoogleLogin, logout, updateProfile, changePassword, sendVerificationEmail, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
