import { useState, useEffect, useRef } from "react";
import UploadPage from "./UploadPage";
import Dashboard from "./Dashboard";

const API = import.meta.env.VITE_API_URL;
const ALERT_PCT = 20;

export default function ForecastCompare() {
  const [page, setPage] = useState("upload");
  const [uploads, setUploads] = useState([]);
  const [prevId, setPrevId] = useState("");
  const [currId, setCurrId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
        `${API}/api/forecast/compare?prevId=${prevId}&currId=${currId}`,
      );
      setResult(await res.json());
      setPage("dashboard");
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
      "Customer",
      "Part No",
      ...result.months.flatMap((m) => [
        `${m} Prev`,
        `${m} Curr`,
        `${m} Diff`,
        `${m} Var%`,
      ]),
    ];
    const lines = [headers.join(",")];
    result.rows.forEach((r) => {
      lines.push(
        [
          r.customer,
          r.partNo,
          ...r.monthData.flatMap((md) => [
            md.prev,
            md.curr,
            md.diff,
            `${md.pct}%`,
          ]),
        ].join(","),
      );
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([lines.join("\n")], { type: "text/csv" }),
    );
    a.download = "forecast_comparison.csv";
    a.click();
  }

  const allRows = result?.rows || [];
  const alertCount = allRows.filter((r) => r.hasAlert).length;
  const totalPrev = allRows.reduce(
    (s, r) => s + r.monthData.reduce((ss, md) => ss + md.prev, 0),
    0,
  );
  const totalCurr = allRows.reduce(
    (s, r) => s + r.monthData.reduce((ss, md) => ss + md.curr, 0),
    0,
  );
  const totalPct =
    totalPrev === 0
      ? 0
      : Math.round(((totalCurr - totalPrev) / totalPrev) * 100);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-48 bg-blue-900 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-blue-800">
          <p className="text-white font-bold text-sm tracking-wide">FORECAST</p>
          <p className="text-blue-300 text-xs mt-0.5">Comparison Tool</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-1">
          <button
            onClick={() => setPage("upload")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition ${
              page === "upload"
                ? "bg-white bg-opacity-20 text-white font-semibold"
                : "text-blue-300 hover:bg-white hover:bg-opacity-10 hover:text-white"
            }`}
          >
            <span>⬆</span> Upload
          </button>
          <button
            onClick={() => setPage("dashboard")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition ${
              page === "dashboard"
                ? "bg-white bg-opacity-20 text-white font-semibold"
                : "text-blue-300 hover:bg-white hover:bg-opacity-10 hover:text-white"
            }`}
          >
            <span>📊</span> Dashboard
            {result && (
              <span className="ml-auto text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                ready
              </span>
            )}
          </button>
        </nav>

        {/* Last compare info */}
        {result && (
          <div className="px-4 py-3 border-t border-blue-800">
            <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">
              Last compare
            </p>
            <p className="text-xs text-white truncate">{result.prevFile}</p>
            <p className="text-xs text-blue-300 truncate">
              → {result.currFile}
            </p>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-base font-semibold text-gray-800">
              {page === "upload" ? "Upload Forecasts" : "Dashboard"}
            </h1>
            {result && page === "dashboard" && (
              <p className="text-xs text-gray-400 mt-0.5">
                {result.prevFile} → {result.currFile}
              </p>
            )}
          </div>
          {result && page === "dashboard" && (
            <button
              onClick={exportCSV}
              className="border border-gray-200 px-4 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              ↓ Export CSV
            </button>
          )}
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload page */}
          {page === "upload" && (
            <UploadPage
              uploads={uploads}
              prevId={prevId}
              currId={currId}
              setPrevId={setPrevId}
              setCurrId={setCurrId}
              uploading={uploading}
              loading={loading}
              prevRef={prevRef}
              currRef={currRef}
              handleUpload={handleUpload}
              handleCompare={handleCompare}
              handleDelete={handleDelete}
            />
          )}

          {/* Dashboard page */}
          {page === "dashboard" && (
            <>
              {!result ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-24">
                  <div className="text-5xl mb-4">📊</div>
                  <h2 className="text-base font-semibold text-gray-700 mb-2">
                    No comparison yet
                  </h2>
                  <p className="text-sm text-gray-400">
                    Go to Upload and compare two forecasts first.
                  </p>
                  <button
                    onClick={() => setPage("upload")}
                    className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Go to Upload →
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Alert */}
                  {alertCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
                      <span className="text-amber-500">⚠</span>
                      <span className="text-sm text-amber-800">
                        <strong>
                          {alertCount} part{alertCount > 1 ? "s" : ""}
                        </strong>{" "}
                        with &gt;{ALERT_PCT}% variance
                      </span>
                    </div>
                  )}

                  {/* Summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Parts compared",
                        value: allRows.length,
                        cls: "text-gray-800",
                      },
                      {
                        label: "Total previous qty",
                        value: totalPrev.toLocaleString(),
                        cls: "text-gray-800",
                      },
                      {
                        label: "Total current qty",
                        value: totalCurr.toLocaleString(),
                        cls: "text-gray-800",
                      },
                      {
                        label: "Overall change",
                        value: `${totalPct >= 0 ? "+" : ""}${totalPct}%`,
                        cls: totalPct >= 0 ? "text-blue-600" : "text-red-500",
                      },
                    ].map(({ label, value, cls }) => (
                      <div
                        key={label}
                        className="bg-white border border-gray-200 rounded-xl p-4"
                      >
                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                        <p className={`text-2xl font-semibold ${cls}`}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Dashboard allRows={allRows} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
