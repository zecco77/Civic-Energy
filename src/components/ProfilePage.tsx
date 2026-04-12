import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { 
  User as UserIcon, 
  LogOut, 
  Building2, 
  Plus, 
  Activity, 
  Star, 
  Settings, 
  CreditCard, 
  Bell,
  LayoutDashboard,
  Zap,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { formatCurrency } from '../services/financials';
import { BenchmarkingData } from '../services/chicagoData';

interface PortfolioItem {
  id: string;
  buildingId: string;
  propertyName: string;
  address: string;
  addedAt: any;
  energyScore?: number;
  type?: string;
  sqft?: string;
  latitude?: string;
  longitude?: string;
  financials?: {
    savingsPotential: number;
    totalAnnualCost: number;
  };
  customName?: string;
}

interface ProfilePageProps {
  onSelect?: (building: BenchmarkingData) => void;
}

export function ProfilePage({ onSelect }: ProfilePageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('portfolio');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Modal form state
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    type: 'Office',
    sqft: '',
    energyScore: ''
  });

  const fetchPortfolio = async (uid: string) => {
    try {
      const q = query(collection(db, 'portfolioBuildings'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      const items: PortfolioItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          buildingId: data.buildingId,
          propertyName: data.customName || data.propertyName,
          address: data.address,
          addedAt: data.createdAt,
          energyScore: data.energyStarScore,
          type: data.propertyType,
          sqft: data.sqFt?.toString(),
          financials: {
            savingsPotential: (data.sqFt || 0) * 1.5, // Mock savings calculation
            totalAnnualCost: (data.sqFt || 0) * 3.0 // Mock cost calculation
          }
        });
      });
      setPortfolio(items);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchPortfolio(currentUser.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const stats = useMemo(() => {
    const displayPortfolio = portfolio;
    const totalBuildings = displayPortfolio.length;
    const avgEnergyStar = totalBuildings > 0 
      ? Math.round(displayPortfolio.reduce((acc, curr) => acc + (curr.energyScore || 0), 0) / totalBuildings)
      : 0;
    const totalSavings = displayPortfolio.reduce((acc, curr) => acc + (curr.financials?.savingsPotential || 0), 0);

    return { totalBuildings, avgEnergyStar, totalSavings };
  }, [portfolio]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const handleViewDashboard = (item: PortfolioItem) => {
    if (onSelect) {
      const mockBuilding: BenchmarkingData = {
        id: item.buildingId,
        row_id: item.buildingId,
        property_name: item.propertyName,
        address: item.address,
        primary_property_type: item.type || 'Unknown',
        year_built: '',
        gross_floor_area_buildings_sq_ft: item.sqft || '0',
        energy_star_score: item.energyScore?.toString() || '',
        site_eui_kbtu_sq_ft: '',
        source_eui_kbtu_sq_ft: '',
        total_ghg_emissions_metric_tons_co2e: '',
        latitude: item.latitude || '',
        longitude: item.longitude || ''
      };
      onSelect(mockBuilding);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this building from your portfolio?')) {
      try {
        await deleteDoc(doc(db, 'portfolioBuildings', id));
        setPortfolio(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error("Error deleting building:", error);
      }
    }
  };

  const openEditModal = (item: PortfolioItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setFormData({
      propertyName: item.propertyName,
      address: item.address,
      type: item.type || 'Office',
      sqft: item.sqft || '',
      energyScore: item.energyScore?.toString() || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'portfolioBuildings', editingItem.id);
      await updateDoc(docRef, {
        customName: formData.propertyName,
        address: formData.address,
        propertyType: formData.type,
        sqFt: parseFloat(formData.sqft) || 0,
        energyStarScore: parseFloat(formData.energyScore) || 0
      });
      setPortfolio(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, propertyName: formData.propertyName, address: formData.address, type: formData.type, sqft: formData.sqft, energyScore: parseFloat(formData.energyScore) || 0 }
          : item
      ));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating building:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const buildingId = `manual-${Date.now()}`;
      
      const sqftNum = parseInt(formData.sqft.replace(/,/g, '')) || 0;
      // Rough estimation for savings potential based on sqft and type
      const estimatedSavings = sqftNum * 0.75; 
      const estimatedCost = sqftNum * 3.5;

      const newDocRef = doc(collection(db, 'portfolioBuildings'));
      const newBuilding = {
        uid: user.uid,
        buildingId: buildingId,
        propertyName: formData.propertyName,
        address: formData.address,
        propertyType: formData.type,
        sqFt: sqftNum,
        energyStarScore: parseInt(formData.energyScore) || 0,
        createdAt: new Date().toISOString(),
        customName: formData.propertyName
      };
      
      await setDoc(newDocRef, newBuilding);

      const newItem: PortfolioItem = {
        id: newDocRef.id,
        buildingId: buildingId,
        propertyName: formData.propertyName,
        address: formData.address,
        energyScore: parseInt(formData.energyScore) || 0,
        type: formData.type,
        sqft: sqftNum.toString(),
        financials: {
          savingsPotential: estimatedSavings,
          totalAnnualCost: estimatedCost
        },
        addedAt: newBuilding.createdAt
      };

      setPortfolio(prev => [newItem, ...prev]);
      setIsAddModalOpen(false);
      setFormData({ propertyName: '', address: '', type: 'Office', sqft: '', energyScore: '' });
    } catch (error) {
      console.error("Failed to add building", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.displayName 
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'JD';

  const navItems = [
    { id: 'portfolio', label: 'My Portfolio', icon: LayoutDashboard },
    { id: 'settings', label: 'Account Settings', icon: Settings },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const displayPortfolio = portfolio;

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white rounded-[32px] shadow-sm border border-black/5 p-6 flex flex-col min-h-[600px]">
              {/* User Profile Card */}
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  {initials}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary leading-tight">{user.displayName || 'John Doe'}</h2>
                  <p className="text-sm text-primary/40 font-medium">Property Manager</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2 flex-grow">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                      activeNav === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-primary/60 hover:bg-black/5 hover:text-primary"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", activeNav === item.id ? "text-primary" : "text-primary/40")} />
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Sign Out */}
              <div className="pt-6 mt-6 border-t border-black/5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow space-y-8">
            {activeNav === 'portfolio' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-primary">My Portfolio</h1>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-black transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Building
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-[32px] shadow-sm border border-black/5 p-8">
                    <div className="flex items-center gap-3 text-primary/40 font-semibold text-sm mb-4">
                      <Building2 className="w-5 h-5" />
                      Total Buildings
                    </div>
                    <div className="text-5xl font-bold text-primary tracking-tight">{stats.totalBuildings}</div>
                  </div>
                  <div className="bg-white rounded-[32px] shadow-sm border border-black/5 p-8">
                    <div className="flex items-center gap-3 text-primary/40 font-semibold text-sm mb-4">
                      <Activity className="w-5 h-5" />
                      Avg. ENERGY STAR
                    </div>
                    <div className="text-5xl font-bold text-primary tracking-tight">{stats.avgEnergyStar}</div>
                  </div>
                  <div className="bg-white rounded-[32px] shadow-sm border border-black/5 p-8">
                    <div className="flex items-center gap-3 text-primary/40 font-semibold text-sm mb-4">
                      <Zap className="w-5 h-5" />
                      Total Savings Potential
                    </div>
                    <div className="text-4xl font-bold text-primary tracking-tight">{formatCurrency(stats.totalSavings)}</div>
                  </div>
                </div>

                {/* Portfolio Table */}
                <div className="bg-white rounded-[32px] shadow-sm border border-black/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-bg/50">
                          <th className="px-8 py-5 text-xs font-bold text-primary/40 uppercase tracking-wider">Property</th>
                          <th className="px-6 py-5 text-xs font-bold text-primary/40 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-5 text-xs font-bold text-primary/40 uppercase tracking-wider text-center">ENERGY STAR</th>
                          <th className="px-6 py-5 text-xs font-bold text-primary/40 uppercase tracking-wider">Est. Savings</th>
                          <th className="px-8 py-5 text-xs font-bold text-primary/40 uppercase tracking-wider text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {displayPortfolio.map((item) => (
                          <tr key={item.id} className="hover:bg-bg/30 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="font-bold text-primary group-hover:text-primary transition-colors">{item.propertyName}</div>
                            </td>
                            <td className="px-6 py-6 text-primary/60 font-medium">{item.type || 'Office'}</td>
                            <td className="px-6 py-6 text-center">
                              <span className={cn(
                                "inline-flex items-center justify-center w-10 h-7 rounded-full text-xs font-bold",
                                (item.energyScore || 0) >= 70 ? "bg-primary/10 text-primary" :
                                (item.energyScore || 0) >= 50 ? "bg-amber-50 text-amber-600" :
                                "bg-rose-50 text-rose-500"
                              )}>
                                {item.energyScore || 45}
                              </span>
                            </td>
                            <td className="px-6 py-6 font-bold text-primary">
                              {formatCurrency(item.financials?.savingsPotential || 84500)}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button 
                                  onClick={() => handleViewDashboard(item)}
                                  className="text-blue-500 font-bold text-sm hover:underline"
                                >
                                  View Dashboard
                                </button>
                                <button
                                  onClick={(e) => openEditModal(item, e)}
                                  className="p-2 text-primary/40 hover:text-primary hover:bg-black/5 rounded-lg transition-colors"
                                  title="Edit Building"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleDelete(item.id, e)}
                                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Remove Building"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeNav === 'settings' && (
              <div className="bg-white rounded-[32px] shadow-sm border border-black/5 p-8">
                <h2 className="text-2xl font-bold text-primary mb-6">Account Settings</h2>
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={user.displayName || ''}
                      className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user.email || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-black/10 bg-black/5 text-primary/60 outline-none cursor-not-allowed"
                    />
                    <p className="text-xs text-primary/40 mt-2">Email address cannot be changed. Contact support for assistance.</p>
                  </div>
                  <div className="pt-4">
                    <button className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeNav === 'billing' && (
              <div className="bg-white rounded-[32px] shadow-sm border border-black/5 p-8">
                <h2 className="text-2xl font-bold text-primary mb-6">Billing & Plans</h2>
                <div className="bg-bg rounded-2xl p-6 mb-8 border border-black/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-primary">Free Plan</h3>
                      <p className="text-primary/60 text-sm">Basic portfolio tracking and insights</p>
                    </div>
                    <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold">Active</span>
                  </div>
                  <div className="w-full bg-black/5 rounded-full h-2 mb-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <p className="text-sm text-primary/60">3 of 10 buildings tracked</p>
                </div>

                <h3 className="text-lg font-bold text-primary mb-4">Payment Methods</h3>
                <div className="border border-black/10 rounded-2xl p-6 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-black/5 rounded flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary/40" />
                    </div>
                    <div>
                      <p className="font-bold text-primary">No payment method added</p>
                      <p className="text-sm text-primary/60">Add a card to upgrade your plan</p>
                    </div>
                  </div>
                  <button className="text-primary font-bold text-sm hover:underline">Add Card</button>
                </div>
              </div>
            )}

            {activeNav === 'notifications' && (
              <div className="bg-white rounded-[32px] shadow-sm border border-black/5 p-8">
                <h2 className="text-2xl font-bold text-primary mb-6">Notifications</h2>
                <div className="space-y-6 max-w-2xl">
                  <div className="flex items-center justify-between py-4 border-b border-black/5">
                    <div>
                      <h3 className="font-bold text-primary">Monthly Portfolio Report</h3>
                      <p className="text-sm text-primary/60">Receive a monthly summary of your portfolio's performance.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-black/5">
                    <div>
                      <h3 className="font-bold text-primary">Compliance Alerts</h3>
                      <p className="text-sm text-primary/60">Get notified about upcoming local law deadlines and requirements.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="font-bold text-primary">New Feature Announcements</h3>
                      <p className="text-sm text-primary/60">Updates on new tools and capabilities in Civic Energy.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add Building Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-black/5">
              <h2 className="text-xl font-bold text-primary">Add Building Manually</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-primary/40 hover:text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddBuilding} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-primary mb-1.5">Property Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.propertyName}
                  onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. Willis Tower"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-primary mb-1.5">Address</label>
                <input 
                  type="text" 
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. 233 S Wacker Dr, Chicago, IL"
                />
              </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary mb-1.5">Property Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white"
                  >
                    <option value="Office">Office</option>
                    <option value="Multifamily">Multifamily</option>
                    <option value="Retail">Retail</option>
                    <option value="Mixed Use">Mixed Use</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-primary mb-1.5">Area</label>
                  <input 
                    type="number" 
                    required
                    value={formData.sqft}
                    onChange={(e) => setFormData({...formData, sqft: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="e.g. 150000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-1.5">ENERGY STAR Score (Optional)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="100"
                  value={formData.energyScore}
                  onChange={(e) => setFormData({...formData, energyScore: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="1-100"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-primary hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Add Building'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Building Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-black/5">
              <h2 className="text-xl font-bold text-primary">Edit Building</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-primary/40 hover:text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-primary mb-1.5">Property Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.propertyName}
                  onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. Willis Tower"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-primary mb-1.5">Address</label>
                <input 
                  type="text" 
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. 233 S Wacker Dr, Chicago, IL"
                />
              </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary mb-1.5">Property Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white"
                  >
                    <option value="Office">Office</option>
                    <option value="Multifamily">Multifamily</option>
                    <option value="Retail">Retail</option>
                    <option value="Mixed Use">Mixed Use</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-primary mb-1.5">Area (sqft)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.sqft}
                    onChange={(e) => setFormData({...formData, sqft: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="e.g. 150000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-1.5">ENERGY STAR Score (Optional)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="100"
                  value={formData.energyScore}
                  onChange={(e) => setFormData({...formData, energyScore: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="1-100"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-primary hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

