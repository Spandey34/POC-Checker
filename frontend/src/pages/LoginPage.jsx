import { SignIn, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useDbUser } from '../context/UserContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function LoginPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { dbUser, loading } = useDbUser();

  if (!isLoaded || loading) return <LoadingSpinner fullScreen />;

  if (isSignedIn && dbUser) {
    if (dbUser.role === 'admin') return <Navigate to="/admin" replace />;
    if (dbUser.isVerified)      return <Navigate to="/dashboard" replace />;
    return <Navigate to="/pending" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
            <span className="text-navy font-display font-bold">NIT</span>
          </div>
          <div>
            <p className="text-white font-display font-bold text-lg leading-none">POC Checker</p>
            <p className="text-gold/60 text-xs font-body tracking-widest uppercase leading-none mt-1">
              NIT Jamshedpur
            </p>
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-display font-extrabold text-white leading-tight mb-4">
            Know Your<br />
            <span className="text-gold">Point of Contact</span>
          </h1>
          <p className="text-white/50 font-body text-lg max-w-sm">
            The official portal to verify placement POCs across all branches at NIT JSR.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {['CSE', 'ECE', 'Mech', 'Civil', 'MME', 'PIE'].map((b) => (
              <div key={b} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
                <p className="text-white font-display font-bold text-sm">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs font-body">
          Restricted to @nitjsr.ac.in email addresses only.
        </p>
      </div>

      {/* Right panel – Clerk sign in */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/5 backdrop-blur-sm lg:rounded-l-3xl">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                <span className="text-navy font-display font-bold text-xs">NIT</span>
              </div>
              <span className="text-white font-display font-bold">POC Checker</span>
            </div>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-2xl rounded-2xl border-0',
                headerTitle: 'font-display font-bold text-navy',
                formButtonPrimary: 'bg-navy hover:bg-navy-light font-body',
                footerAction: 'font-body',
              },
            }}
            redirectUrl="/"
          />

          <p className="text-white/40 text-xs text-center mt-4 font-body">
            Only @nitjsr.ac.in accounts can sign in
          </p>
        </div>
      </div>
    </div>
  );
}
