import ForecastCompare from './pages/forecast/index.jsx';

function ComingSoon() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400 text-3xl md:text-5xl tracking-widest">
        On plan
        <span className="inline-flex gap-1 ml-2">
          <span className="animate-bounce inline-block" style={{ animationDelay: '0ms' }}>.</span>
          <span className="animate-bounce inline-block" style={{ animationDelay: '150ms' }}>.</span>
          <span className="animate-bounce inline-block" style={{ animationDelay: '300ms' }}>.</span>
        </span>
      </p>
    </div>
  );
}

export default function App() {
  return <ComingSoon />;
}

// eslint-disable-next-line no-unused-vars
function ForecastApp() {
  return <ForecastCompare />;
}
