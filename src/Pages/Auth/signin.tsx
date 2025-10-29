import React, { useCallback, useState, type FormEvent } from 'react';
import { FaRegEye, FaRegEyeSlash, FaRegUserCircle } from 'react-icons/fa';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

const SignIn: React.FC = () => {
  const [eyeOpen, setEyeOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // TODO: re-enable when config is ready
  // useEffect(() => {
  //   axios.get('./config.json').then((res) => {
  //     const api = res.data.apiUrl;
  //     setIpAddress(api);
  //     sessionStorage.setItem('ipAddress', api);
  //     // dispatch(ApiAddress(api));
  //   }).catch(() => setError('Failed to load config. Please refresh.'));
  // }, [dispatch]);

  const toggleEye = () => setEyeOpen((p) => !p);

  const checkAuthentication = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError('');
      setLoading(true);

      const dataBody = { user: userName, password };

      if (userName === 'admin' && password === 'admin') {
        const from = (location as any).state?.from?.pathname || '/Request';
        navigate(from, { replace: true });
      } else {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
        return;
      } 
    },
    [userName, password, location, navigate]
  );

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#0b1320] relative flex items-center justify-center">
      {/* faint radial glow */}
      <div className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(800px 400px at 50% 20%, rgba(59,130,246,0.20), transparent 60%)'
        }}
      />

      <div className="relative z-10 w-[90%] max-w-md rounded-2xl border border-[#2a3550] bg-white/5 backdrop-blur-md shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <img
            src="./img/Logo.png"
            alt="Saurbhi Media"
            width={84}
            height={64}
            loading="lazy"
            onError={(e) => {
              const fallback = './img/logo.png';
              if (!e.currentTarget.src.endsWith('logo.png')) e.currentTarget.src = fallback;
              else e.currentTarget.style.display = 'none';
            }}
            className="drop-shadow"
          />
        </div>

        <form onSubmit={checkAuthentication} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">User Name</label>
            <div className="relative">
              <input
                required
                autoFocus
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your user name"
                className="w-full rounded-xl border border-transparent bg-white/5 py-3 pl-4 pr-10 text-gray-100 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaRegUserCircle className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                required
                type={eyeOpen ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-transparent bg-white/5 py-3 pl-4 pr-10 text-gray-100 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                aria-label={eyeOpen ? 'Hide password' : 'Show password'}
                aria-pressed={eyeOpen}
                onClick={toggleEye}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-100 focus:outline-none"
              >
                {eyeOpen ? <FaRegEyeSlash className="h-5 w-5" /> : <FaRegEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm px-3 py-2"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold text-white
                       bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#0b1320]
                       transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                  <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" />
                </svg>
                Signing In…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
