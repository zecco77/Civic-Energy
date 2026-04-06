import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';

export function PaymentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      alert('Payment successful! Your full report is being generated.');
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-bg text-primary flex flex-col">
      <nav className="p-6 border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <Logo className="h-6 w-auto" />
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight mb-4">Complete your order</h1>
              <p className="text-primary/60">Get instant access to your building's investment-grade energy analysis report.</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-black/5">
                <span className="font-medium">Analyze Tier Report</span>
                <span className="font-semibold">$149.00</span>
              </div>
              <div className="flex justify-between items-center text-sm text-primary/60">
                <span>Processing Fee</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold pt-4">
                <span>Total</span>
                <span>$149.00</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-primary/60">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span>Secure 256-bit SSL encrypted payment</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary/60">
                <Lock className="w-5 h-5 text-primary/40" />
                <span>Your data is protected and never stored</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary/60 mb-1">Cardholder Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary/60 mb-1">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                    <input 
                      type="text" 
                      required
                      className="w-full bg-bg border border-black/5 rounded-xl pl-12 pr-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary/60 mb-1">Expiry Date</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary/60 mb-1">CVC</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-dark disabled:bg-primary/50 text-white px-6 py-4 rounded-full font-medium text-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Pay $149.00'}
              </button>

              <p className="text-center text-xs text-primary/40">
                By clicking "Pay", you agree to our Terms of Service and Refund Policy.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
