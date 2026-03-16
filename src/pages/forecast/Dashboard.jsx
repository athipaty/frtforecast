import { useState } from "react";

function MoverCard({ r, pct, month, diff, units, maxPct, isIncrease }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition">
      {/* Main row */}
      <div className="flex justify-between items-start mb-1.5">
        <div>
          <p className="text-sm font-semibold text-gray-800">{r.partNo}</p>
          <p className="text-xs text-gray-400">
            {r.customer} · {month}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <span
            className={`text-sm font-bold ${isIncrease ? "text-blue-600" : "text-red-500"}`}
          >
            {isIncrease ? "+" : ""}
            {pct}%
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-0.5 transition"
          >
            {expanded ? "▲ hide" : "▼ detail"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className={`w-full rounded-full h-2 ${isIncrease ? "bg-blue-50" : "bg-red-50"}`}
      >
        <div
          className={`h-2 rounded-full transition-all ${isIncrease ? "bg-blue-500" : "bg-red-400"}`}
          style={{ width: `${Math.min((Math.abs(pct) / maxPct) * 100, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{units}</span>
        <span>{diff}</span>
      </div>

      {/* Expanded detail table */}
      {expanded && (
        <div className="mt-3 border-t border-gray-100 pt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-1.5 text-gray-400 font-medium">
                  Month
                </th>
                <th className="text-right py-1.5 text-gray-400 font-medium">
                  Previous
                </th>
                <th className="text-right py-1.5 text-gray-400 font-medium">
                  Current
                </th>
                <th className="text-right py-1.5 text-gray-400 font-medium">
                  Diff
                </th>
                <th className="text-right py-1.5 text-gray-400 font-medium">
                  Var%
                </th>
              </tr>
            </thead>
            <tbody>
              {r.monthData.map((md, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-1.5 text-gray-600 font-medium">
                    {md.month}
                  </td>
                  <td className="py-1.5 text-right text-gray-400">
                    {md.prev ? md.prev.toLocaleString() : "—"}
                  </td>
                  <td className="py-1.5 text-right text-gray-700 font-medium">
                    {md.curr ? md.curr.toLocaleString() : "—"}
                  </td>
                  <td
                    className={`py-1.5 text-right font-medium ${md.diff > 0 ? "text-blue-500" : md.diff < 0 ? "text-red-400" : "text-gray-300"}`}
                  >
                    {md.diff > 0 ? "+" : ""}
                    {md.diff ? md.diff.toLocaleString() : "—"}
                  </td>
                  <td className="py-1.5 text-right">
                    {md.prev === 0 && md.curr === 0 ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-full font-medium ${
                          md.alert
                            ? "bg-amber-100 text-amber-700"
                            : md.diff > 0
                              ? "bg-blue-100 text-blue-700"
                              : md.diff < 0
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {md.pct >= 0 ? "+" : ""}
                        {md.pct}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ allRows }) {
  const topIncreases = [...allRows]
    .map((r) => {
      const maxPct = Math.max(...r.monthData.map((md) => md.pct));
      const bestMonth = r.monthData.find((md) => md.pct === maxPct);
      return { ...r, maxPct, bestMonth };
    })
    .filter((r) => r.maxPct > 0)
    .sort((a, b) => {
      // if both are 100%, sort by highest curr volume first
      if (a.maxPct === 100 && b.maxPct === 100) {
        return (b.bestMonth?.curr || 0) - (a.bestMonth?.curr || 0);
      }
      // otherwise sort by highest % first
      return b.maxPct - a.maxPct;
    })
    .slice(0, 50);

  const topDrops = [...allRows]
    .map((r) => {
      const minPct = Math.min(...r.monthData.map((md) => md.pct));
      const worstMonth = r.monthData.find((md) => md.pct === minPct);
      return { ...r, minPct, worstMonth };
    })
    .filter((r) => r.minPct < 0)
    .sort((a, b) => a.minPct - b.minPct)
    .slice(0, 50);

  const maxIncrease = topIncreases[0]?.maxPct || 100;
  const maxDrop = Math.abs(topDrops[0]?.minPct || 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top Increases */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
          <h3 className="text-sm font-semibold text-gray-700">
            Top 50 Increases
          </h3>
        </div>
        {topIncreases.length === 0 ? (
          <p className="text-sm text-gray-400">No increases found</p>
        ) : (
          <div className="space-y-3">
            {topIncreases.map((r, i) => (
              <MoverCard
                key={i}
                r={r}
                isIncrease={true}
                pct={r.maxPct}
                month={r.bestMonth?.month}
                units={`${r.bestMonth?.prev.toLocaleString()} → ${r.bestMonth?.curr.toLocaleString()}`}
                diff={`+${r.bestMonth?.diff.toLocaleString()} units`}
                maxPct={maxIncrease}
              />
            ))}
          </div>
        )}
      </div>

      {/* Top Drops */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
          <h3 className="text-sm font-semibold text-gray-700">Top 50 Drops</h3>
        </div>
        {topDrops.length === 0 ? (
          <p className="text-sm text-gray-400">No drops found</p>
        ) : (
          <div className="space-y-3">
            {topDrops.map((r, i) => (
              <MoverCard
                key={i}
                r={r}
                isIncrease={false}
                pct={r.minPct}
                month={r.worstMonth?.month}
                units={`${r.worstMonth?.prev.toLocaleString()} → ${r.worstMonth?.curr.toLocaleString()}`}
                diff={`${r.worstMonth?.diff.toLocaleString()} units`}
                maxPct={maxDrop}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
