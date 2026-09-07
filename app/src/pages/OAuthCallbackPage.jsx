import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const errorMessages = {
  account_inactive: 'This Applyr account has been deactivated.',
  identity_unavailable: 'Google did not provide a verified email address.',
  google_sign_in_failed: 'Google sign-in was cancelled or could not be completed.',
};

export default function OAuthCallbackPage() {
  const [error, setError] = useState('');
  const exchangeStarted = useRef(false);
  const { completeGoogleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const providerError = params.get('error');

    // Remove the one-time code from browser history before making requests.
    window.history.replaceState({}, '', '/oauth/callback');

    if (providerError) {
      setError(errorMessages[providerError] || 'Google sign-in could not be completed.');
      return;
    }

    if (!code) {
      setError('The Google sign-in response is missing its login code.');
      return;
    }

    completeGoogleLogin(code)
      .then(() => navigate('/', { replace: true }))
      .catch((requestError) => {
        setError(
          requestError.response?.data?.message
            || 'The Google sign-in link expired. Please try again.'
        );
      });
  }, [completeGoogleLogin, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-xl p-6 text-center shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
        <div className="font-bold text-[22px] tracking-widest dark:text-white mb-5">Applyr</div>
        {error ? (
          <>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-[12px] mb-5">
              {error}
            </div>
            <Link
              to="/login"
              className="inline-block border-2 border-[#111] dark:border-gray-700 rounded-md bg-[#111] dark:bg-white text-white dark:text-[#111] px-4 py-2 text-[12px] font-bold"
            >
              Return to sign in
            </Link>
          </>
        ) : (
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
            Completing Google sign-in…
          </p>
        )}
      </div>
    </div>
  );
}
