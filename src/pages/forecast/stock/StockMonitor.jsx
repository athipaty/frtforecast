import { useState, useEffect } from "react";
import StockUpload from "./StockUpload";
import StockTimeline from "./StockTimeline";

const API = import.meta.env.VITE_API_URL;

export default function StockMonitor() {
  const [tab, setTab] = useState("upload");
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch(`${API}/api/stock/status`);
      setStatus(await res.json());
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCalculate() {
    setCalculating(true);
    try {
      const res = await fetch(`${API}/api/stock/calculate`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setTab("timeline");
    } catch (err) {
      alert(`Calculate failed: ${err.message}`);
    } finally {
      setCalculating(false);
    }
  }

  const canCalculate = status?.hasData &&
    status.mapping > 0 &&
    status.currentStock > 0 &&
    (status.poConfirmed > 0 || status.forecast > 0);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Stock Monitor</h2>
          <p className="text-xs text-gray-400 mt-0.5">Weekly shortage prediction by part number</p>
        </div>
        {canCalculate && (
          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition"
          >
            {calculating ? "Calculating…" : "▶ Run Calculation"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "upload", label: "⬆ Upload Data" },
          { key: "timeline", label: "📅 Timeline", disabled: !result },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => !t.disabled && setTab(t.key)}
            disabled={t.disabled}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              tab === t.key
                ? "bg-white text-gray-800 shadow-sm"
                : t.disabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.key === "timeline" && result && (
              <span className="ml-1.5 text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">
                {result.parts.filter(p => p.shortageWeek).length} at risk
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "upload" && (
        <StockUpload status={status} onRefresh={fetchStatus} />
      )}

      {tab === "timeline" && result && (
        <StockTimeline weeks={result.weeks} parts={result.parts} />
      )}
    </div>
  );
}