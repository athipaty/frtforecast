import { useState } from "react";

export default function MoverCard({ r, pct, month, diff, units, maxPct, isIncrease, index, totalPct, prevFile, currFile }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition"
      style={{ animation: "fadeSlideIn 0.3s ease forwards", animationDelay: `${Math.min(index * 0.03, 0.5)}s`, opacity: 0 }}
    >
      <div className="flex justify-between items-start mb-1.5">
        <div>
          <p className="text-sm font-semibold text-gray-800">{r.partNo}</p>
          <p className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
            {r.customer} · {month}
            <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-medium ${
              isIncrease ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-500"
            }`}>
              {isIncrease ? "+" : ""}{pct}%
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <span className={`text-sm font-bold ${isIncrease ? "text-blue-600" : "text-red-500"}`}>
            {isIncrease ? "+" : ""}{totalPct}%
          </span>
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-0.5 transition"
          >
            {expanded ? "▲ hide" : "▼ detail"}
          </button>
        </div>
      </div>

      <div className={`w-full rounded-full h-1.5 ${isIncrease ? "bg-blue-50" : "bg-red-50"}`}>
        <div
          className={`h-1.5 rounded-full ${isIncrease ? "bg-blue-500" : "bg-red-400"}`}
          style={{ width: `${Math.min((Math.abs(totalPct) / maxPct) * 100, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{units}</span>
        <span>{diff}</span>
      </div>

      {expanded && (
        <div className="mt-2 border-t border-gray-100 pt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-1 text-gray-400 font-medium">Month</th>
                <th className="text-right py-1 text-gray-400 font-medium">
                  {prevFile ? prevFile.replace(/\.[^.]+$/, "") : "Previous"}
                </th>
                <th className="text-right py-1 text-gray-400 font-medium">
                  {currFile ? currFile.replace(/\.[^.]+$/, "") : "Current"}
                </th>
                <th className="text-right py-1 text-gray-400 font-medium">Diff</th>
                <th className="text-right py-1 text-gray-400 font-medium">Var%</th>
              </tr>
            </thead>
            <tbody>
              {r.monthData.map((md, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-1 text-gray-600 font-medium">{md.month}</td>
                  <td className="py-1 text-right text-gray-400">{md.prev ? md.prev.toLocaleString() : "—"}</td>
                  <td className="py-1 text-right text-gray-700 font-medium">{md.curr ? md.curr.toLocaleString() : "—"}</td>
                  <td className={`py-1 text-right font-medium ${md.diff > 0 ? "text-blue-500" : md.diff < 0 ? "text-red-400" : "text-gray-300"}`}>
                    {md.diff > 0 ? "+" : ""}{md.diff ? md.diff.toLocaleString() : "—"}
                  </td>
                  <td className="py-1 text-right">
                    {md.prev === 0 && md.curr === 0 ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      <span className={`inline-block px-1.5 py-0.5 rounded-full font-medium ${
                        md.alert ? "bg-amber-100 text-amber-700" :
                        md.diff > 0 ? "bg-blue-100 text-blue-700" :
                        md.diff < 0 ? "bg-red-100 text-red-600" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {md.pct >= 0 ? "+" : ""}{md.pct}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="py-1.5 text-gray-700 font-semibold text-xs">Total</td>
                <td className="py-1.5 text-right text-gray-600 font-semibold text-xs">
                  {r.monthData.reduce((s, md) => s + md.prev, 0).toLocaleString()}
                </td>
                <td className="py-1.5 text-right text-gray-800 font-semibold text-xs">
                  {r.monthData.reduce((s, md) => s + md.curr, 0).toLocaleString()}
                </td>
                <td className={`py-1.5 text-right font-semibold text-xs ${
                  r.monthData.reduce((s, md) => s + md.diff, 0) > 0 ? "text-blue-500" :
                  r.monthData.reduce((s, md) => s + md.diff, 0) < 0 ? "text-red-400" : "text-gray-300"
                }`}>
                  {r.monthData.reduce((s, md) => s + md.diff, 0) > 0 ? "+" : ""}
                  {r.monthData.reduce((s, md) => s + md.diff, 0).toLocaleString()}
                </td>
                <td className="py-1.5 text-right text-xs">
                  <span className={`inline-block px-1.5 py-0.5 rounded-full font-semibold ${
                    totalPct > 0 ? "bg-blue-100 text-blue-700" :
                    totalPct < 0 ? "bg-red-100 text-red-600" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {totalPct >= 0 ? "+" : ""}{totalPct}%
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