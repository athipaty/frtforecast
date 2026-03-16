import { useState, useEffect, useRef } from 'react';
import UploadSection from './UploadSection';
import Dashboard from './Dashboard';

const API = import.meta.env.VITE_API_URL;
const ALERT_PCT = 20;

export default function ForecastCompare() {
  const [uploads, setUploads] = useState([]);
  const [prevId, setPrevId] = useState('');
  const [currId, setCurrId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(true);
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
      fd.append('label', label);
      fd.append('file', file);
      await fetch(`${API}/api/forecast/upload`, { method: 'POST', body: fd });
      const res = await fetch(`${API}/api/forecast/list`);
      setUploads(await res.json());
    } catch {
      alert('Upload failed — try again');
    } finally {
      setUploading(false);
    }
  }

  async function handleCompare() {
    if (!prevId || !currId) return alert('Select both forecasts');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/forecast/compare?prevId=${prevId}&currId=${currId}`);
      setResult(await res.json());
      setUploadOpen(false); // ← auto collapse after compare
    } catch {
      alert('Compare failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    await fetch(`${API}/api/forecast/${id}`, { method: 'DELETE' });
    const res = await fetch(`${API}/api/forecast/list`);
    setUploads(await res.json());
  }

  function exportCSV() {
    if (!result) return;
    const headers = ['Customer', 'Part No', ...result.months.flatMap(m =>
      [`${m} Prev`, `${m} Curr`, `${m} Diff`, `${m} Var%`]
    )];
    const lines = [headers.join(',')];
    result.rows.forEach(r => {
      lines.push([r.customer, r.partNo, ...r.monthData.flatMap(md =>
        [md.prev, md.curr, md.diff, `${md.pct}%`]
      )].join(','));
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    a.download = 'forecast_comparison.csv';
    a.click();
  }

  const allRows = result?.rows || [];
  const alertCount = allRows.filter(r => r.hasAlert).length;
  const totalPrev = allRows.reduce((s, r) => s + r.monthData.reduce((ss, md) => ss + md.prev, 0), 0);
  const totalCurr = allRows.reduce((s, r) => s + r.monthData.reduce((ss, md) => ss + md.curr, 0), 0);
  const totalPct = totalPrev === 0 ? 0 : Math.round(((totalCurr - totalPrev) / totalPrev) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Forecast Comparison</h1>
            {result && <p className="text-xs text-gray-400 mt-0.5">{result.prevFile} → {result.currFile}</p>}
          </div>
          <div className="flex items-center gap-3">
            {result && (
              <button
                onClick={exportCSV}
                className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                ↓ Export CSV
              </button>
            )}
            {/* Toggle upload button */}
            <button
              onClick={() => setUploadOpen(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border ${
                uploadOpen
                  ? 'bg-gray-100 border-gray-200 text-gray-600'
                  : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploadOpen ? '✕ Close' : '↑ Upload / Compare'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Collapsible upload section */}
        {uploadOpen && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <UploadSection
              uploads={uploads}
              prevId={prevId} currId={currId}
              setPrevId={setPrevId} setCurrId={setCurrId}
              uploading={uploading} loading={loading}
              prevRef={prevRef} currRef={currRef}
              handleUpload={handleUpload}
              handleCompare={handleCompare}
              handleDelete={handleDelete}
            />
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {alertCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-amber-500">⚠</span>
                <span className="text-sm text-amber-800">
                  <strong>{alertCount} part{alertCount > 1 ? 's' : ''}</strong> with &gt;{ALERT_PCT}% variance in at least one month
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Parts compared', value: allRows.length, color: 'text-gray-800' },
                { label: 'Total previous qty', value: totalPrev.toLocaleString(), color: 'text-gray-800' },
                { label: 'Total current qty', value: totalCurr.toLocaleString(), color: 'text-gray-800' },
                { label: 'Overall change', value: `${totalPct >= 0 ? '+' : ''}${totalPct}%`, color: totalPct >= 0 ? 'text-blue-600' : 'text-red-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className={`text-2xl font-semibold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <Dashboard allRows={allRows} />
          </>
        )}
      </div>
    </div>
  );
}