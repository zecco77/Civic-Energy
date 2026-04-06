import { Eye, EyeOff, Search, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';
import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/profile';

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: '', color: 'bg-black/10', width: '0%' };
    if (password.length < 6) return { label: 'Weak', color: 'bg-rose-500', width: '33%' };
    if (password.length < 10) return { label: 'Fair', color: 'bg-yellow-500', width: '66%' };
    return { label: 'Strong', color: 'bg-primary', width: '100%' };
  };

  const strength = getPasswordStrength();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: `${firstName} ${lastName}`,
        createdAt: new Date().toISOString()
      });
      
      setStep(2); // Proceed to step 2
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date().toISOString()
      }, { merge: true });

      navigate(from);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google');
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
          
          <h1 className="text-5xl font-semibold tracking-tight mb-4">Find out what your building is losing today.</h1>
          <p className="text-xl text-white/60 mb-16">Join Chicago building owners who've identified over $42.8 million in recoverable energy costs.</p>
          
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-white/80 italic mb-4">"Identified $84,000 in annual waste for our River North office in 3 minutes."</p>
              <p className="text-sm text-white/90 font-medium">— Property Manager, 45,000 sq ft mixed-use building</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-white/80 italic mb-4">"The contractor marketplace saved us 3 weeks of vetting and bidding."</p>
              <p className="text-sm text-white/90 font-medium">— Facility Director, Loop High-Rise</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-white/80 italic mb-4">"Finally, energy data presented in dollars instead of BTUs."</p>
              <p className="text-sm text-white/90 font-medium">— Portfolio Owner, West Loop</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-primary tracking-tight">
              {step === 1 ? 'Create your free account' : 'Tell us about your building'}
            </h2>
            {step === 2 && (
              <p className="text-primary/60 mt-2">This helps us pre-load your analysis.</p>
            )}
          </div>
          
          {step === 1 ? (
            <>
              <form className="space-y-6" onSubmit={handleSignup}>
                {error && (
                  <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="sr-only" htmlFor="firstName">First Name</label>
                    <input 
                      id="firstName" 
                      type="text" 
                      required 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary placeholder-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      placeholder="First name" 
                    />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor="lastName">Last Name</label>
                    <input 
                      id="lastName" 
                      type="text" 
                      required 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary placeholder-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      placeholder="Last name" 
                    />
                  </div>
                </div>

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
                
                <div className="space-y-2">
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
                  {password.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-grow bg-black/5 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }}></div>
                      </div>
                      <span className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="sr-only" htmlFor="confirmPassword">Confirm Password</label>
                  <input 
                    id="confirmPassword" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary placeholder-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    placeholder="Confirm password" 
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input 
                    id="terms" 
                    type="checkbox" 
                    required 
                    className="mt-1 rounded bg-bg border-black/10 text-primary focus:ring-primary" 
                  />
                  <label htmlFor="terms" className="text-sm text-primary/60">
                    I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent-dark disabled:bg-primary/50 text-white px-4 py-3 rounded-full font-medium text-lg transition-colors shadow-sm"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
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
                  onClick={handleGoogleSignup}
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

              </div>
              
              <p className="text-center text-sm text-primary/60">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary hover:text-primary underline underline-offset-4">
                  Log in
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
            </>
          ) : (
            <form className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-primary/60 mb-1">Building Address</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <input 
                    type="text" 
                    className="w-full bg-bg border border-black/5 rounded-xl pl-12 pr-4 py-3 text-primary placeholder-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    placeholder="Enter Chicago address" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary/60 mb-1">Building Type</label>
                <select defaultValue="" className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                  <option value="" disabled>Select type</option>
                  <option value="office">Office</option>
                  <option value="retail">Retail</option>
                  <option value="industrial">Industrial</option>
                  <option value="mixed">Mixed Use</option>
                  <option value="multifamily">Multifamily</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary/60 mb-1">Approximate Square Footage</label>
                <select defaultValue="" className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                  <option value="" disabled>Select size</option>
                  <option value="under50k">Under 50,000 sq ft</option>
                  <option value="50k-100k">50,000 - 100,000 sq ft</option>
                  <option value="100k-250k">100,000 - 250,000 sq ft</option>
                  <option value="over250k">Over 250,000 sq ft</option>
                </select>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <button 
                  type="button" 
                  onClick={() => navigate(from)}
                  className="w-full bg-accent hover:bg-accent-dark text-white px-4 py-3 rounded-full font-medium text-lg transition-colors shadow-sm"
                >
                  {from === '/dashboard' ? 'Continue to Dashboard' : 'Go to My Profile'}
                </button>
                <button 
                  type="button"
                  onClick={() => navigate(from)}
                  className="text-sm text-primary/60 hover:text-primary transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
