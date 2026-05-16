import { useState, useRef } from 'react';
import { adminSearch } from '../../services/pocService';
import { BranchBadge } from '../common/Badge';

export default function AdminSearch() {
  const [query, setQuery] =
    useState('');

  const [results, setResults] =
    useState([]);

  const [state, setState] =
    useState('idle');

  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;

    setQuery(val);

    clearTimeout(
      debounceRef.current
    );

    if (!val.trim()) {
      setResults([]);
      setState('idle');
      return;
    }

    setState('loading');

    debounceRef.current =
      setTimeout(async () => {
        try {
          const data =
            await adminSearch(val);

          setResults(data);

          setState('done');
        } catch {
          setState('done');
        }
      }, 350);
  };

  return (
    <div className="card p-6">
      <h3 className="font-display font-bold text-navy mb-1">
        Admin POC Search
      </h3>

      <p className="text-xs text-slate-500 mb-4">
        Search by full name or any
        alias (e.g. "mmt" →
        MakeMyTrip)
      </p>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
          🔍
        </span>

        <input
          className="input pl-9"
          placeholder="Type company name or alias…"
          value={query}
          onChange={handleChange}
        />

        {state === 'loading' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 animate-pulse">
            Searching…
          </span>
        )}
      </div>

      {state === 'done' && (
        <div className="mt-4 space-y-2 animate-slide-up">
          {results.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">
                🔍
              </p>

              <p className="text-sm text-slate-500">
                No POC found for "
                <strong>
                  {query}
                </strong>
                "
              </p>
            </div>
          ) : (
            results.map((poc) => (
              <div
                key={poc._id}
                className="flex items-start justify-between p-3 rounded-xl border border-slate-200 hover:border-navy/20 hover:bg-slate-50 transition-all"
              >
                <div>
                  <p className="font-body font-semibold text-navy">
                    {poc.name}
                  </p>

                  {poc.aliases.length >
                    0 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Aliases:{' '}
                      {poc.aliases.join(
                        ', '
                      )}
                    </p>
                  )}
                </div>

                <div className="ml-4">
                  <BranchBadge
                    branch={poc.branch}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}