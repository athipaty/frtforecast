export default function UploadSection({
  uploads, prevId, currId,
  setPrevId, setCurrId,
  uploading, loading,
  prevRef, currRef,
  handleUpload, handleCompare, handleDelete
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Upload Forecasts</h2>
          <div className="space-y-3">
            {['previous', 'current'].map(label => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-1 capitalize">{label}</p>
                <input
                  type="file" accept=".csv,.xlsx,.xls"
                  ref={label === 'previous' ? prevRef : currRef}
                  className="hidden"
                  onChange={e => handleUpload(label, e.target.files[0])}
                />
                <button
                  onClick={() => (label === 'previous' ? prevRef : currRef).current.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-gray-200 rounded-lg p-3 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition"
                >
                  {uploading ? 'Uploading…' : '+ Upload CSV / Excel'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Select */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Select & Compare</h2>
          <div className="space-y-3">
            {[['Previous', prevId, setPrevId], ['Current', currId, setCurrId]].map(([label, val, setter]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <select
                  value={val}
                  onChange={e => setter(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Select upload…</option>
                  {uploads.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.filename} — {new Date(u.uploadDate).toLocaleDateString()} ({u.rowCount} rows)
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button
              onClick={handleCompare}
              disabled={loading || !prevId || !currId}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition mt-1"
            >
              {loading ? 'Comparing…' : 'Compare →'}
            </button>
          </div>
        </div>
      </div>

      {/* Upload history */}
      {uploads.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Upload History</h2>
          <div className="divide-y divide-gray-50">
            {uploads.map(u => (
              <div key={u._id} className="flex justify-between items-center py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.label === 'current' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.label}
                  </span>
                  <span className="text-gray-700">{u.filename}</span>
                  <span className="text-gray-400 text-xs">{u.rowCount} rows · {new Date(u.uploadDate).toLocaleDateString()}</span>
                </div>
                <button onClick={() => handleDelete(u._id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}