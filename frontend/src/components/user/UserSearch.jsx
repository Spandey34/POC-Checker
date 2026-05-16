import { useState } from 'react';
import { userSearch } from '../../services/pocService';
import { BranchBadge } from '../common/Badge';

export default function UserSearch() {
  const [query,  setQuery]  = useState('');
  const [result, setResult] = useState(null);   // { found, poc? }
  const [state,  setState]  = useState('idle'); // idle | loading | done | error
  const [error,  setError]  = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setState('loading');
    setResult(null);
    setError('');

    try {
      const data = await userSearch(query.trim());
      setResult(data);
      setState('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
      setState('error');
    }
  };

  const handleReset = () => {
    setQuery('');
    setResult(null);
    setState('idle');
    setError('');
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Enter full company name…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setState('idle'); setResult(null); }}
        />
        <button type="submit" className="btn-primary whitespace-nowrap" disabled={state === 'loading'}>
          {state === 'loading' ? 'Checking…' : 'Check POC'}
        </button>
        {state !== 'idle' && (
          <button type="button" onClick={handleReset} className="btn-ghost px-3">
            ✕
          </button>
        )}
      </form>

      <p className="text-xs text-slate-400 mt-2 text-center">
        Enter the exact company name. Uppercase or lowercase both work.
      </p>

      {/* Result */}
      {state === 'done' && result && (
        <div className={`mt-6 animate-slide-up rounded-2xl border-2 p-6 text-center ${
          result.found
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-red-200 bg-red-50'
        }`}>
          {result.found ? (
            <>
              <div className="text-4xl mb-2">✅</div>
              <h3 className="font-display font-bold text-emerald-800 text-lg mb-1">
                Yes! This is our POC
              </h3>
              <p className="text-emerald-700 font-body font-semibold mb-4">{result.poc.name}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {result.poc.branches.map((b) => <BranchBadge key={b} branch={b} />)}
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">❌</div>
              <h3 className="font-display font-bold text-red-700 text-lg mb-1">
                Not a POC
              </h3>
              <p className="text-sm text-red-600/80 font-body">
                "<strong>{query}</strong>" is not registered as a Point of Contact.
              </p>
            </>
          )}
        </div>
      )}

      {state === 'error' && (
        <div className="mt-6 animate-slide-up rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}
    </div>
  );
}
