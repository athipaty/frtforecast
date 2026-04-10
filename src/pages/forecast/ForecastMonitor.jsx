import { useState, useEffect, useRef } from "react";
import UploadPage from "./UploadPage";
import Dashboard from "./Dashboard";

const API = import.meta.env.VITE_API_URL;
const ALERT_PCT = 20;

export default function ForecastMonitor() {
  const [tab, setTab] = useState("upload");
  const [uploads, setUploads] = useState([]);
  const [prevId, setPrevId] = useState("");
  const [currId, setCurrId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dashSearch, setDashSearch] = useState("");
  const prevRef = useRef();
  const currRef = useRef();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await fetch(`${API}/api/forecast/list`);
        setUploads(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchList();
  }, []);

  async function handleUpload(label, file) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("label", label);
      fd.append("file", file);
      await fetch(`${API}/api/forecast/upload`, { method: "POST", body: fd });
      const res = await fetch(`${API}/api/forecast/list`);
      setUploads(await res.json());
    } catch {
      alert("Upload failed — try again");
    } finally {
      setUploading(false);
    }
  }

  async function handleCompare() {
    if (!prevId || !currId) return alert("Select both forecasts");
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/forecast/compare?prevId=${prevId}&currId=${currId}`
      );
      setResult(await res.json());
      setDashSearch("");
      setTab("dashboard");
    } catch {
      alert("Compare failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    await fetch(`${API}/api/forecast/${id}`, { method: "DELETE" });
    const res = await fetch(`${API}/api/forecast/list`);
    setUploads(await res.json());
  }

  function exportCSV() {
    if (!result) return;
    const headers = [
      "Customer", "Part No",
      ...result.months.flatMap(m => [`${m} Prev`, `${m} Curr`, `${m} Diff`, `${m} Var%`]),
    ];
    const lines = [headers.join(",")];
    result.rows.forEach(r => {
      lines.push(
        [r.customer, r.partNo, ...r.monthData.flatMap(md => [md.prev, md.curr, md.diff, `${md.pct}%`])].join(",")
      );
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    a.download = "forecast_comparison.csv";
    a.click();
  }

  const allRows = result?.rows || [];
  const alertCount = allRows.filter(r => r.hasAlert).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Forecast Compare</h2>
          <p className="text-xs text-gray-400 mt-0.5">Compare forecast files and track variance</p>
        </div>
        {tab === "dashboard" && result && (
          <div className="flex items-center gap-2">
            <input
              value={dashSearch}
              onChange={e => setDashSearch(e.target.value)}
              placeholder="Search part / customer…"
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 w-48"
            />
            <button
              onClick={exportCSV}
              className="border border-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition"
            >
              ↓ Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "upload",    label: "⬆ Upload Data" },
          { key: "dashboard", label: "📊 Dashboard", disabled: !result },
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
            {t.key === "dashboard" && result && (
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                ready
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alert bar */}
      {tab === "dashboard" && result && alertCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-amber-500">⚠</span>
          <span className="text-sm text-amber-800">
            <strong>{alertCount} part{alertCount > 1 ? "s" : ""}</strong> with &gt;{ALERT_PCT}% variance
          </span>
        </div>
      )}

      {/* Tab content */}
      {tab === "upload" && (
        <UploadPage
          uploads={uploads}
          prevId={prevId} currId={currId}
          setPrevId={setPrevId} setCurrId={setCurrId}
          uploading={uploading} loading={loading}
          prevRef={prevRef} currRef={currRef}
          handleUpload={handleUpload}
          handleCompare={handleCompare}
          handleDelete={handleDelete}
        />
      )}

      {tab === "dashboard" && (
        <>
          {!result ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-base font-semibold text-gray-700 mb-2">No comparison yet</h2>
              <p className="text-sm text-gray-400 mb-4">Upload and compare two forecasts first.</p>
              <button
                onClick={() => setTab("upload")}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                ▶ Go to Upload
              </button>
            </div>
          ) : (
            <Dashboard
              allRows={allRows}
              prevFile={result.prevFile}
              currFile={result.currFile}
              search={dashSearch}
            />
          )}
        </>
      )}
    </div>
  );
}