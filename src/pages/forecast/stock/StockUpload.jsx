import { useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL;

const FILE_TYPES = [
  {
    key: "mapping",
    label: "Part No Mapping",
    description: "Maps stock system part no → forecast system part no",
    color: "purple",
    format: "stock_part_no, system_part_no",
    endpoint: "/api/stock/upload-mapping",
    useType: false,
  },
  {
    key: "current",
    label: "Current Stock",
    description: "Current on-hand stock quantity per part",
    color: "blue",
    format: "part_no, qty",
    endpoint: "/api/stock/upload-stock",
    useType: true,
  },
  {
    key: "incoming",
    label: "Incoming Stock",
    description: "Scheduled incoming supply per part",
    color: "green",
    format: "invoice_no, part_no, po_no, qty, eta",
    endpoint: "/api/stock/upload-stock",
    useType: true,
  },
  {
    key: "po",
    label: "PO Confirmed",
    description: "Firm customer demand (purchase orders)",
    color: "orange",
    format: "customer, part_no, qty, delivery_date",
    endpoint: "/api/stock/upload-stock",
    useType: true,
  },
  {
    key: "forecast",
    label: "Forecast Demand",
    description: "Soft demand — used when no PO exists",
    color: "gray",
    format: "customer, part_no, qty, delivery_date",
    endpoint: "/api/stock/upload-stock",
    useType: true,
  },
  {
    key: "excluded",
    label: "Production Parts",
    description: "Parts produced in-house — excluded from shortage display",
    color: "red",
    format: "part_no",
    endpoint: "/api/stock/upload-exclusions",
    useType: false,
  },
];

const COLOR_MAP = {
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500" },
  green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  dot: "bg-green-500" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
  gray:   { bg: "bg-gray-50",   border: "border-gray-200",   text: "text-gray-600",   dot: "bg-gray-400" },
  red:    { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    dot: "bg-red-500" },
};

export default function StockUpload({ status, onRefresh }) {
  const [uploading, setUploading] = useState(null);
  const [uploaded, setUploaded] = useState({});
  const refs = {
    mapping:  useRef(),
    current:  useRef(),
    incoming: useRef(),
    po:       useRef(),
    forecast: useRef(),
    excluded: useRef(),
  };

  async function handleUpload(type, file) {
    if (!file) return;
    setUploading(type);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const ft = FILE_TYPES.find((f) => f.key === type);
      if (ft.useType) fd.append("type", type);

      console.log(`Uploading ${type} to ${API}${ft.endpoint}`);
      const res = await fetch(`${API}${ft.endpoint}`, { method: "POST", body: fd });

      console.log("Response status:", res.status);
      const text = await res.text();
      console.log("Response text:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned: ${text.slice(0, 100)}`);
      }

      if (!res.ok || data.error) throw new Error(data.error || `Status ${res.status}`);

      setUploaded((v) => ({ ...v, [type]: file.name }));
      onRefresh();
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(null);
    }
  }

  async function handleClear() {
    if (!confirm("Clear all stock data?")) return;
    await fetch(`${API}/api/stock/clear`, { method: "DELETE" });
    setUploaded({});
    onRefresh();
  }

  function getStatusCount(key) {
    if (!status) return 0;
    const map = {
      mapping:  status.mapping,
      current:  status.currentStock,
      incoming: status.incomingStock,
      po:       status.poConfirmed,
      forecast: status.forecast,
      excluded: status.excludedParts || 0,
    };
    return map[key] || 0;
  }

  function getStatusLabel(key, count) {
    const labels = {
      mapping:  `${count} mappings`,
      current:  `${count} parts`,
      incoming: `${count} records`,
      po:       `${count} records`,
      forecast: `${count} records`,
      excluded: `${count} parts excluded`,
    };
    return labels[key] || `${count}`;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Format guide */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Upload Order</p>
        <p className="text-xs text-blue-500 mb-3">Upload mapping first — then other files in any order</p>
        <div className="flex items-center gap-2 flex-wrap text-xs text-blue-600">
          {["1. Mapping", "2. Current Stock", "3. Incoming Stock", "4. PO Confirmed", "5. Forecast", "6. Production Parts (optional)"].map((s, i) => (
            <span key={i} className="bg-blue-100 px-2 py-1 rounded-full">{s}</span>
          ))}
        </div>
      </div>

      {/* Upload cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FILE_TYPES.map((ft) => {
          const c = COLOR_MAP[ft.color];
          const count = getStatusCount(ft.key);
          const isUploaded = uploaded[ft.key] || count > 0;
          const isLoading = uploading === ft.key;

          return (
            <div
              key={ft.key}
              className={`rounded-xl border p-4 transition ${isUploaded ? `${c.bg} ${c.border}` : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`}></span>
                <p className={`text-sm font-semibold ${isUploaded ? c.text : "text-gray-700"}`}>
                  {ft.label}
                </p>
                {isUploaded && <span className={`ml-auto text-xs ${c.text}`}>✓</span>}
              </div>
              <p className="text-xs text-gray-400 mb-1">{ft.description}</p>
              <p className="text-xs text-gray-300 font-mono mb-3">{ft.format}</p>

              <input
                type="file" accept=".csv,.xlsx,.xls"
                ref={refs[ft.key]}
                className="hidden"
                onChange={(e) => handleUpload(ft.key, e.target.files[0])}
              />
              <button
                onClick={() => refs[ft.key].current.click()}
                disabled={isLoading}
                className={`w-full border-2 border-dashed rounded-lg py-2 text-xs transition ${
                  isUploaded
                    ? `${c.border} ${c.text} hover:opacity-80`
                    : "border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500"
                }`}
              >
                {isLoading
                  ? "⟳ Uploading…"
                  : isUploaded
                    ? `✓ ${uploaded[ft.key] || "Uploaded"} · replace`
                    : "+ Upload CSV / Excel"
                }
              </button>

              {count > 0 && (
                <p className={`text-xs mt-1.5 ${c.text}`}>
                  {getStatusLabel(ft.key, count)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      {status?.hasData && (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Upload Status</p>
          <div className="flex gap-4 flex-wrap">
            {[
              { label: "Mapping",        count: status.mapping,        color: "text-purple-600" },
              { label: "Current Stock",  count: status.currentStock,   color: "text-blue-600" },
              { label: "Incoming",       count: status.incomingStock,  color: "text-green-600" },
              { label: "PO Confirmed",   count: status.poConfirmed,    color: "text-orange-600" },
              { label: "Forecast",       count: status.forecast,       color: "text-gray-500" },
              { label: "Excluded",       count: status.excludedParts || 0, color: "text-red-500" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`text-sm font-bold ${count > 0 ? color : "text-gray-300"}`}>
                  {count > 0 ? "✓" : "○"}
                </span>
                <span className="text-xs text-gray-500">{label}</span>
                {count > 0 && <span className="text-xs text-gray-400">({count})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 items-center">
        <button
          onClick={handleClear}
          className="border border-red-200 text-red-400 hover:text-red-600 hover:border-red-300 px-4 py-2 rounded-lg text-xs transition"
        >
          Clear all data
        </button>
        {status?.hasData && (
          <p className="text-xs text-gray-400">
            Last updated: {new Date(status.uploadDate).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}