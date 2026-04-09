import { useState } from "react";

export default function NoChangeCard({ r, index, prevFile, currFile }) {
  const [expanded, setExpanded] = useState(false);
  const totalQty = r.monthData.reduce((s, md) => s + md.prev, 0);

  return (
    <div
      className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition"
      style={{ animation: "fadeSlideIn 0.3s ease forwards", animationDelay: `${Math.min(index * 0.03, 0.5)}s`, opacity: 0 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-gray-800">{r.partNo}</p>
          <p className="text-xs text-gray-400">{r.customer}</p>
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <span className="text-sm font-bold text-gray-400">+0%</span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-0.5 transition"
          >
            {expanded ? "▲ hide" : "▼ detail"}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">{totalQty.toLocaleString()} units · no change</p>

      {expanded && (
        <div
          className="mt-2 border-t border-gray-100 pt-2 overflow-x-auto"
          style={{ animation: "fadeIn 0.3s ease forwards", opacity: 0 }}
        >
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
              </tr>
            </thead>
            <tbody>
              {r.monthData.map((md, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 last:border-0"
                  style={{ animation: "fadeIn 0.3s ease forwards", opacity: 0, animationDelay: `${i * 0.04}s` }}
                >
                  <td className="py-1 text-gray-600 font-medium">{md.month}</td>
                  <td className="py-1 text-right text-gray-400">{md.prev ? md.prev.toLocaleString() : "—"}</td>
                  <td className="py-1 text-right text-gray-700 font-medium">{md.curr ? md.curr.toLocaleString() : "—"}</td>
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
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}