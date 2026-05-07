import { Mail, Phone, MapPin, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export function ContactPage() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message sent! Our sales team will get back to you shortly.');
  };

  return (
    <div className="min-h-screen bg-bg text-primary flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6">Let's talk about your portfolio.</h1>
              <p className="text-xl text-primary/60 leading-relaxed">
                Our enterprise team specializes in large-scale energy optimization and shared savings models for Chicago commercial real estate.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email us</h3>
                  <p className="text-primary/60 mb-2">For sales and enterprise inquiries.</p>
                  <a href="mailto:zecco@civic-energy.com" className="text-primary font-medium hover:underline">zecco@civic-energy.com</a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Call us</h3>
                  <p className="text-primary/60 mb-2">Mon-Fri from 9am to 5pm CST.</p>
                  <a href="tel:+1 (630) 816-1489" className="text-primary font-medium hover:underline">+1 (630) 816-1489</a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-black/5 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary/60 mb-2">First name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-bg border border-black/5 rounded-2xl px-5 py-4 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary/60 mb-2">Last name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-bg border border-black/5 rounded-2xl px-5 py-4 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary/60 mb-2">Work email</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-bg border border-black/5 rounded-2xl px-5 py-4 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                  placeholder="jane@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary/60 mb-2">Building/Portfolio size</label>
                <select className="w-full bg-bg border border-black/5 rounded-2xl px-5 py-4 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none">
                  <option>Single building</option>
                  <option>2-10 buildings</option>
                  <option>10-50 buildings</option>
                  <option>50+ buildings</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary/60 mb-2">Message</label>
                <textarea 
                  rows={4}
                  required
                  className="w-full bg-bg border border-black/5 rounded-2xl px-5 py-4 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" 
                  placeholder="Tell us about your goals..."
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white px-8 py-5 rounded-full font-medium text-lg transition-all shadow-lg flex items-center justify-center gap-3 group"
              >
                Send message
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
