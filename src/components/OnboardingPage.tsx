import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { ArrowLeft, ArrowRight, Building2, User, Users, Check, Upload, BarChart3, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [userType, setUserType] = useState<string>('');
  
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    company: '',
    jobTitle: ''
  });

  const [buildingInfo, setBuildingInfo] = useState({
    address: '',
    type: '',
    size: ''
  });

  const [relationship, setRelationship] = useState({
    ownBuilding: false,
    manageBuilding: false,
    representClients: false,
    propertyCompany: '',
    buildingsAnnually: '',
    billUploaded: false
  });

  const [goals, setGoals] = useState<string[]>([]);
  
  const [energyProfile, setEnergyProfile] = useState({
    annualSpend: '',
    audit: '',
    billUploaded: false
  });

  const totalSteps = 8;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    } else {
      navigate('/home');
    }
  };

  const finishOnboarding = async (finalAction: string) => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'onboarding', auth.currentUser.uid), {
          userType,
          userInfo,
          buildingInfo,
          relationship,
          goals,
          energyProfile,
          finalAction,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      navigate('/profile');
    } catch (e) {
      console.error(e);
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-primary mb-3">Welcome to Civic Energy</h2>
              <p className="text-lg text-primary/60">What best describes you?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'owner', label: 'Building Owner', icon: Building2 },
                { id: 'manager', label: 'Property Manager', icon: User },
                { id: 'consultant', label: 'Energy Consultant / Energy Firm', icon: Users }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setUserType(type.id)}
                  className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all ${
                    userType === type.id 
                      ? 'border-accent bg-accent/5' 
                      : 'border-black/5 bg-white hover:border-black/20'
                  }`}
                >
                  <type.icon className={`w-12 h-12 mb-4 ${userType === type.id ? 'text-accent' : 'text-primary/40'}`} />
                  <span className={`font-medium text-center ${userType === type.id ? 'text-accent' : 'text-primary/80'}`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-w-xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-primary mb-3">Your Information</h2>
              <p className="text-lg text-primary/60">Let's get to know you better</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Full Name</label>
                <input
                  type="text"
                  value={userInfo.fullName}
                  onChange={e => setUserInfo({...userInfo, fullName: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Work Email</label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={e => setUserInfo({...userInfo, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Company Name</label>
                <input
                  type="text"
                  value={userInfo.company}
                  onChange={e => setUserInfo({...userInfo, company: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Job Title</label>
                <input
                  type="text"
                  value={userInfo.jobTitle}
                  onChange={e => setUserInfo({...userInfo, jobTitle: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  placeholder="Director of Operations"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 max-w-xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-primary mb-3">Building Information</h2>
              <p className="text-lg text-primary/60">Tell us about the property</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Building Address</label>
                <input
                  type="text"
                  value={buildingInfo.address}
                  onChange={e => setBuildingInfo({...buildingInfo, address: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  placeholder="123 Main St, Chicago, IL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Building Type</label>
                <select
                  value={buildingInfo.type}
                  onChange={e => setBuildingInfo({...buildingInfo, type: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                >
                  <option value="">Select a type...</option>
                  <option value="Commercial Office">Commercial Office</option>
                  <option value="Multifamily Residential">Multifamily Residential</option>
                  <option value="Retail">Retail</option>
                  <option value="Mixed-Use">Mixed-Use</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Approximate Building Size (sq ft)</label>
                <input
                  type="number"
                  value={buildingInfo.size}
                  onChange={e => setBuildingInfo({...buildingInfo, size: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  placeholder="50000"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 max-w-xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-primary mb-3">Relationship Verification</h2>
              <p className="text-lg text-primary/60">Help us verify your association</p>
            </div>
            
            {userType === 'owner' && (
              <div className="space-y-6">
                <label className="flex items-center gap-3 p-4 border border-black/10 rounded-2xl cursor-pointer hover:bg-black/5 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={relationship.ownBuilding}
                    onChange={e => setRelationship({...relationship, ownBuilding: e.target.checked})}
                    className="w-5 h-5 accent-accent"
                  />
                  <span className="font-medium">I own this building</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Upload utility bill (optional)</label>
                  <div className="border-2 border-dashed border-black/10 rounded-2xl p-8 text-center bg-white">
                    <Upload className="w-8 h-8 text-primary/40 mx-auto mb-3" />
                    <p className="text-sm text-primary/60 mb-4">Drag and drop or click to upload</p>
                    <button className="px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium hover:bg-primary/10 transition-colors">
                      Choose File
                    </button>
                    {relationship.billUploaded && <p className="text-accent mt-2 text-sm font-medium flex items-center justify-center gap-1"><Check className="w-4 h-4"/> File uploaded</p>}
                  </div>
                </div>
              </div>
            )}

            {userType === 'manager' && (
              <div className="space-y-6">
                <label className="flex items-center gap-3 p-4 border border-black/10 rounded-2xl cursor-pointer hover:bg-black/5 transition-colors">
                  <input 
                    type="checkbox"
                    checked={relationship.manageBuilding}
                    onChange={e => setRelationship({...relationship, manageBuilding: e.target.checked})}
                    className="w-5 h-5 accent-accent"
                  />
                  <span className="font-medium">I manage this building</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Property management company</label>
                  <input
                    type="text"
                    value={relationship.propertyCompany}
                    onChange={e => setRelationship({...relationship, propertyCompany: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                    placeholder="Company Name"
                  />
                </div>
              </div>
            )}

            {userType === 'consultant' && (
              <div className="space-y-6">
                <label className="flex items-center gap-3 p-4 border border-black/10 rounded-2xl cursor-pointer hover:bg-black/5 transition-colors">
                  <input 
                    type="checkbox"
                    checked={relationship.representClients}
                    onChange={e => setRelationship({...relationship, representClients: e.target.checked})}
                    className="w-5 h-5 accent-accent"
                  />
                  <span className="font-medium">I represent clients</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Number of buildings managed annually</label>
                  <select
                    value={relationship.buildingsAnnually}
                    onChange={e => setRelationship({...relationship, buildingsAnnually: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  >
                    <option value="">Select range...</option>
                    <option value="1-5">1-5 buildings</option>
                    <option value="6-20">6-20 buildings</option>
                    <option value="21-50">21-50 buildings</option>
                    <option value="50+">50+ buildings</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 max-w-2xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-primary mb-3">Goals & Challenges</h2>
              <p className="text-lg text-primary/60">What are you looking to achieve?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Reduce energy costs',
                'Improve ESG performance',
                'Identify efficiency opportunities',
                'Generate client reports',
                'Find implementation partners'
              ].map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                    goals.includes(goal) 
                      ? 'border-accent bg-accent/5' 
                      : 'border-black/5 bg-white hover:border-black/10'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ${
                    goals.includes(goal) ? 'bg-accent border-accent text-white' : 'border-black/20'
                  }`}>
                    {goals.includes(goal) && <Check className="w-4 h-4" />}
                  </div>
                  <span className={`font-medium ${goals.includes(goal) ? 'text-accent' : 'text-primary/80'}`}>
                    {goal}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 max-w-xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-primary mb-3">Energy Profile</h2>
              <p className="text-lg text-primary/60">Let's look at your current energy usage</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Annual energy spend (optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60">$</span>
                  <input
                    type="number"
                    value={energyProfile.annualSpend}
                    onChange={e => setEnergyProfile({...energyProfile, annualSpend: e.target.value})}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-black/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                    placeholder="100000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Utility bill upload (optional)</label>
                <div className="border-2 border-dashed border-black/10 rounded-2xl p-8 text-center bg-white">
                  <Upload className="w-8 h-8 text-primary/40 mx-auto mb-3" />
                  <p className="text-sm text-primary/60 mb-4">Upload a recent utility bill to accelerate your profile</p>
                  <button className="px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium hover:bg-primary/10 transition-colors">
                    Upload Bill
                  </button>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-primary mb-2">Existing energy audit?</label>
                 <div className="flex gap-4">
                   <button 
                     onClick={() => setEnergyProfile({...energyProfile, audit: 'Yes'})}
                     className={`flex-1 py-3 rounded-xl border font-medium transition-colors ${energyProfile.audit === 'Yes' ? 'border-accent bg-accent/5 text-accent' : 'border-black/10 bg-white hover:bg-black/5'}`}
                   >Yes</button>
                   <button 
                     onClick={() => setEnergyProfile({...energyProfile, audit: 'No'})}
                     className={`flex-1 py-3 rounded-xl border font-medium transition-colors ${energyProfile.audit === 'No' ? 'border-accent bg-accent/5 text-accent' : 'border-black/10 bg-white hover:bg-black/5'}`}
                   >No</button>
                 </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 max-w-3xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-primary mb-3">Your Civic Snapshot</h2>
              <p className="text-lg text-primary/60">Here is a preliminary analysis based on your inputs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2 relative overflow-hidden">
                 <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-4">
                   <AlertTriangle className="w-6 h-6" />
                 </div>
                 <h3 className="text-sm font-bold text-primary/50 uppercase tracking-wider">Estimated Energy Waste</h3>
                 <p className="text-4xl font-bold text-primary">24%</p>
                 <p className="text-sm text-primary/60">above similar buildings in Chicago</p>
                 <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-500/5 rounded-full blur-xl" />
               </div>

               <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2 relative overflow-hidden">
                 <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
                   <BarChart3 className="w-6 h-6" />
                 </div>
                 <h3 className="text-sm font-bold text-primary/50 uppercase tracking-wider">Potential Annual Savings</h3>
                 <p className="text-4xl font-bold text-emerald-600">${(energyProfile.annualSpend ? parseInt(energyProfile.annualSpend) * 0.24 : 18500).toLocaleString()}</p>
                 <p className="text-sm text-emerald-700/60">Based on standard efficiency upgrades</p>
                 <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
               </div>

               <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2 relative overflow-hidden md:col-span-2">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                     <Zap className="w-5 h-5" />
                   </div>
                   <h3 className="font-bold text-primary">Energy Efficiency Score</h3>
                 </div>
                 
                 <div className="w-full bg-black/5 rounded-full h-4 mb-2 overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: '42%' }} transition={{ duration: 1, delay: 0.5 }} className="bg-accent h-full" />
                 </div>
                 <div className="flex justify-between text-xs font-bold text-primary/50">
                    <span>Needs Work (0-50)</span>
                    <span className="text-accent">42 / 100</span>
                    <span>Excellent (80-100)</span>
                 </div>
               </div>
            </div>

            <div className="bg-accent/5 p-6 rounded-3xl border border-accent/10 mt-6 md:mt-8">
              <h3 className="font-bold text-primary mb-4">Recommended Next Actions</h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-primary/80"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> Schedule a detailed energy audit for {buildingInfo.address || 'your property'}.</li>
                <li className="flex gap-3 text-primary/80"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> Review local incentives available for lighting and HVAC upgrades.</li>
                <li className="flex gap-3 text-primary/80"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> Connect with approved contractors for implementation.</li>
              </ul>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6 max-w-xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-primary mb-3">Your Next Step</h2>
              <p className="text-lg text-primary/60">How would you like to proceed?</p>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'waitlist', label: 'Join Waitlist', desc: 'Get notified when our full portal launches' },
                { id: 'report', label: 'Request Full Report', desc: 'Receive a detailed PDF report for your property' },
                { id: 'demo', label: 'Schedule Demo', desc: 'See how the platform works' },
                { id: 'partner', label: 'Become a Civic Partner', desc: 'Join our network of energy professionals' }
              ].map(action => (
                <button
                  key={action.id}
                  onClick={() => finishOnboarding(action.id)}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-6 rounded-2xl border border-black/10 bg-white hover:border-accent hover:shadow-lg transition-all text-left group"
                >
                  <div>
                    <div className="font-semibold text-lg text-primary group-hover:text-accent transition-colors">{action.label}</div>
                    <div className="text-sm text-primary/60">{action.desc}</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary/20 group-hover:text-accent transition-colors" />
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <header className="p-6 border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Logo />
          <button 
            onClick={() => navigate('/profile')} 
            className="text-sm font-medium text-primary/60 hover:text-primary transition-colors"
          >
            Skip for now
          </button>
        </div>
      </header>

      <div className="h-1 bg-black/5 w-full">
        <div 
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center pt-16 pb-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex-1 flex items-center justify-center max-w-5xl mx-auto"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-black/5 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-primary hover:bg-black/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          
          {currentStep < totalSteps && (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !userType) // Require user type selection
              }
              className="flex items-center gap-2 px-8 py-3 rounded-full font-medium bg-accent hover:bg-accent-dark text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
