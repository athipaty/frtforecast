export default function TopBar({ setSidebarOpen }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
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
    </div>
  );
}