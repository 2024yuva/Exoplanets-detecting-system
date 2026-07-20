import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, Database, Search, Download, CheckCircle } from 'lucide-react';

export default function App() {
  const [ticId, setTicId] = useState('149603524');
  const [priority, setPriority] = useState('Routine');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [managementCatalog, setManagementCatalog] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchCatalog = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/targets');
      const data = await res.json();
      setManagementCatalog(data);
    } catch (err) {
      console.error("Failed fetching directory target registry matrix", err);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleRunPipeline = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tic_id: ticId, priority, notes })
      });
      if (!response.ok) throw new Error("Server error running pipeline analytics");
      const data = await response.json();
      setAnalysisResult(data);
      fetchCatalog();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8 text-indigo-400 animate-pulse" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ISRO Exoplanet Discovery Management Engine</h1>
            <p className="text-xs text-gray-400">Deep Learning Attention Networks & Photometric Pipeline Metrics</p>
          </div>
        </div>
        <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            📊 Analytics Dashboard
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'management' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            🗃️ Target Catalog Management
          </button>
        </div>
      </header>

      <main className="p-6">
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-xl h-fit">
              <h2 className="text-md font-semibold text-white border-b border-gray-700 pb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400" /> Control Diagnostics Panel
              </h2>
              <form onSubmit={handleRunPipeline} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Target TIC ID</label>
                  <input
                    type="text" value={ticId} onChange={(e) => setTicId(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 149603524" required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Follow-up Priority</label>
                  <select
                    value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option>Routine</option>
                    <option>High Priority</option>
                    <option>Immediate Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Observational Assessment Notes</label>
                  <textarea
                    value={notes} onChange={(e) => setNotes(e.target.value)} rows="3"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Annotate localized anomaly features..."
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Processing Array..." : "Execute Pipeline"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-3 space-y-6">
              {analysisResult ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-4 border border-gray-700 rounded-xl shadow">
                      <p className="text-xs text-gray-400 uppercase font-medium">Model Classification</p>
                      <p className="text-lg font-bold text-indigo-400 mt-1">{analysisResult.metrics.classification}</p>
                    </div>
                    <div className="bg-gray-800 p-4 border border-gray-700 rounded-xl shadow">
                      <p className="text-xs text-gray-400 uppercase font-medium">Signal Confidence Score</p>
                      <p className="text-lg font-bold text-green-400 mt-1">{analysisResult.metrics.confidence.toFixed(2)}%</p>
                    </div>
                    <div className="bg-gray-800 p-4 border border-gray-700 rounded-xl shadow">
                      <p className="text-xs text-gray-400 uppercase font-medium">Signal-to-Noise Ratio (SNR)</p>
                      <p className="text-lg font-bold text-yellow-400 mt-1">{analysisResult.metrics.snr}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-4 border border-gray-700 rounded-xl shadow">
                      <p className="text-xs text-gray-400 uppercase font-medium">Calculated Orbital Period</p>
                      <p className="text-xl font-mono text-white mt-1">{analysisResult.metrics.period} days</p>
                    </div>
                    <div className="bg-gray-800 p-4 border border-gray-700 rounded-xl shadow">
                      <p className="text-xs text-gray-400 uppercase font-medium">Transit Duration</p>
                      <p className="text-xl font-mono text-white mt-1">{analysisResult.additional_metrics.duration_hours} Hours</p>
                    </div>
                    <div className="bg-gray-800 p-4 border border-gray-700 rounded-xl shadow">
                      <p className="text-xs text-gray-400 uppercase font-medium">Transit Dip Depth</p>
                      <p className="text-xl font-mono text-white mt-1">{analysisResult.additional_metrics.depth.toFixed(6)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-4 border border-gray-700 rounded-xl shadow">
                      <h3 className="text-sm font-semibold mb-3 text-gray-300">Flattened Time-Series Data Curve</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analysisResult.plot_data.time_series}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="time" stroke="#9CA3AF" tick={{fontSize: 10}} domain={['auto', 'auto']} type="number"/>
                            <YAxis stroke="#9CA3AF" tick={{fontSize: 10}} domain={['auto', 'auto']} type="number"/>
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
                            <Line type="monotone" dataKey="flux" stroke="#9CA3AF" dot={false} strokeWidth={1} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-gray-800 p-4 border border-gray-700 rounded-xl shadow">
                      <h3 className="text-sm font-semibold mb-3 text-gray-300">Phase-Folded Target Transit Fit</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analysisResult.plot_data.phase_folded}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="phase" stroke="#9CA3AF" tick={{fontSize: 10}} domain={['auto', 'auto']} type="number"/>
                            <YAxis stroke="#9CA3AF" tick={{fontSize: 10}} domain={['auto', 'auto']} type="number"/>
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
                            <Line type="monotone" dataKey="flux" stroke="#6366F1" dot={false} strokeWidth={1.5} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl h-96 flex flex-col items-center justify-center text-gray-400">
                  <ShieldAlert className="w-12 h-12 text-gray-600 mb-3" />
                  <p className="text-sm">Pipeline state idle. Input configuration targets to render telemetry metrics charts.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Database className="text-indigo-400 w-5 h-5"/> Exoplanet Discovery Matrix</h2>
                <p className="text-xs text-gray-400">Database collection screening logged astronomical detections</p>
              </div>
            </div>

            {managementCatalog.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No telemetry screening logged to file directories yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full text-left border-collapse bg-gray-900">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50 text-xs font-semibold uppercase text-gray-400">
                      <th className="p-3">TIC ID</th>
                      <th className="p-3">Neural Classification</th>
                      <th className="p-3">Confidence</th>
                      <th className="p-3">Period</th>
                      <th className="p-3">SNR Matrix</th>
                      <th className="p-3">Follow-up Urgency</th>
                      <th className="p-3">Notes Comments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {managementCatalog.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/30 transition">
                        <td className="p-3 font-mono font-bold text-indigo-400">{item.tic_id}</td>
                        <td className="p-3 text-gray-200">{item.classification}</td>
                        <td className="p-3 text-green-400 font-mono">{item.confidence.toFixed(2)}%</td>
                        <td className="p-3 text-white font-mono">{item.period} days</td>
                        <td className="p-3 text-yellow-400 font-mono">{item.snr}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            item.priority === 'Routine' ? 'bg-gray-800 text-gray-400' :
                            item.priority === 'High Priority' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                            'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400 text-xs max-w-xs truncate">{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
