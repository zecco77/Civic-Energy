import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';
import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/profile';

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          // Try to sign up if login fails
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });
          if (signUpError) throw signUpError;
        } else {
          throw signInError;
        }
      }
      
      navigate(from);
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + from
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to log in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg text-primary">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-16">
            <Logo inverse className="h-8 w-auto" />
          </Link>
          
          <h1 className="text-5xl font-semibold tracking-tight mb-4">Welcome back</h1>
          <p className="text-xl text-white/60 mb-16">Your savings dashboard is waiting.</p>
          
          <div className="space-y-8">
            <div>
              <div className="text-3xl font-semibold text-white/90 mb-1 tracking-tight">1,240+</div>
              <div className="text-sm text-white/60">Chicago buildings analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white/90 mb-1 tracking-tight">$42.8M</div>
              <div className="text-sm text-white/60">Total savings identified</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white/90 mb-1 tracking-tight">28%</div>
              <div className="text-sm text-white/60">Average ROI across completed projects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-primary tracking-tight">Log in to Civic Energy</h2>
          </div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <label className="sr-only" htmlFor="email">Email address</label>
              <input 
                id="email" 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary placeholder-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="you@company.com" 
              />
            </div>
            
            <div className="relative">
              <label className="sr-only" htmlFor="password">Password</label>
              <input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary placeholder-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50 pr-12" 
                placeholder="Your password" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/60 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="flex items-center justify-end">
              <a href="#" className="text-sm font-medium text-primary hover:text-primary">
                Forgot password?
              </a>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-dark disabled:bg-primary/50 text-white px-4 py-3 rounded-full font-medium text-lg transition-colors shadow-sm"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-primary/40">or</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-black/10 hover:bg-black/5 text-primary px-4 py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button className="w-full bg-white border border-black/10 hover:bg-black/5 text-primary px-4 py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-3 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
                <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
                <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
                <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
              </svg>
              Continue with Microsoft
            </button>
          </div>
          
          <p className="text-center text-sm text-primary/60">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary underline underline-offset-4">
              Create one free
            </Link>
          </p>

          <div className="pt-6 border-t border-black/5">
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 text-sm font-medium text-primary/60 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back to home page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
