import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6">
      <div className="animate-slide-up">
        <p className="text-8xl font-display font-extrabold text-navy/10">404</p>
        <h1 className="text-2xl font-display font-bold text-navy mt-2 mb-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm font-body mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn-primary">← Go Home</Link>
      </div>
    </div>
  );
}
