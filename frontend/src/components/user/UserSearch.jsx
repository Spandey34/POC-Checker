import { useEffect, useState } from 'react';
import { userSearch } from '../../services/pocService';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const wordCount = query.trim()
    ? query.trim().split(/\s+/).length
    : 0;

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResult(null);
      setState('idle');
      setError('');
      return;
    }

    if (wordCount < 3) {
      setResult(null);
      setState('idle');
      setError('');
      return;
    }

    const delay = setTimeout(async () => {
      setState('loading');
      setError('');

      try {
        const data = await userSearch(trimmed);
        setResult(data);
        setState('done');
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Search failed'
        );
        setState('error');
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query, wordCount]);

  const handleReset = () => {
    setQuery('');
    setResult(null);
    setState('idle');
    setError('');
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Enter company name..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />

        {query.trim() && (
          <button
            type="button"
            onClick={handleReset}
            className="btn-ghost px-3"
          >
            ✕
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Type at least 3 words to search automatically.
      </p>

      {state === 'loading' && (
        <div className="mt-6 animate-slide-up rounded-2xl border-2 border-slate-200 bg-slate-50 p-6 text-center">
          <div className="text-3xl mb-2">🔎</div>
          <p className="text-sm text-slate-600">
            Searching...
          </p>
        </div>
      )}

      {state === 'done' && result && (
        <div
          className={`mt-6 animate-slide-up rounded-2xl border-2 p-6 ${
            result.found
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          {result.found ? (
            <>
              <div className="text-4xl mb-3 text-center">
                ✅
              </div>

              <h3 className="font-display font-bold text-emerald-800 text-lg mb-3 text-center">
                Top Matching POCs
              </h3>

              <div className="space-y-3">
                {(result.results || []).map((poc) => (
                  <div
                    key={poc._id}
                    className="rounded-xl bg-white border border-emerald-100 p-4"
                  >
                    <p className="font-semibold text-navy">
                      {poc.name || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Branch: {poc.branch || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2 text-center">
                ❌
              </div>

              <h3 className="font-display font-bold text-red-700 text-lg mb-1 text-center">
                No Such Company is registered as POC
              </h3>

              <p className="text-sm text-red-600/80 font-body text-center">
                "
                <strong>{query}</strong>
                " is not registered as a Point of Contact.
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