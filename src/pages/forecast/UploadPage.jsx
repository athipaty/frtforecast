import { useState } from "react";

export default function UploadPage({
  uploads,
  prevId,
  currId,
  setPrevId,
  setCurrId,
  uploading,
  loading,
  prevRef,
  currRef,
  handleUpload,
  handleCompare,
  handleDelete,
}) {
  const [formatOpen, setFormatOpen] = useState(false);
  const [prevFile, setPrevFile] = useState(null);
  const [currFile, setCurrFile] = useState(null);

  async function handleFileChange(label, file) {
    if (!file) return;
    if (label === "previous") setPrevFile(file.name);
    else setCurrFile(file.name);
    await handleUpload(label, file);
  }

  // Get latest upload for each label
  const latestPrev = uploads
    .filter((u) => u.label === "previous")
    .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
  const latestCurr = uploads
    .filter((u) => u.label === "current")
    .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Format guide — collapsed by default */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl overflow-hidden">
        <button
          onClick={() => setFormatOpen((v) => !v)}
          className="w-full flex justify-between items-center px-4 py-3 text-left"
        >
          <div>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Required Format
            </p>
            <p className="text-xs text-blue-400 mt-0.5">
              CSV or Excel file with these exact columns:
            </p>
          </div>
          <span className="text-blue-400 text-sm">
            {formatOpen ? "▲" : "▼"}
          </span>
        </button>

        {formatOpen && (
          <div className="px-4 pb-4">
            <div className="bg-white rounded-lg border border-blue-100 overflow-hidden mb-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    {[
                      "customer",
                      "part no",
                      "Feb-26",
                      "Mar-26",
                      "Apr-26",
                      "...",
                    ].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "AAA",
                      "TG949046-2600",
                      "1,000",
                      "-",
                      "1,000",
                      "...",
                    ],
                    [
                      "AHT",
                      "BC940-24404",
                      "16,000",
                      "20,040",
                      "18,336",
                      "...",
                    ],
                    [
                      "ADVICS",
                      "113631-10070",
                      "117,000",
                      "145,584",
                      "138,974",
                      "...",
                    ],
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}
                    >
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`px-3 py-2 ${j === 5 ? "text-gray-300" : "text-gray-500"}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "1st col: customer",
                "2nd col: part no",
                "Month cols: Feb-26, Mar-26…",
                "Use - or blank for zero",
              ].map((tip, i) => (
                <span
                  key={i}
                  className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full"
                >
                  ✓ {tip}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload + Select */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Upload Files
          </p>
          <div className="space-y-3">
            {[
              {
                label: "previous",
                file: prevFile,
                ref: prevRef,
                latest: latestPrev,
              },
              {
                label: "current",
                file: currFile,
                ref: currRef,
                latest: latestCurr,
              },
            ].map(({ label, file, ref, latest }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-1.5 capitalize">
                  {label} forecast
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  ref={ref}
                  className="hidden"
                  onChange={(e) => handleFileChange(label, e.target.files[0])}
                />
                <button
                  onClick={() => ref.current.click()}
                  disabled={uploading}
                  className={`w-full border-2 border-dashed rounded-lg p-3 text-sm transition text-left ${
                    file || latest
                      ? "border-blue-300 bg-blue-50 text-blue-600"
                      : "border-gray-200 bg-gray-50 text-gray-400 hover:border-blue-400 hover:text-blue-500"
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⟳</span> Uploading…
                    </span>
                  ) : file ? (
                    <span className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      <span className="truncate">{file}</span>
                    </span>
                  ) : latest ? (
                    <span className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      <span className="truncate">{latest.filename}</span>
                    </span>
                  ) : (
                    "+ Upload CSV / Excel"
                  )}
                </button>

                {/* Row count preview */}
                {latest && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {latest.rowCount.toLocaleString()} rows ·{" "}
                      {new Date(latest.uploadDate).toLocaleDateString()}
                    </span>
                    <span
                      className="text-xs text-blue-500 cursor-pointer hover:text-blue-700"
                      onClick={() => ref.current.click()}
                    >
                      replace
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Select & Compare */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Select & Compare
          </p>
          <div className="space-y-3">
            {[
              ["Previous", prevId, setPrevId],
              ["Current", currId, setCurrId],
            ].map(([label, val, setter]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-1.5">{label}</p>
                <select
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                >
                  <option value="">Select upload…</option>
                  {uploads.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.filename} · {u.rowCount} rows (
                      {new Date(u.uploadDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button
              onClick={handleCompare}
              disabled={loading || !prevId || !currId}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition"
            >
              {loading ? "Comparing…" : "Compare →"}
            </button>
          </div>
        </div>
      </div>

      {/* Upload history */}
      {uploads.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Upload History
            <span className="ml-2 text-gray-300 font-normal normal-case">
              {uploads.length} files
            </span>
          </p>
          <div className="space-y-2">
            {uploads.map((u) => (
              <div
                key={u._id}
                className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2.5 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.label === "current" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}
                  >
                    {u.label}
                  </span>
                  <div>
                    <p className="text-xs text-gray-700 font-medium">
                      {u.filename}
                    </p>
                    <p className="text-xs text-gray-400">
                      {u.rowCount.toLocaleString()} rows ·{" "}
                      {new Date(u.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(u._id)}
                  className="text-xs text-red-400 hover:text-red-600 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
