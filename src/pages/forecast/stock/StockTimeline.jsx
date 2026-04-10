import { useState } from "react";

const LABEL_W = 220;
const COL_W = 80;

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

  const tableMinWidth = LABEL_W + weeks.length * COL_W;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
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

      {/* Main table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table
          className="text-xs"
          style={{
            tableLayout: "fixed",
            width: "100%",
            minWidth: `${tableMinWidth}px`,
          }}
        >
          <colgroup>
            <col style={{ width: `${LABEL_W}px` }} />
            {weeks.map((_, i) => (
              <col key={i} style={{ width: `${COL_W}px` }} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-3 py-2.5 text-gray-500 font-medium">
                Part No
              </th>
              {weeks.map((wk) => (
                <th
                  key={wk}
                  className="text-right px-2 py-2.5 text-gray-400 font-normal border-l border-gray-100"
                >
                  {weekLabel(wk)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={weeks.length + 1}
                  className="px-3 py-8 text-center text-gray-400"
                >
                  {search ? "No parts match your search" : "No parts at risk"}
                </td>
              </tr>
            )}
            {filtered.map((part, i) => (
              <SummaryRow
                key={i}
                part={part}
                weeks={weeks}
                weeksUntilLabel={weeksUntilLabel}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryRow({ part, weeks, weeksUntilLabel }) {
  const [expanded, setExpanded] = useState(false);
  const tableMinWidth = LABEL_W + part.weeks.length * COL_W;

  return (
    <>
      {/* Summary row */}
      <tr
        className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition ${part.shortageWeek ? "bg-red-50/30" : ""}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-3 py-2.5 font-medium text-gray-800">
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${part.shortageWeek ? "bg-red-400" : "bg-green-400"}`}
            ></span>
            <span className="truncate">{part.partNo}</span>
            {part.currentStock === 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 flex-shrink-0">
                no stock
              </span>
            )}
          </div>
        </td>
        {part.weeks.map((wk, j) => (
          <td
            key={j}
            className={`px-2 py-2.5 text-right border-l border-gray-100 font-medium ${
              wk.shortage
                ? "bg-red-100 text-red-600"
                : wk.balance < part.currentStock * 0.2 && wk.balance > 0
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
        <tr className="border-b border-gray-200">
          <td colSpan={weeks.length + 1} className="p-0 m-0">
            <div
              className="bg-gray-50 border-t-2 border-blue-100 overflow-x-auto"
              style={{ marginLeft: 0, paddingLeft: 0 }}
            >
              <table
                className="text-xs"
                style={{
                  tableLayout: "fixed",
                  width: "100%",
                  minWidth: `${tableMinWidth}px`,
                  marginLeft: 0,
                }}
              >
                <colgroup>
                  <col style={{ width: `${LABEL_W}px` }} />
                  {part.weeks.map((_, i) => (
                    <col key={i} style={{ width: `${COL_W}px` }} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-3 py-2 bg-gray-50">
                      <span className="text-xs text-gray-400 font-normal">
                        Initial stock{" "} : 
                      </span>
                      <span className="text-xs font-bold text-gray-700"> 
                        {part.currentStock.toLocaleString()} <span>pcs</span>
                      </span>
                    </th>
                    {part.weeks.map((wk, i) => (
                      <th
                        key={i}
                        className={`text-right px-2 py-2 font-semibold border-l border-gray-200 ${
                          wk.shortage
                            ? "text-red-500 bg-red-50"
                            : "text-gray-600 bg-gray-50"
                        }`}
                      >
                        {new Date(wk.week).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* PO row */}
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2 bg-gray-50">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                        <span className="text-gray-500 font-semibold">
                          PO Confirmed
                        </span>
                      </div>
                    </td>
                    {part.weeks.map((wk, i) => (
                      <td
                        key={i}
                        className={`px-2 py-2 text-right border-l border-gray-100 ${wk.shortage ? "bg-red-50" : "bg-white"}`}
                      >
                        {wk.demand > 0 && wk.demandType === "po" ? (
                          <span className="text-blue-600 font-medium">
                            -{wk.demand.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Forecast row */}
                  <tr>
                    <td className="px-3 py-2 bg-gray-50">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></span>
                        <span className="text-gray-500 font-semibold">
                          Forecast
                        </span>
                      </div>
                    </td>
                    {part.weeks.map((wk, i) => (
                      <td
                        key={i}
                        className={`px-2 py-2 text-right border-l border-gray-100 ${wk.shortage ? "bg-red-50" : "bg-white"}`}
                      >
                        {wk.demand > 0 && wk.demandType === "forecast" ? (
                          <span className="text-gray-500 font-medium">
                            -{wk.demand.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  {/* Incoming row */}
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-500 font-semibold bg-gray-50">
                      Incoming
                    </td>
                    {part.weeks.map((wk, i) => (
                      <td
                        key={i}
                        className={`px-2 py-2 text-right border-l border-gray-100 ${wk.shortage ? "bg-red-50" : "bg-white"}`}
                      >
                        {wk.incoming > 0 ? (
                          <span className="text-green-600 font-medium">
                            +{wk.incoming.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Invoice No row */}
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2 bg-gray-50">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
                        <span className="text-gray-400 font-medium">
                          Invoice No
                        </span>
                      </div>
                    </td>
                    {part.weeks.map((wk, i) => (
                      <td
                        key={i}
                        className={`px-2 py-2 text-right border-l border-gray-100 ${wk.shortage ? "bg-red-50" : "bg-white"}`}
                      >
                        {wk.incomingDetail && wk.incomingDetail.length > 0 ? (
                          <div className="space-y-0.5">
                            {[
                              ...new Set(
                                wk.incomingDetail
                                  .map((d) => d.invoiceNo)
                                  .filter(Boolean),
                              ),
                            ].map((inv, j) => (
                              <div
                                key={j}
                                className="text-xs text-gray-500 truncate"
                              >
                                {inv}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
