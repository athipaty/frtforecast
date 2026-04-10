import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import ForecastMonitor from "./ForecastMonitor";
import StockMonitor from "./stock/StockMonitor";

export default function ForecastCompare() {
  const [page, setPage] = useState("forecast");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function navigateTo(key) {
    setPage(key);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        page={page}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarOpen={setSidebarOpen}
        setSidebarCollapsed={setSidebarCollapsed}
        navigateTo={navigateTo}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {page === "forecast" ? (
            <div className="page-enter">
              <ForecastMonitor />
            </div>
          ) : (
            <div className="page-enter">
              <StockMonitor />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}