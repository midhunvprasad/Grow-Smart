import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, Mail, Lock, User, ArrowRight, Loader2, 
  Info, AlertCircle, Eye, EyeOff, Sparkles, CheckCircle2 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase';

interface AuthScreenProps {
  onLoginSuccess: (userEmail: string, isMock: boolean) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading and feedback states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for existing session from Supabase on mount
  useEffect(() => {
    async function checkSession() {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          onLoginSuccess(session.user.email || 'user@example.com', false);
        }
      } catch (err) {
        console.error('Error checking Supabase session:', err);
      }
    }
    
    // Also listen for auth changes (useful for OAuth redirects)
    let authListener: any = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          onLoginSuccess(session.user.email || 'user@example.com', false);
        }
      });
      authListener = data?.subscription;
    }

    checkSession();
    return () => {
      if (authListener) authListener.unsubscribe();
    };
  }, [onLoginSuccess]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    if (isSignUp && !fullName) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isSupabaseConfigured && supabase) {
      // Real Supabase Auth Flow
      try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });
          if (error) throw error;
          
          if (data.session) {
            setSuccessMessage('Registration successful! Logging you in...');
            setTimeout(() => {
              onLoginSuccess(email, false);
            }, 1000);
          } else {
            setSuccessMessage('Registration successful! Please check your email inbox for a verification link.');
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (data.user) {
            setSuccessMessage('Welcome back! Loading agronomical portal...');
            setTimeout(() => {
              onLoginSuccess(email, false);
            }, 1000);
          }
        }
      } catch (error: any) {
        setErrorMessage(error.message || 'Authentication failed. Please verify your credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      // Simulated/Local Auth Flow
      setTimeout(() => {
        setLoading(false);
        if (isSignUp) {
          setSuccessMessage('Simulation Account created successfully! Logging you in...');
          setTimeout(() => {
            onLoginSuccess(email, true);
          }, 1200);
        } else {
          // simple validation for mock
          if (email.includes('@') && password.length >= 6) {
            setSuccessMessage('Simulation Welcome back! Syncing dashboard cache...');
            setTimeout(() => {
              onLoginSuccess(email, true);
            }, 1200);
          } else {
            setErrorMessage('Invalid credentials. Password must be at least 6 characters.');
          }
        }
      }, 1000);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isSupabaseConfigured && supabase) {
      // Real Supabase Google Sign-In
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          }
        });
        if (error) throw error;
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to initialize Google Sign-In.');
        setLoading(false);
      }
    } else {
      // Simulated Google Sign-In for instant preview testing
      setTimeout(() => {
        setLoading(false);
        setSuccessMessage('Simulated Google Authentication successful!');
        setTimeout(() => {
          onLoginSuccess('agronomist.preview@gmail.com', true);
        }, 1200);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9faf2] text-text-dark font-sans flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative leaf background highlights */}
      <div className="absolute top-[-100px] right-[-100px] w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-80 h-80 rounded-full bg-[#154212]/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm mx-auto space-y-6 relative z-10">
        
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-flex w-14 h-14 bg-primary text-white items-center justify-center rounded-2xl shadow-lg shadow-primary/20 mx-auto"
          >
            <Leaf className="w-8 h-8" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-text-dark">
              Grow Smart
            </h1>
          </div>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              !isSignUp ? 'bg-white text-primary shadow-sm' : 'text-text-muted'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              isSignUp ? 'bg-white text-primary shadow-sm' : 'text-text-muted'
            }`}
          >
            Create Account
          </button>
        </div>



        {/* Error / Success Notifications */}
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-red-50 border border-red-100 text-red-800 rounded-xl text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium leading-normal">{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium leading-normal">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Credentials Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-3">
            {/* Full Name (Sign Up Only) */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    placeholder="Dr. Alex Rivers"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-text-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">
                Agronomist Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  placeholder="midhunvprasad@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-text-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">
                  Access Password
                </label>
                {!isSignUp && (
                  <button 
                    type="button" 
                    onClick={() => {
                      if (isSupabaseConfigured) {
                        alert('Password reset links require Supabase SMTP configuration. Please see your Supabase Dashboard to recover your account.');
                      } else {
                        alert('In Sandbox/Simulation mode, simply enter any email and a 6+ character password!');
                      }
                    }}
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-bold text-text-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-dark cursor-pointer rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-light text-white font-extrabold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying Biosphere...
              </>
            ) : (
              <>
                {isSignUp ? 'Initialize Agronomist Portal' : 'Access Agronomist Portal'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-[10px] text-text-muted font-black uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Google Sign-In Option */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 bg-white hover:bg-gray-50 text-text-dark font-extrabold rounded-xl border border-gray-200 shadow-sm transition-colors flex items-center justify-center gap-2.5 text-xs cursor-pointer disabled:opacity-50"
        >
          {/* Colorful Google Vector Icon */}
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
        </button>

        {/* Footer info/fine print */}
        <div className="text-center pt-2">
          <p className="text-[10px] text-text-muted leading-relaxed max-w-[280px] mx-auto">
            By accessing this agronomical portal, you agree to connect telemetry gateways and comply with precision agricultural guidelines.
          </p>
        </div>

      </div>
    </div>
  );
}
