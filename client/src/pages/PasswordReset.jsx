import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const TILE_URLS_1 = [
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80',
];

const TILE_URLS_2 = [
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80',
  'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400&q=80',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=80',
  'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&q=80',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=80',
  'https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=400&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80',
];

const TILE_URLS_3 = [
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
  'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=80',
  'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&q=80',
  'https://images.unsplash.com/photo-1550439062-609e1531270e?w=400&q=80',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80',
];

export default function PasswordReset() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [step, setStep] = useState(token ? 'reset' : 'forgot');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recipientHint, setRecipientHint] = useState('');
  const { forgotPassword, resetPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const FALLBACK_TILE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='300' height='400' fill='%230b0b0f'/%3E%3C/svg%3E";

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email, window.location.origin);
      setRecipientHint(response?.recipientHint || email);
      addToast('Reset email sent. Check your inbox!', 'success');
      setStep('check-email');
    } catch (error) {
      addToast(error?.message || 'Failed to send reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      addToast('Please fill all fields', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password, confirmPassword);
      addToast('Password reset successfully! Please login.', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      addToast(error?.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-[#0a0a0a]">
      {/* LEFT: SCROLLING IMAGE GRID */}
      <div className="hidden lg:flex relative w-[45%] h-full overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[200vh] grid grid-cols-3 gap-3 p-4">
          <div className="flex flex-col gap-3 animate-scroll-up">
            {[...TILE_URLS_1, ...TILE_URLS_1].map((url, i) => (
              <img
                key={`c1-${i}`}
                src={url}
                alt="Tech inspiration"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_TILE;
                }}
                className="w-full object-cover rounded-lg transition-transform hover:scale-105"
                style={{ aspectRatio: '3/4' }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3 animate-scroll-down">
            {[...TILE_URLS_2, ...TILE_URLS_2].map((url, i) => (
              <img
                key={`c2-${i}`}
                src={url}
                alt="Tech and coding"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_TILE;
                }}
                className="w-full object-cover rounded-lg transition-transform hover:scale-105"
                style={{ aspectRatio: '3/4' }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3 animate-scroll-up" style={{ animationDelay: '-15s' }}>
            {[...TILE_URLS_3, ...TILE_URLS_3].map((url, i) => (
              <img
                key={`c3-${i}`}
                src={url}
                alt="Tech and coding"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_TILE;
                }}
                className="w-full object-cover rounded-lg transition-transform hover:scale-105"
                style={{ aspectRatio: '3/4' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: FORM MODAL */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          className="w-full max-w-[380px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-black text-lg bg-white shadow-[0_0_24px_rgba(255,255,255,0.25)]">
              T+
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white">TECHPLUS</h1>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 sm:px-8 py-8">
              
              {step === 'forgot' && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-900">
                    Forgot Password?
                  </h2>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 mt-6 rounded-full font-bold text-white bg-[#a855f7] hover:bg-[#9333ea] transition-all disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Reset Email'}
                    </button>
                    
                    <div className="text-center mt-4">
                        <button
                          type="button"
                          onClick={() => navigate('/login')}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                        >
                          Back to Login
                        </button>
                    </div>
                  </form>
                </>
              )}

              {step === 'check-email' && (
                <>
                  <h2 className="text-2xl sm:text-2xl font-bold text-center mb-4 text-gray-900">
                    Check Your Email
                  </h2>
                  <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
                    We've sent a password reset link to <strong>{recipientHint || email}</strong>. Click the link to proceed.
                  </p>
                  <button
                    onClick={() => setStep('forgot')}
                    className="w-full py-3 mt-2 rounded-full font-bold text-[#a855f7] bg-purple-50 hover:bg-purple-100 transition-all border border-purple-100"
                  >
                    Send Another Email
                  </button>
                  <div className="text-center mt-6">
                        <button
                          type="button"
                          onClick={() => navigate('/login')}
                          className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                        >
                          Back to Login
                        </button>
                    </div>
                </>
              )}

              {step === 'reset' && token && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-900">
                    Reset Password
                  </h2>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM6.06 6.06a2 2 0 012.828 0A2 2 0 106.06 6.06zM12 12a2 2 0 110-4 2 2 0 010 4zM2 10a8 8 0 1114.32 4.906l-5.228-5.228A4 4 0 004 10H2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM6.06 6.06a2 2 0 012.828 0A2 2 0 106.06 6.06zM12 12a2 2 0 110-4 2 2 0 010 4zM2 10a8 8 0 1114.32 4.906l-5.228-5.228A4 4 0 004 10H2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 mt-6 rounded-full font-bold text-white bg-[#a855f7] hover:bg-[#9333ea] transition-all disabled:opacity-50"
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-scroll-up {
          animation: scroll-up 25s linear infinite;
        }
        .animate-scroll-down {
          animation: scroll-down 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
