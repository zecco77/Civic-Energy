import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon } from 'lucide-react';
import { Logo } from './Logo';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Search', path: '/search' },
    { name: 'Platform', path: '/platform' },
    { name: 'Features', path: '/features' },
    { name: 'Contractors', path: '/contractors' },
    { name: 'Pricing', path: '/pricing' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Logo className="h-12 w-auto rounded-md" inverse />
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path) 
                      ? 'text-white border-b-2 border-white pb-1' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to="/profile" className="flex items-center gap-2 text-white/90 text-sm font-medium hover:text-white transition-colors">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                My Profile
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-accent hover:bg-accent-dark text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-primary border-b border-white/10 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  isActive(link.path) ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-white/70 hover:text-white hover:bg-white/10"
              >
                My Profile
              </Link>
            ) : (
              <div className="px-3 pt-2 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-3 py-2 rounded-lg text-base font-medium text-white/70 hover:text-white hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-3 py-2 rounded-full text-base font-medium text-white bg-accent hover:bg-accent-dark shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
