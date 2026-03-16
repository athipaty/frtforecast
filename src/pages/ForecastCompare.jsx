import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL;
const ALERT_PCT = 20;

export default function ForecastCompare() {
  const [uploads, setUploads] = useState([]);
  const [prevId, setPrevId] = useState("");
  const [currId, setCurrId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterCust, setFilterCust] = useState("ALL");
  const [alertOnly, setAlertOnly] = useState(false);
  const [search, setSearch] = useState("");
  const prevRef = useRef();
  const currRef = useRef();

  async function fetchList() {
    const res = await fetch(`${API}/api/forecast/list`);
    const data = await res.json();
    setUploads(data);
  }

  useEffect(() => {
    const fetchList = async () => {
      const res = await fetch(`${API}/api/forecast/list`);
      const data = await res.json();
      setUploads(data);
    };
    fetchList();
  }, []);

  async function handleUpload(label, file) {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("label", label);
    fd.append("file", file);
    await fetch(`${API}/api/forecast/upload`, { method: "POST", body: fd });
    await fetchList();
    setUploading(false);
  }

  async function handleCompare() {
    if (!prevId || !currId) return alert("Select both forecasts");
    setLoading(true);
    const res = await fetch(
      `${API}/api/forecast/compare?prevId=${prevId}&currId=${currId}`,
    );
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  async function handleDelete(id) {
    await fetch(`${API}/api/forecast/${id}`, { method: "DELETE" });
    await fetchList();
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
      const cols = [
        r.customer,
        r.partNo,
        ...r.monthData.flatMap((md) => [
          md.prev,
          md.curr,
          md.diff,
          `${md.pct}%`,
        ]),
      ];
      lines.push(cols.join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "forecast_comparison.csv";
    a.click();
  }

  // Filtered rows
  const rows = result
    ? result.rows
        .filter((r) => filterCust === "ALL" || r.customer === filterCust)
        .filter((r) => !alertOnly || r.hasAlert)
        .filter(
          (r) =>
            !search ||
            r.partNo.toLowerCase().includes(search.toLowerCase()) ||
            r.customer.toLowerCase().includes(search.toLowerCase()),
        )
        .sort(
          (a, b) =>
            b.hasAlert - a.hasAlert || a.customer.localeCompare(b.customer),
        )
    : [];

  const customers = result
    ? [...new Set(result.rows.map((r) => r.customer))].sort()
    : [];
  const alertCount = result ? result.rows.filter((r) => r.hasAlert).length : 0;
  const totalPrev = result
    ? result.rows.reduce(
        (s, r) => s + r.monthData.reduce((ss, md) => ss + md.prev, 0),
        0,
      )
    : 0;
  const totalCurr = result
    ? result.rows.reduce(
        (s, r) => s + r.monthData.reduce((ss, md) => ss + md.curr, 0),
        0,
      )
    : 0;
  const totalPct =
    totalPrev === 0
      ? 0
      : Math.round(((totalCurr - totalPrev) / totalPrev) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Forecast Comparison
        </h1>

        {/* Upload Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Upload Forecasts
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {["previous", "current"].map((label) => (
              <div key={label}>
                <p className="text-sm font-medium text-gray-700 mb-2 capitalize">
                  {label} Forecast
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  ref={label === "previous" ? prevRef : currRef}
                  className="hidden"
                  onChange={(e) => handleUpload(label, e.target.files[0])}
                />
                <button
                  onClick={() =>
                    (label === "previous" ? prevRef : currRef).current.click()
                  }
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
                >
                  {uploading ? "Uploading…" : "+ Upload CSV / Excel"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Select & Compare */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Select & Compare
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              ["Previous", prevId, setPrevId],
              ["Current", currId, setCurrId],
            ].map(([label, val, setter]) => (
              <div key={label}>
                <label className="text-xs text-gray-500 mb-1 block">
                  {label}
                </label>
                <select
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Select upload…</option>
                  {uploads.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.filename} —{" "}
                      {new Date(u.uploadDate).toLocaleDateString()} (
                      {u.rowCount} rows)
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={handleCompare}
              disabled={loading || !prevId || !currId}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition"
            >
              {loading ? "Comparing…" : "Compare"}
            </button>
            {result && (
              <button
                onClick={exportCSV}
                className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                ↓ Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Upload History */}
        {uploads.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Upload History
            </h2>
            <div className="space-y-2">
              {uploads.map((u) => (
                <div
                  key={u._id}
                  className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${u.label === "current" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {u.label}
                    </span>
                    <span className="text-gray-700">{u.filename}</span>
                    <span className="text-gray-400 ml-2">
                      {u.rowCount} rows ·{" "}
                      {new Date(u.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Summary metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                ["Parts compared", result.rows.length, "text-gray-800"],
                ["Total previous", totalPrev.toLocaleString(), "text-gray-800"],
                ["Total current", totalCurr.toLocaleString(), "text-gray-800"],
                [
                  "Overall change",
                  `${totalPct >= 0 ? "+" : ""}${totalPct}%`,
                  totalPct >= 0 ? "text-green-600" : "text-red-500",
                ],
              ].map(([label, val, color]) => (
                <div
                  key={label}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-xl font-semibold ${color}`}>{val}</p>
                </div>
              ))}
            </div>

            {/* Alert banner */}
            {alertCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 mb-4 flex items-center gap-2">
                <span>⚠</span>
                <span>
                  <strong>
                    {alertCount} part{alertCount > 1 ? "s" : ""}
                  </strong>{" "}
                  with &gt;{ALERT_PCT}% variance in at least one month
                </span>
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap items-center">
              <select
                value={filterCust}
                onChange={(e) => setFilterCust(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none"
              >
                <option value="ALL">All customers</option>
                {customers.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search part / customer…"
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none flex-1 min-w-[160px]"
              />
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertOnly}
                  onChange={(e) => setAlertOnly(e.target.checked)}
                />
                Alerts only
              </label>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">
                      Part No
                    </th>
                    {result.months.map((m) => (
                      <th
                        key={m}
                        colSpan={3}
                        className="text-center px-2 py-3 text-gray-500 font-medium border-l border-gray-100"
                      >
                        {m}
                      </th>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2"></th>
                    <th className="px-4 py-2"></th>
                    {result.months.map((m) => (
                      <>
                        <th
                          key={m + "p"}
                          className="px-2 py-2 text-gray-400 font-normal border-l border-gray-100"
                        >
                          Prev
                        </th>
                        <th
                          key={m + "c"}
                          className="px-2 py-2 text-gray-400 font-normal"
                        >
                          Curr
                        </th>
                        <th
                          key={m + "v"}
                          className="px-2 py-2 text-gray-400 font-normal"
                        >
                          Var%
                        </th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={i}
                      className={`border-b border-gray-50 hover:bg-gray-50 ${r.hasAlert ? "bg-amber-50/40" : ""}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-gray-700">
                        {r.customer}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-gray-500">
                        {r.partNo}
                      </td>
                      {r.monthData.map((md, j) => (
                        <>
                          <td
                            key={j + "p"}
                            className="px-2 py-2.5 text-right text-gray-400 border-l border-gray-100"
                          >
                            {md.prev ? md.prev.toLocaleString() : "-"}
                          </td>
                          <td
                            key={j + "c"}
                            className="px-2 py-2.5 text-right text-gray-700"
                          >
                            {md.curr ? md.curr.toLocaleString() : "-"}
                          </td>
                          <td key={j + "v"} className="px-2 py-2.5 text-right">
                            {md.prev === 0 && md.curr === 0 ? (
                              <span className="text-gray-300">-</span>
                            ) : (
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                  md.alert
                                    ? "bg-amber-100 text-amber-800"
                                    : md.diff > 0
                                      ? "bg-green-100 text-green-700"
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
                        </>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
