import { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import UploadPage from "./UploadPage";
import Dashboard from "./Dashboard";
import StockMonitor from "./stock/StockMonitor";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
        `${API}/api/forecast/compare?prevId=${prevId}&currId=${currId}`,
      );
      setResult(await res.json());
      setDashSearch("");
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

  function navigateTo(key) {
    setPage(key);
    setSidebarOpen(false);
  }

  const allRows = result?.rows || [];
  const alertCount = allRows.filter((r) => r.hasAlert).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        page={page}
        result={result}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarOpen={setSidebarOpen}
        setSidebarCollapsed={setSidebarCollapsed}
        navigateTo={navigateTo}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar
          page={page}
          result={result}
          dashSearch={dashSearch}
          setDashSearch={setDashSearch}
          exportCSV={exportCSV}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {page === "upload" ? (
            <div className="page-enter">
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
            </div>
          ) : page === "stock" ? (
            <div className="page-enter">
              <StockMonitor />
            </div>
          ) : (
            <div className="page-enter">
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
                  {alertCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-amber-500">⚠</span>
                      <span className="text-sm text-amber-800">
                        <strong>
                          {alertCount} part{alertCount > 1 ? "s" : ""}
                        </strong>{" "}
                        with &gt;{ALERT_PCT}% variance
                      </span>
                    </div>
                  )}
                  <Dashboard
                    allRows={allRows}
                    prevFile={result.prevFile}
                    currFile={result.currFile}
                    search={dashSearch}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
