import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signIn, signUp, signInWithOAuth, isConfigured } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Destination after authentication (preserves intended page if redirected by ProtectedRoute)
  const fromPath = location.state?.from?.pathname || '/feed';

  // If user is already authenticated, redirect them away from login page
  useEffect(() => {
    if (!loading && user) {
      navigate(fromPath, { replace: true });
    }
  }, [user, loading, navigate, fromPath]);

  const cleanHandle = username.replace(/[^a-zA-Z0-9_]/g, '');
  const isHandleAvailable = cleanHandle.length >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isConfigured) {
        if (authMode === 'login') {
          await signIn({
            email: identifier.trim(),
            password: password,
          });
          setSubmitSuccess(true);
          setTimeout(() => {
            setIsSubmitting(false);
            navigate(fromPath, { replace: true });
          }, 800);
        } else {
          const res = await signUp({
            email: identifier.trim(),
            password: password,
            fullName: fullName.trim(),
            username: cleanHandle,
          });

          // If Supabase has email confirmation enabled, session will be null
          if (!res?.session && res?.user) {
            setSuccessMessage(
              'Account created! A verification link has been sent to your email. Confirm it to log in, or toggle off "Confirm email" in Supabase Auth settings for instant testing.'
            );
            setIsSubmitting(false);
            setAuthMode('login');
            return;
          }

          setSubmitSuccess(true);
          setTimeout(() => {
            setIsSubmitting(false);
            navigate(fromPath, { replace: true });
          }, 800);
        }
      } else {
        // Simulated local fallback if credentials haven't been pasted into .env yet
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsSubmitting(false);
          navigate(fromPath, { replace: true });
        }, 800);
      }
    } catch (err) {
      console.error('[Auth Error]', err);
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (msg.includes('Email not confirmed')) {
        msg = 'Email not confirmed yet. Please click the confirmation link in your inbox, or disable "Confirm email" in Supabase Project Settings -> Auth.';
      }
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider) => {
    setErrorMessage('');
    try {
      if (isConfigured) {
        await signInWithOAuth(provider);
      } else {
        navigate('/feed');
      }
    } catch (err) {
      console.error(`[OAuth ${provider} Error]`, err);
      setErrorMessage(err.message || `Failed to sign in with ${provider}.`);
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-surface text-on-surface selection:bg-primary selection:text-on-primary">
      {/* LEFT PANE: Ambient Cybernetic Brand Showcase */}
      <div className="relative hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 overflow-hidden bg-surface-container-lowest">
        {/* Ambient Visual Background */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-container/20 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] bg-secondary-container/15 rounded-full blur-[140px]"></div>
          <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-tertiary-container/10 rounded-full blur-[100px]"></div>
        </div>

        {/* Tech Grid & Constellation Lines SVG overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cyberGrad" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#1d9bf0" stopOpacity="0.8"></stop>
              <stop offset="60%" stopColor="#98cbff" stopOpacity="0.3"></stop>
              <stop offset="100%" stopColor="#ffb875" stopOpacity="0.6"></stop>
            </linearGradient>
          </defs>
          <path
            d="M 40,120 L 160,240 L 320,180 L 480,290 L 640,160 L 800,280"
            fill="none"
            stroke="url(#cyberGrad)"
            strokeDasharray="3 5"
            strokeWidth="1.2"
          ></path>
          <path
            d="M 120,400 L 260,340 L 380,480 L 590,390 L 720,520"
            fill="none"
            stroke="url(#cyberGrad)"
            strokeWidth="1"
          ></path>
          <path
            d="M 160,240 L 260,340 M 320,180 L 380,480 M 480,290 L 590,390"
            fill="none"
            stroke="#99cbff"
            strokeOpacity="0.25"
            strokeWidth="0.8"
          ></path>
          <circle className="animate-pulse" cx="160" cy="240" fill="#1d9bf0" r="3.5"></circle>
          <circle cx="320" cy="180" fill="#99cbff" r="4.5"></circle>
          <circle cx="480" cy="290" fill="#ffb875" r="3"></circle>
          <circle cx="260" cy="340" fill="#1d9bf0" r="3"></circle>
          <circle cx="590" cy="390" fill="#98cbff" r="4"></circle>
        </svg>

        {/* Brand Header Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/feed" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shadow-lg shadow-primary-container/20">
              <span className="material-symbols-outlined text-surface font-bold text-xl">
                terminal
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
                X Connect
              </span>
              <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">
                Developer & Creator Stream
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/70 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Global Mesh: Operational
            </span>
          </div>
        </div>

        {/* Central Hero Narrative */}
        <div className="relative z-10 my-auto py-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-high text-primary mb-6">
            <span className="material-symbols-outlined text-base">bolt</span>
            <span className="font-label-md text-label-md font-semibold">
              Decentralized Intelligence Feed
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mb-5 leading-none">
            Happening now.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary">
              Where visionaries build the next web.
            </span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-lg">
            Join engineers, researchers, algorithmic artists, and founders sharing real-time insights,
            shipping breakthroughs, and shaping tomorrow.
          </p>

          {/* Dynamic Stat Pill Badges */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            <div className="p-3.5 rounded-2xl bg-surface-container/80 backdrop-blur-md flex flex-col">
              <div className="flex items-center gap-1.5 text-primary mb-1">
                <span className="material-symbols-outlined text-base">code_blocks</span>
                <span className="font-label-sm text-label-sm font-semibold">Devs Online</span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-bold">
                428,910+
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                +12.4% this week
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-container/80 backdrop-blur-md flex flex-col">
              <div className="flex items-center gap-1.5 text-secondary mb-1">
                <span className="material-symbols-outlined text-base">sync_alt</span>
                <span className="font-label-sm text-label-sm font-semibold">Real-Time Sync</span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-bold">
                &lt; 14ms
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Global consensus
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-container/80 backdrop-blur-md flex flex-col">
              <div className="flex items-center gap-1.5 text-tertiary mb-1">
                <span className="material-symbols-outlined text-base">neurology</span>
                <span className="font-label-sm text-label-sm font-semibold">AI Models</span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-bold">
                2.4M
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Active prompts today
              </span>
            </div>
          </div>

          {/* Featured Creator Quote Card */}
          <div className="p-4 rounded-2xl bg-surface-container-low/90 backdrop-blur-md flex items-start gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-surface-container-high">
              <img
                alt="Dr. Elena Vance"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHnZMRPockk9G7HzGtBLoXrsMjfTxxNcck4DsNtynQ36ea2NA4hFBW0-73OVS2DdQLBMcSd9oFKDtvvHOqGDAu0tL6qfZ_9fnRuHv6_5AeIdKl2KSwV7s3G_mD7VNSixZn8IH_cG4iXWaPG1NNIPApy5T9FtNy9QqbiCP-vGwaAYGdPyFeJ8DbV9eg5NCw7OsKZ0E9pdXWpZsBwY7g3tCf49povHPWXlNwxgfOHdM"
              />
            </div>
            <div className="flex flex-col">
              <p className="font-body-md text-body-md text-on-surface italic mb-1.5">
                "X Connect stripped away the noise. The technical discourse and real-time releases here
                have replaced three different developer portals for our entire team."
              </p>
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Dr. Elena Vance
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  @evance • Lead Core Arch at NeuralScale
                </span>
                <span
                  className="material-symbols-outlined text-primary text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Subtext */}
        <div className="relative z-10 flex items-center justify-between font-label-sm text-label-sm text-outline">
          <span>© 2025 X Connect Corporation</span>
          <div className="flex items-center gap-4">
            <a className="hover:text-primary transition-colors" href="#">
              Architecture Status
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Protocol Specs
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Security Audit
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Minimalist Obsidian Auth Form */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 bg-surface min-h-screen">
        <div className="w-full max-w-md flex flex-col">
          {/* Mobile Brand Indicator */}
          <Link to="/feed" className="flex lg:hidden items-center gap-3 mb-8 self-start">
            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-surface font-bold text-lg">
                terminal
              </span>
            </div>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              X Connect
            </span>
          </Link>

          {/* Auth Header */}
          <div className="mb-6">
            <h2 className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight mb-2">
              {authMode === 'login' ? 'Welcome back' : 'Join the mesh'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {authMode === 'login'
                ? 'Log in to enter your curated technical intelligence stream.'
                : 'Start sharing technical milestones with verified engineers.'}
            </p>
          </div>

          {/* Supabase Status Banner if unconfigured */}
          {!isConfigured && (
            <div className="mb-5 p-3 rounded-xl bg-surface-container-high border border-outline-variant/40 flex items-start gap-2.5 text-body-sm">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                info
              </span>
              <div className="text-on-surface-variant">
                <span className="text-on-surface font-semibold">Supabase Setup: </span>
                Add your credentials to <code className="text-primary font-mono text-xs">.env</code> to connect to your live backend. Local test login is active.
              </div>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-2.5 text-body-sm text-emerald-400">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                mark_email_read
              </span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-error-container/30 border border-error/50 flex items-start gap-2.5 text-body-sm text-error">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Interactive Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-surface-container rounded-full mb-6">
            <button
              className={`py-2.5 rounded-full font-label-md text-label-md transition-all duration-200 cursor-pointer ${
                authMode === 'login'
                  ? 'font-semibold text-on-surface bg-surface-container-high shadow-sm'
                  : 'font-medium text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
              }}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`py-2.5 rounded-full font-label-md text-label-md transition-all duration-200 cursor-pointer ${
                authMode === 'signup'
                  ? 'font-semibold text-on-surface bg-surface-container-high shadow-sm'
                  : 'font-medium text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage('');
              }}
              type="button"
            >
              Create Account
            </button>
          </div>

          {/* Social Authentication Stack */}
          <div className="flex flex-col gap-3 mb-5">
            {/* Google Auth */}
            <button
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors font-label-md text-label-md font-semibold text-on-surface group cursor-pointer"
              type="button"
              onClick={() => handleOAuth('google')}
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  fill="#EA4335"
                ></path>
                <path
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"
                  fill="#34A853"
                ></path>
              </svg>
              <span className="group-hover:text-primary transition-colors">
                Continue with Google
              </span>
            </button>

            {/* Apple Auth */}
            <button
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors font-label-md text-label-md font-semibold text-on-surface group cursor-pointer"
              type="button"
              onClick={() => handleOAuth('apple')}
            >
              <svg className="w-5 h-5 flex-shrink-0 fill-current text-on-surface" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.58.67-.99 1.74-.86 2.76 1 .08 2.03-.53 2.56-1.26"></path>
              </svg>
              <span className="group-hover:text-primary transition-colors">
                Continue with Apple
              </span>
            </button>
          </div>

          {/* Subtle Text Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full h-px bg-surface-container-high"></div>
            <span className="absolute px-3 bg-surface font-label-sm text-label-sm text-outline uppercase tracking-wider">
              or continue with email
            </span>
          </div>

          {/* Primary Auth Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Extra dynamic fields for Signup: Name & Handle */}
            {authMode === 'signup' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="fullname">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-xl">
                      badge
                    </span>
                    <input
                      className="w-full pl-11 pr-4 py-3 bg-surface-container rounded-full text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                      id="fullname"
                      placeholder="Ada Lovelace"
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="username">
                      Choose Handle
                    </label>
                    <span
                      className={`font-label-sm text-label-sm ${
                        isHandleAvailable ? 'text-emerald-400' : 'text-outline'
                      }`}
                    >
                      {isHandleAvailable ? `@${cleanHandle} (Available)` : 'Min 3 chars'}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-outline font-semibold font-body-md">@</span>
                    <input
                      className="w-full pl-9 pr-4 py-3 bg-surface-container rounded-full text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                      id="username"
                      placeholder="adalovelace"
                      required
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email or Identifier */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="user-identifier">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-xl">
                  alternate_email
                </span>
                <input
                  className="w-full pl-11 pr-4 py-3 bg-surface-container rounded-full text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  id="user-identifier"
                  placeholder="name@organization.io"
                  required
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="user-password">
                  Password
                </label>
                {authMode === 'login' && (
                  <a className="font-label-sm text-label-sm text-primary hover:underline" href="#">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-xl">
                  lock
                </span>
                <input
                  className="w-full pl-11 pr-11 py-3 bg-surface-container rounded-full text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  id="user-password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute right-3.5 text-outline hover:text-on-surface transition-colors p-1 flex items-center justify-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me / Terms Checkbox */}
            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  checked={rememberMe}
                  className="w-4 h-4 rounded bg-surface-container text-primary-container accent-primary-container focus:ring-0 cursor-pointer"
                  onChange={(e) => setRememberMe(e.target.checked)}
                  type="checkbox"
                />
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Remember this device
                </span>
              </label>
              <div className="flex items-center gap-1 text-outline">
                <span className="material-symbols-outlined text-sm">shield</span>
                <span className="font-label-sm text-label-sm">256-bit encryption</span>
              </div>
            </div>

            {/* Primary Pill Submit Button */}
            <button
              className={`w-full mt-3 py-3.5 px-6 rounded-full font-label-lg text-label-lg font-bold transition-all duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                submitSuccess
                  ? 'bg-emerald-500 text-black'
                  : 'bg-primary-container text-on-primary-container hover:brightness-110 active:scale-[0.99] shadow-primary-container/25'
              }`}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                  <span>Authenticating node...</span>
                </>
              ) : submitSuccess ? (
                <>
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  <span>Authenticated! Redirecting...</span>
                </>
              ) : authMode === 'signup' ? (
                <>
                  <span>Create your account</span>
                  <span className="material-symbols-outlined text-lg">rocket_launch</span>
                </>
              ) : (
                <>
                  <span>Sign in to X Connect</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Mode Switcher */}
          <div className="mt-8 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              {authMode === 'login' ? (
                <>
                  Don't have an account yet?{' '}
                  <button
                    className="text-primary font-bold hover:underline ml-1 cursor-pointer"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage('');
                    }}
                    type="button"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    className="text-primary font-bold hover:underline ml-1 cursor-pointer"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage('');
                    }}
                    type="button"
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Legal Disclaimer & Terms */}
          <div className="mt-10 pt-6 bg-surface text-center">
            <p className="font-label-sm text-label-sm text-outline leading-relaxed max-w-sm mx-auto">
              By proceeding, you agree to our{' '}
              <a className="text-on-surface-variant hover:text-primary transition-colors underline" href="#">
                Terms of Service
              </a>
              ,{' '}
              <a className="text-on-surface-variant hover:text-primary transition-colors underline" href="#">
                Privacy Policy
              </a>
              , and{' '}
              <a className="text-on-surface-variant hover:text-primary transition-colors underline" href="#">
                Cookie Authentication Protocol
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
