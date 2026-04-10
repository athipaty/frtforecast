export default function Sidebar({
  page, sidebarOpen, sidebarCollapsed,
  setSidebarOpen, setSidebarCollapsed, navigateTo
}) {
  return (
    <div className={`
      fixed lg:static inset-y-0 left-0 z-30
      bg-blue-900 flex flex-col flex-shrink-0
      transform transition-all duration-300 ease-in-out
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      ${sidebarCollapsed ? "lg:w-14" : "lg:w-48"}
      w-48
    `}>
      <div className="px-3 py-4 border-b border-blue-800 flex justify-between items-center flex-shrink-0">
        {!sidebarCollapsed && (
          <div className="lg:block">
            <p className="text-white font-bold text-sm tracking-wide">Production Control</p>
            <p className="text-blue-300 text-xs mt-0.5">Monitoring Tool</p>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(v => !v)}
          className="hidden lg:flex text-blue-300 hover:text-white transition p-1 rounded"
          title={sidebarCollapsed ? "Expand" : "Collapse"}
        >
          {sidebarCollapsed ? "→" : "←"}
        </button>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-blue-300 hover:text-white text-lg"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1">
        {[
          { key: "forecast", icon: "📊", label: "Forecast Compare" },
          { key: "stock",    icon: "📦", label: "Stock Monitor" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => navigateTo(item.key)}
            title={sidebarCollapsed ? item.label : ""}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-200 ${
              page === item.key
                ? "bg-white bg-opacity-20 text-white font-semibold"
                : "text-blue-300 hover:bg-white hover:bg-opacity-10 hover:text-white"
            } ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {!sidebarCollapsed && item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}