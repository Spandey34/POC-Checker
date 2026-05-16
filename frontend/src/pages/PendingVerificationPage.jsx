import { useClerk, useUser } from '@clerk/clerk-react';
import { useDbUser } from '../context/UserContext';
import { Navigate } from 'react-router-dom';

export default function PendingVerificationPage() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { dbUser, refreshUser } = useDbUser();

  if (dbUser?.isVerified && dbUser?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (dbUser?.role === 'admin') return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full card p-10 text-center shadow-xl animate-slide-up">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⏳</span>
        </div>

        <h1 className="font-display font-extrabold text-navy text-2xl mb-2">
          Awaiting Approval
        </h1>
        <p className="text-slate-500 text-sm font-body mb-1">
          Signed in as <strong className="text-navy">{user?.primaryEmailAddress?.emailAddress}</strong>
        </p>
        <p className="text-slate-400 text-sm font-body mb-8">
          Your account has been registered but is pending admin verification. You'll be able to use the portal once approved.
        </p>

        {/* Steps */}
        <div className="bg-slate-50 rounded-xl p-4 text-left mb-8 space-y-3">
          {[
            { icon: '✅', text: 'Account created with NIT JSR email' },
            { icon: '⏳', text: 'Waiting for admin to verify your account' },
            { icon: '🔓', text: 'Access the POC portal once verified' },
          ].map(({ icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-lg">{icon}</span>
              <span className="text-slate-600 font-body">{text}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={refreshUser}
            className="flex-1 btn-primary text-sm py-2.5"
          >
            Check Status
          </button>
          <button
            onClick={() => signOut()}
            className="flex-1 btn-ghost text-sm py-2.5"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Branding */}
      <div className="mt-8 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-navy flex items-center justify-center">
          <span className="text-gold font-display font-bold text-[9px]">NIT</span>
        </div>
        <span className="text-slate-400 text-xs font-body">POC Checker — NIT Jamshedpur</span>
      </div>
    </div>
  );
}
