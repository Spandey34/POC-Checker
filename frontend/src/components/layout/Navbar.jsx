import { useClerk, useUser } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { useDbUser } from '../../context/UserContext';

export default function Navbar() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { dbUser } = useDbUser();
  const location = useLocation();

  const isAdmin = dbUser?.role === 'admin';
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?'
    : '?';

  return (
    <header className="sticky top-0 z-40 bg-navy border-b border-navy-light/40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center shadow">
            <span className="text-navy font-display font-bold text-sm">NIT</span>
          </div>
          <div>
            <p className="text-white font-display font-bold text-sm leading-none">POC Checker</p>
            <p className="text-gold/70 text-[10px] font-body leading-none tracking-widest uppercase">
              NIT Jamshedpur
            </p>
          </div>
        </Link>

        {/* Nav Links (admin only) */}
        {isAdmin && (
          <nav className="hidden sm:flex items-center gap-1">
            {[
              { to: '/admin', label: 'Dashboard' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-1.5 rounded-lg text-sm font-body font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* User area */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-white text-xs font-body font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-gold/60 text-[10px] font-body leading-none mt-0.5">
              {isAdmin ? '⚡ Admin' : '✓ Verified'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
            <span className="text-navy font-display font-bold text-xs">{initials}</span>
          </div>
          <button
            onClick={() => signOut()}
            className="text-white/50 hover:text-white text-xs font-body transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
