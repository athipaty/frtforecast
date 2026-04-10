import { useState } from "react";

export default function StockTimeline({ weeks, parts }) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = parts
    .filter(
      (p) => !search || p.partNo.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((p) => showAll || p.shortageWeek !== null);

  const shortageCount = parts.filter((p) => p.shortageWeek).length;
  const safeCount = parts.filter((p) => !p.shortageWeek).length;

  function weekLabel(wk) {
    const d = new Date(wk);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  function weeksUntilLabel(n) {
    if (n === 0) return "This week";
    if (n === 1) return "Next week";
    return `${n} weeks`;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-500">{shortageCount}</p>
          <p className="text-xs text-red-400 mt-0.5">Parts at risk</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{safeCount}</p>
          <p className="text-xs text-green-500 mt-0.5">Parts safe</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-700">{parts.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total parts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search part no…"
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 w-48"
        />
        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
          />
          Show safe parts too
        </label>
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} parts shown
        </span>
      </div>

      {/* Timeline table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="text-xs w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1.5 text-gray-400 font-medium pr-4">
                Week
              </th>
              <th className="text-left py-1.5 text-gray-400 font-medium pr-4">
                Invoice
              </th>
              <th className="text-left py-1.5 text-gray-400 font-medium pr-4">
                PO No
              </th>
              <th className="text-right py-1.5 text-gray-400 font-medium pr-4">
                Incoming
              </th>
              {weeks.map((wk) => (
                <th
                  key={wk}
                  className="text-right px-2 py-2.5 text-gray-400 font-normal min-w-[60px] border-l border-gray-100"
                >
                  {weekLabel(wk)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((part, i) => (
              <PartRow
                key={i}
                part={part}
                weeks={weeks}
                weeksUntilLabel={weeksUntilLabel}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={weeks.length + 3}
                  className="px-3 py-8 text-center text-gray-400"
                >
                  {search ? "No parts match your search" : "No parts at risk"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PartRow({ part, weeks, weeksUntilLabel }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition ${part.shortageWeek ? "bg-red-50/30" : ""}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-3 py-2.5 font-medium text-gray-800 sticky left-0 bg-white">
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${part.shortageWeek ? "bg-red-400" : "bg-green-400"}`}
            ></span>
            {part.partNo}
          </div>
        </td>
        <td className="px-3 py-2.5 text-right text-gray-600 font-medium">
          {part.currentStock.toLocaleString()}
        </td>
        <td className="px-3 py-2.5 text-center">
          {part.shortageWeek ? (
            <span className="inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
              {weeksUntilLabel(part.weeksUntilShortage)}
            </span>
          ) : (
            <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-medium">
              Safe
            </span>
          )}
        </td>
        {part.weeks.map((wk, j) => (
          <td
            key={j}
            className={`px-2 py-2.5 text-right border-l border-gray-100 font-medium ${
              wk.shortage
                ? "bg-red-100 text-red-600"
                : wk.balance < part.currentStock * 0.2
                  ? "bg-amber-50 text-amber-700"
                  : "text-gray-600"
            }`}
          >
            {wk.balance.toLocaleString()}
          </td>
        ))}
      </tr>

      {/* Expanded detail */}
      {expanded && (
        <tr className="border-b border-gray-100">
          <td colSpan={weeks.length + 3} className="px-3 py-3 bg-gray-50">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1.5 text-gray-400 font-medium pr-4">
                      Week
                    </th>
                    <th className="text-right py-1.5 text-gray-400 font-medium pr-4">
                      Incoming
                    </th>
                    <th className="text-right py-1.5 text-gray-400 font-medium pr-4">
                      Demand
                    </th>
                    <th className="text-right py-1.5 text-gray-400 font-medium pr-4">
                      Type
                    </th>
                    <th className="text-right py-1.5 text-gray-400 font-medium">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Opening balance row */}
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-500 font-medium pr-4">
                      Opening
                    </td>
                    <td className="py-1.5 text-right text-gray-400 pr-4">—</td>
                    <td className="py-1.5 text-right text-gray-400 pr-4">—</td>
                    <td className="py-1.5 text-right text-gray-400 pr-4">—</td>
                    <td className="py-1.5 text-right font-semibold text-gray-700">
                      {part.currentStock.toLocaleString()}
                    </td>
                  </tr>
                  {part.weeks.map((wk, i) => (
                    <tr
                      key={i}
                      className={`border-b border-gray-50 last:border-0 ${wk.shortage ? "bg-red-50" : ""}`}
                    >
                      <td className="py-1.5 text-gray-600 font-medium pr-4">
                        {wk.week}
                      </td>
                      <td className="py-1.5 text-right text-green-600 pr-4">
                        {wk.incoming > 0
                          ? `+${wk.incoming.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="py-1.5 text-right text-red-400 pr-4">
                        {wk.demand > 0 ? `-${wk.demand.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-1.5 text-right pr-4">
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-xs ${
                            wk.demandType === "po"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {wk.demand > 0 ? wk.demandType : "—"}
                        </span>
                      </td>
                      <td
                        className={`py-1.5 text-right font-semibold ${wk.shortage ? "text-red-600" : "text-gray-700"}`}
                      >
                        {wk.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
