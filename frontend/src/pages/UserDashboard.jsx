import { useUser } from '@clerk/clerk-react';
import Navbar from '../components/layout/Navbar';
import UserSearch from '../components/user/UserSearch';

export default function UserDashboard() {
  const { user } = useUser();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-gold/70 text-sm font-body mb-1">{greeting},</p>
          <h1 className="text-3xl font-display font-extrabold text-white mb-2">
            {user?.firstName} 👋
          </h1>
          <p className="text-white/40 font-body text-sm">
            Check if a Company is a registered Point of Contact for our InternShip and Placement Season.
          </p>
        </div>
      </div>

      {/* Search area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="card p-8 shadow-xl animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-navy text-xl mb-1">Is this company our POC?</h2>
          </div>
          <UserSearch />
        </div>
      </div>

      {/* Info section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🏢', title: 'POC Companies', desc: 'Companies officially registered as Points of Contact by TNP cell.' },
            { icon: '🎓', title: 'Branch-wise', desc: 'POCs are mapped to specific branches: CSE, ECE, EE, Mech, Civil, MME, PIE, ECM.' },
            { icon: '🔒', title: 'Secure Access', desc: 'Only verified NIT JSR students and faculty can access this portal.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="card p-5 animate-fade-in">
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-display font-bold text-navy text-sm mb-1">{title}</h3>
              <p className="text-slate-500 text-xs font-body leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
