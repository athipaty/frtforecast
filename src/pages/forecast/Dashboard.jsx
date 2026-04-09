import { useState } from "react";
import MoverCard from "./MoverCard";
import NoChangeCard from "./NoChangeCard";

export default function Dashboard({ allRows, prevFile, currFile, search = "" }) {
  const [filterNew, setFilterNew] = useState(false);

  function calcTotalPct(r) {
    const totalPrev = r.monthData.reduce((s, md) => s + md.prev, 0);
    const totalCurr = r.monthData.reduce((s, md) => s + md.curr, 0);
    return totalPrev === 0 ? 0 : Math.round(((totalCurr - totalPrev) / totalPrev) * 100);
  }

  const filtered = search
    ? allRows.filter((r) =>
        r.partNo.toLowerCase().includes(search.toLowerCase()) ||
        r.customer.toLowerCase().includes(search.toLowerCase())
      )
    : allRows;

  const topIncreases = [...filtered]
    .map((r) => {
      const maxPct = Math.max(...r.monthData.map((md) => md.pct));
      const bestMonth = r.monthData.find((md) => md.pct === maxPct);
      const totalPct = calcTotalPct(r);
      return { ...r, maxPct, bestMonth, totalPct };
    })
    .filter((r) => r.totalPct > 0 && (!filterNew || !(r.maxPct === 100 && r.bestMonth?.prev === 0)))
    .sort((a, b) => b.totalPct - a.totalPct)
    .slice(0, 200);

  const topDrops = [...filtered]
    .map((r) => {
      const minPct = Math.min(...r.monthData.map((md) => md.pct));
      const worstMonth = r.monthData.find((md) => md.pct === minPct);
      const totalPct = calcTotalPct(r);
      return { ...r, minPct, worstMonth, totalPct };
    })
    .filter((r) => r.totalPct < 0 && (!filterNew || !(r.minPct === -100 && r.worstMonth?.curr === 0)))
    .sort((a, b) => a.totalPct - b.totalPct)
    .slice(0, 50);

  const noChange = [...filtered]
    .map((r) => {
      const totalPrev = r.monthData.reduce((s, md) => s + md.prev, 0);
      const totalCurr = r.monthData.reduce((s, md) => s + md.curr, 0);
      const totalPct = calcTotalPct(r);
      return { ...r, totalPct, totalPrev, totalCurr };
    })
    .filter((r) => r.totalPct === 0 && r.totalPrev > 0 && r.totalCurr > 0)
    .sort((a, b) => b.totalPrev - a.totalPrev);

  const maxIncrease = topIncreases[0]?.totalPct || 100;
  const maxDrop = Math.abs(topDrops[0]?.totalPct || 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">

      {/* Increases */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <h3 className="text-sm font-semibold text-gray-700">
              Increases <span className="text-gray-400 font-normal text-xs">({topIncreases.length})</span>
              {search && <span className="text-gray-400 font-normal"> · filtered</span>}
            </h3>
          </div>
          <button
            onClick={() => setFilterNew((v) => !v)}
            className={`text-xs px-2 py-0.5 rounded-full border transition font-medium ${
              filterNew ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
          >
            {filterNew ? "No new" : "All"}
          </button>
        </div>
        {topIncreases.length === 0 ? (
          <p className="text-sm text-gray-400">{search ? "No results" : "No increases found"}</p>
        ) : (
          <div className="space-y-2">
            {topIncreases.map((r, i) => (
              <MoverCard
                key={i} index={i} r={r}
                isIncrease={true}
                pct={r.maxPct}
                totalPct={r.totalPct}
                month={r.bestMonth?.month}
                units={`${r.bestMonth?.prev.toLocaleString()} → ${r.bestMonth?.curr.toLocaleString()}`}
                diff={`+${r.bestMonth?.diff.toLocaleString()} units`}
                maxPct={maxIncrease}
                prevFile={prevFile}
                currFile={currFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drops */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
          <h3 className="text-sm font-semibold text-gray-700">
            Drops <span className="text-gray-400 font-normal text-xs">({topDrops.length})</span>
            {search && <span className="text-gray-400 font-normal"> · filtered</span>}
          </h3>
        </div>
        {topDrops.length === 0 ? (
          <p className="text-sm text-gray-400">{search ? "No results" : "No drops found"}</p>
        ) : (
          <div className="space-y-2">
            {topDrops.map((r, i) => (
              <MoverCard
                key={i} index={i} r={r}
                isIncrease={false}
                pct={r.minPct}
                totalPct={r.totalPct}
                month={r.worstMonth?.month}
                units={`${r.worstMonth?.prev.toLocaleString()} → ${r.worstMonth?.curr.toLocaleString()}`}
                diff={`${r.worstMonth?.diff.toLocaleString()} units`}
                maxPct={maxDrop}
                prevFile={prevFile}
                currFile={currFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* No Change */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span>
          <h3 className="text-sm font-semibold text-gray-700">
            No Change <span className="text-gray-400 font-normal text-xs">({noChange.length})</span>
            {search && <span className="text-gray-400 font-normal"> · filtered</span>}
          </h3>
        </div>
        {noChange.length === 0 ? (
          <p className="text-sm text-gray-400">{search ? "No results" : "No unchanged items"}</p>
        ) : (
          <div className="space-y-2">
            {noChange.map((r, i) => (
              <NoChangeCard
                key={i} index={i} r={r}
                prevFile={prevFile}
                currFile={currFile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}