export default function TopBar({ page, result, dashSearch, setDashSearch, exportCSV, setSidebarOpen }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
        >
          <div className="space-y-1">
            <div className="w-5 h-0.5 bg-current"></div>
            <div className="w-5 h-0.5 bg-current"></div>
            <div className="w-5 h-0.5 bg-current"></div>
          </div>
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-800">
            {page === "upload" ? "Upload Forecasts" : "Dashboard"}
          </h1>
          {result && page === "dashboard" && (
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
              {result.prevFile} → {result.currFile}
            </p>
          )}
        </div>
      </div>

      {result && page === "dashboard" && (
        <div className="flex items-center gap-2">
          <input
            value={dashSearch}
            onChange={(e) => setDashSearch(e.target.value)}
            placeholder="Search part / customer…"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 w-36 sm:w-48"
          />
          <button
            onClick={exportCSV}
            className="border border-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition flex-shrink-0"
          >
            ↓ Export CSV
          </button>
        </div>
      )}
    </div>
  );
}