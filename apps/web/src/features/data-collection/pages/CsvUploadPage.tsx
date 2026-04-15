import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface Period { id: string; name: string; }
interface ParsedRow { metric_code: string; value: string; period_start: string; period_end: string; }

export function CsvUploadPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ accepted: number; rejected: number; errors: string[] } | null>(null);

  useEffect(() => {
    if (tenant) loadPeriods();
  }, [tenant]);

  async function loadPeriods() {
    const res = await api<{ data: Period[] }>('/data/periods');
    setPeriods(res.data);
    if (res.data.length > 0) setSelectedPeriod(res.data[0].id);
  }

  const parseCsv = useCallback((text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
    return lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: any = {};
      headers.forEach((h, i) => { row[h] = values[i] || ''; });
      return row as ParsedRow;
    });
  }, []);

  function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCsv(e.target?.result as string);
      setParsedRows(rows);
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }

  async function handleUpload() {
    if (!selectedPeriod || parsedRows.length === 0) return;
    setUploading(true);
    try {
      const res = await api<{ data: { accepted: number; rejected: number; errors: string[] } }>(
        '/ingest/csv_upload',
        { method: 'POST', body: { reportingPeriodId: selectedPeriod, payload: parsedRows } },
      );
      setResult(res.data);
    } catch (err: any) {
      setResult({ accepted: 0, rejected: parsedRows.length, errors: [err.message] });
    } finally {
      setUploading(false);
    }
  }

  if (!tenant) return <p className="text-slate-500">Select a tenant first.</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/data')} className="text-slate-400 hover:text-slate-600 text-xl">&larr;</button>
        <h2 className="text-xl font-bold text-slate-800">CSV Upload</h2>
      </div>

      {/* Period selector */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-1">Reporting Period</label>
        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          {periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer mb-5 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
        onClick={() => document.getElementById('csv-input')?.click()}
      >
        <input id="csv-input" type="file" accept=".csv" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <div className="text-4xl mb-3">CSV</div>
        <div className="text-slate-600 font-medium">
          {fileName ? fileName : 'Drop a CSV file here or click to browse'}
        </div>
        <div className="text-sm text-slate-400 mt-2">
          Required columns: metric_code, value, period_start, period_end
        </div>
      </div>

      {/* Preview */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 mb-5 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center">
            <span className="font-medium text-slate-700">{parsedRows.length} rows parsed</span>
            <button onClick={handleUpload} disabled={uploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Upload to Platform'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-2 font-medium text-slate-500">#</th>
                  <th className="px-4 py-2 font-medium text-slate-500">Metric Code</th>
                  <th className="px-4 py-2 font-medium text-slate-500 text-right">Value</th>
                  <th className="px-4 py-2 font-medium text-slate-500">Period</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-2 font-mono text-xs">{row.metric_code}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{row.value}</td>
                    <td className="px-4 py-2 text-slate-500">{row.period_start} — {row.period_end}</td>
                  </tr>
                ))}
                {parsedRows.length > 20 && (
                  <tr><td colSpan={4} className="px-4 py-2 text-slate-400 text-center">
                    ...and {parsedRows.length - 20} more rows
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-xl p-5 ${result.rejected === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="font-semibold text-slate-800">
            Upload Complete: {result.accepted} accepted, {result.rejected} rejected
          </div>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
          <button onClick={() => navigate('/data')} className="mt-3 text-sm text-blue-600 hover:underline">
            View data points &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
