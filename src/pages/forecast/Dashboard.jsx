import { useState } from "react";

function MoverCard({
  r,
  pct,
  month,
  diff,
  units,
  maxPct,
  isIncrease,
  index,
  totalPct,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition"
      style={{
        animation: "fadeSlideIn 0.3s ease forwards",
        animationDelay: `${Math.min(index * 0.03, 0.5)}s`,
        opacity: 0,
      }}
    >
      {/* Main row */}
      <div className="flex justify-between items-start mb-1.5">
        <div>
          <p className="text-sm font-semibold text-gray-800">{r.partNo}</p>
          <p className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
            {r.customer} · {month}
            <span
              className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-medium ${
                isIncrease
                  ? "bg-blue-100 text-blue-600"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {isIncrease ? "+" : ""}
              {pct}%
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <span
            className={`text-sm font-bold ${isIncrease ? "text-blue-600" : "text-red-500"}`}
          >
            {isIncrease ? "+" : ""}
            {totalPct}%
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
          className={`h-2 rounded-full bar-animate ${isIncrease ? "bg-blue-500" : "bg-red-400"}`}
          style={{
            width: `${Math.min((Math.abs(totalPct) / maxPct) * 100, 100)}%`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{units}</span>
        <span>{diff}</span>
      </div>

      {/* Expanded detail table */}
      {expanded && (
        <div
          className="mt-3 border-t border-gray-100 pt-3 overflow-x-auto"
          style={{ animation: "fadeIn 0.3s ease forwards", opacity: 0 }}
        >
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
                <tr
                  key={i}
                  className="border-b border-gray-50 last:border-0"
                  style={{
                    animation: "fadeIn 0.3s ease forwards",
                    opacity: 0,
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
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
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="py-2 text-gray-700 font-semibold text-xs">
                  Total
                </td>
                <td className="py-2 text-right text-gray-600 font-semibold text-xs">
                  {r.monthData
                    .reduce((s, md) => s + md.prev, 0)
                    .toLocaleString()}
                </td>
                <td className="py-2 text-right text-gray-800 font-semibold text-xs">
                  {r.monthData
                    .reduce((s, md) => s + md.curr, 0)
                    .toLocaleString()}
                </td>
                <td
                  className={`py-2 text-right font-semibold text-xs ${
                    r.monthData.reduce((s, md) => s + md.diff, 0) > 0
                      ? "text-blue-500"
                      : r.monthData.reduce((s, md) => s + md.diff, 0) < 0
                        ? "text-red-400"
                        : "text-gray-300"
                  }`}
                >
                  {r.monthData.reduce((s, md) => s + md.diff, 0) > 0 ? "+" : ""}
                  {r.monthData
                    .reduce((s, md) => s + md.diff, 0)
                    .toLocaleString()}
                </td>
                <td className="py-2 text-right text-xs">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded-full font-semibold ${
                      totalPct > 0
                        ? "bg-blue-100 text-blue-700"
                        : totalPct < 0
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {totalPct >= 0 ? "+" : ""}
                    {totalPct}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ allRows }) {
  const [filterNew, setFilterNew] = useState(false);
  // Helper to compute total % for a row
  function calcTotalPct(r) {
    const totalPrev = r.monthData.reduce((s, md) => s + md.prev, 0);
    const totalCurr = r.monthData.reduce((s, md) => s + md.curr, 0);
    return totalPrev === 0
      ? 0
      : Math.round(((totalCurr - totalPrev) / totalPrev) * 100);
  }

  const topIncreases = [...allRows]
    .map((r) => {
      const maxPct = Math.max(...r.monthData.map((md) => md.pct));
      const bestMonth = r.monthData.find((md) => md.pct === maxPct);
      const totalPct = calcTotalPct(r);
      return { ...r, maxPct, bestMonth, totalPct };
    })
    .filter(
      (r) =>
        r.totalPct > 0 &&
        (!filterNew || !(r.maxPct === 100 && r.bestMonth?.prev === 0)),
    )
    .sort((a, b) => b.totalPct - a.totalPct)
    .slice(0, 50);

  const topDrops = [...allRows]
    .map((r) => {
      const minPct = Math.min(...r.monthData.map((md) => md.pct));
      const worstMonth = r.monthData.find((md) => md.pct === minPct);
      const totalPct = calcTotalPct(r);
      return { ...r, minPct, worstMonth, totalPct };
    })
    .filter(
      (r) =>
        r.totalPct < 0 &&
        (!filterNew || !(r.minPct === -100 && r.worstMonth?.curr === 0)),
    )
    .sort((a, b) => a.totalPct - b.totalPct)
    .slice(0, 50);

  const maxIncrease = topIncreases[0]?.totalPct || 100;
  const maxDrop = Math.abs(topDrops[0]?.totalPct || 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Increases */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <h3 className="text-sm font-semibold text-gray-700">
              Top 50 Increases
            </h3>
          </div>
          <button
            onClick={() => setFilterNew((v) => !v)}
            className={`text-xs px-2.5 py-1 rounded-full border transition font-medium ${
              filterNew
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
          >
            {filterNew ? "Show all" : "✓ Without new items"}
          </button>
        </div>
        {topIncreases.length === 0 ? (
          <p className="text-sm text-gray-400">No increases found</p>
        ) : (
          <div className="space-y-3">
            {topIncreases.map((r, i) => (
              <MoverCard
                key={i}
                index={i}
                r={r}
                isIncrease={true}
                pct={r.maxPct}
                totalPct={r.totalPct}
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
                index={i}
                r={r}
                isIncrease={false}
                pct={r.minPct}
                totalPct={r.totalPct}
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
