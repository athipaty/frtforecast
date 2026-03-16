import { useState } from 'react';

export default function TableView({ allRows, months }) {
  const [filterCust, setFilterCust] = useState('ALL');
  const [alertOnly, setAlertOnly] = useState(false);
  const [search, setSearch] = useState('');

  const customers = [...new Set(allRows.map(r => r.customer))].sort();

  const rows = allRows
    .filter(r => filterCust === 'ALL' || r.customer === filterCust)
    .filter(r => !alertOnly || r.hasAlert)
    .filter(r => !search ||
      r.partNo.toLowerCase().includes(search.toLowerCase()) ||
      r.customer.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.hasAlert - a.hasAlert || a.customer.localeCompare(b.customer));

  return (
    <div className="space-y-4 page-enter">
      {/* Filters */}
      <div
        className="flex gap-3 flex-wrap items-center"
        style={{ animation: 'fadeSlideIn 0.3s ease forwards', opacity: 0 }}
      >
        <select
          value={filterCust}
          onChange={e => setFilterCust(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
        >
          <option value="ALL">All customers</option>
          {customers.map(c => <option key={c}>{c}</option>)}
        </select>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search part / customer…"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none flex-1 min-w-[160px]"
        />
        <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
          <input type="checkbox" checked={alertOnly} onChange={e => setAlertOnly(e.target.checked)} />
          Alerts only
        </label>
        <span className="text-xs text-gray-400 ml-auto">{rows.length} rows</span>
      </div>

      <div
        className="bg-white rounded-xl border border-gray-200 overflow-x-auto"
        style={{ animation: 'fadeSlideIn 0.4s ease forwards', animationDelay: '0.1s', opacity: 0 }}
      >
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Part No</th>
              {months.map(m => (
                <th key={m} colSpan={3} className="text-center px-2 py-3 text-blue-600 font-semibold border-l border-gray-100">{m}</th>
              ))}
            </tr>
            <tr className="border-b border-gray-100 bg-white">
              <th className="px-4 py-2"></th>
              <th className="px-4 py-2"></th>
              {months.map(m => (
                <>
                  <th key={m + 'p'} className="px-3 py-2 text-gray-400 font-normal border-l border-gray-100 text-right">Prev</th>
                  <th key={m + 'c'} className="px-3 py-2 text-gray-400 font-normal text-right">Curr</th>
                  <th key={m + 'v'} className="px-3 py-2 text-gray-400 font-normal text-right">Var</th>
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className={`border-b border-gray-50 hover:bg-blue-50 transition-colors ${r.hasAlert ? 'bg-amber-50' : ''}`}
                style={{
                  animation: 'fadeSlideIn 0.3s ease forwards',
                  animationDelay: `${Math.min(i * 0.02, 0.4)}s`,
                  opacity: 0
                }}
              >
                <td className="px-4 py-2.5 font-medium text-gray-700">{r.customer}</td>
                <td className="px-4 py-2.5 font-mono text-gray-500">{r.partNo}</td>
                {r.monthData.map((md, j) => (
                  <>
                    <td key={j + 'p'} className="px-3 py-2.5 text-right text-gray-400 border-l border-gray-100">{md.prev ? md.prev.toLocaleString() : '—'}</td>
                    <td key={j + 'c'} className="px-3 py-2.5 text-right text-gray-700 font-medium">{md.curr ? md.curr.toLocaleString() : '—'}</td>
                    <td key={j + 'v'} className="px-3 py-2.5 text-right">
                      {md.prev === 0 && md.curr === 0 ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        <span className={`inline-block px-1.5 py-0.5 rounded-full font-medium ${
                          md.alert ? 'bg-amber-100 text-amber-700' :
                          md.diff > 0 ? 'bg-blue-100 text-blue-700' :
                          md.diff < 0 ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {md.pct >= 0 ? '+' : ''}{md.pct}%
                        </span>
                      )}
                    </td>
                  </>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}