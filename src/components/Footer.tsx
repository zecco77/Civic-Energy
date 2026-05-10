import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Logo inverse className="h-12 w-auto rounded-md" />
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              Turning public data into private savings for Chicago building owners.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link to="/platform" className="hover:text-white transition-colors">Platform</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/platform#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/methodology" className="hover:text-white transition-colors">Methodology</Link></li>
              <li><Link to="/data-sources" className="hover:text-white transition-colors">Data Sources</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/team" className="hover:text-white transition-colors">Team</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal & Trust</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/accuracy" className="hover:text-white transition-colors">Accuracy Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        
      </div>

      <div className="w-full flex overflow-hidden justify-center">
        <img 
          src="https://images.pexels.com/photos/36934098/pexels-photo-36934098.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
          alt="Chicago Skyline" 
          className="w-full h-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-500 block"
          referrerPolicy="no-referrer"
        />
      </div>
    </footer>
  );
}
