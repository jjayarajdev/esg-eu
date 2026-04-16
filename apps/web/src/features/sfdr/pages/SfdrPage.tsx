import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface PaiIndicator { id: string; name: string; category: string; unit: string; description: string; value: number | null; }
interface Fund { id: string; status: string; metadata: { fundName: string; article: number; aum: number; description: string; paiValues: PaiIndicator[] }; }

const ARTICLE_COLORS: Record<number, string> = { 6: 'bg-slate-100 text-slate-700', 8: 'bg-emerald-100 text-emerald-700', 9: 'bg-blue-100 text-blue-700' };
const ARTICLE_LABELS: Record<number, string> = { 6: 'Article 6', 8: 'Article 8 (Light Green)', 9: 'Article 9 (Dark Green)' };

export function SfdrPage() {
  const { tenant } = useAuth();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [selected, setSelected] = useState<Fund | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newArticle, setNewArticle] = useState(8);
  const [newAum, setNewAum] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => { if (tenant) loadFunds(); }, [tenant]);

  async function loadFunds() {
    const res = await api<{ data: Fund[] }>('/sfdr/funds');
    setFunds(res.data);
  }
  async function loadFund(id: string) {
    const res = await api<{ data: Fund }>(`/sfdr/funds/${id}`);
    setSelected(res.data);
  }
  async function createFund() {
    if (!newName) return;
    const res = await api<{ data: Fund }>('/sfdr/funds', {
      method: 'POST', body: { fundName: newName, article: newArticle, aum: newAum ? parseFloat(newAum) : 0 },
    });
    setShowCreate(false); setNewName('');
    loadFunds(); loadFund(res.data.id);
  }
  async function updatePai(paiId: string, value: number) {
    if (!selected) return;
    await api(`/sfdr/funds/${selected.id}/pai/${paiId}`, { method: 'PUT', body: { value } });
    loadFund(selected.id);
  }

  if (!tenant) return <p className="text-slate-500">Select a tenant first.</p>;

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-500">Sustainable Finance Disclosure Regulation — report PAI indicators for financial products.</p>
          <button onClick={() => setShowHelp(!showHelp)} className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center hover:bg-blue-200">?</button>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium flex-shrink-0">
          {showCreate ? 'Cancel' : 'Add Fund'}
        </button>
      </div>

      {showHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5 text-sm">
          <div className="flex justify-between"><h3 className="font-semibold text-blue-800 mb-2">What is SFDR?</h3><button onClick={() => setShowHelp(false)} className="text-blue-400">&times;</button></div>
          <p className="text-blue-700 mb-2">The Sustainable Finance Disclosure Regulation requires financial market participants (asset managers, banks, insurance) to disclose sustainability information about their financial products.</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="font-semibold text-slate-600">Article 6</div>
              <div className="text-xs text-slate-500">No ESG characteristics. Must disclose sustainability risk integration.</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-emerald-200">
              <div className="font-semibold text-emerald-700">Article 8 "Light Green"</div>
              <div className="text-xs text-slate-500">Promotes environmental or social characteristics.</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="font-semibold text-blue-700">Article 9 "Dark Green"</div>
              <div className="text-xs text-slate-500">Has sustainable investment as its objective.</div>
            </div>
          </div>
          <p className="text-blue-600 text-xs mt-2">All funds must report 14 mandatory Principal Adverse Impact (PAI) indicators covering climate, environment, and social factors.</p>
        </div>
      )}

      {showCreate && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <h3 className="font-semibold text-slate-800 mb-3">Register Financial Product</h3>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Fund Name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Acme Sustainable Growth Fund" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">SFDR Classification</label>
              <select value={newArticle} onChange={(e) => setNewArticle(parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value={6}>Article 6 — No ESG</option><option value={8}>Article 8 — Light Green</option><option value={9}>Article 9 — Dark Green</option>
              </select></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">AUM (EUR)</label>
              <input type="number" value={newAum} onChange={(e) => setNewAum(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="500000000" /></div>
          </div>
          <button onClick={createFund} disabled={!newName} className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-medium disabled:opacity-40">Create Fund</button>
        </div>
      )}

      <div className="flex gap-5">
        {/* Fund list */}
        <div className="w-72 flex-shrink-0 space-y-2">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Financial Products</h3>
          {funds.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300"><p className="text-slate-400 text-sm">No funds registered.</p></div>
          ) : funds.map((f) => (
            <div key={f.id} onClick={() => loadFund(f.id)}
              className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${selected?.id === f.id ? 'border-blue-500 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="font-medium text-slate-800 text-sm">{f.metadata.fundName}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${ARTICLE_COLORS[f.metadata.article] || ''}`}>
                  {ARTICLE_LABELS[f.metadata.article]}
                </span>
              </div>
              {f.metadata.aum > 0 && <div className="text-xs text-slate-400 mt-1">AUM: EUR {(f.metadata.aum / 1000000).toFixed(0)}M</div>}
              <div className="text-[10px] text-slate-400 mt-1">
                {f.metadata.paiValues.filter((p: any) => p.value !== null).length}/14 PAI reported
              </div>
            </div>
          ))}
        </div>

        {/* PAI indicators */}
        {selected ? (
          <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">{selected.metadata.fundName}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ARTICLE_COLORS[selected.metadata.article] || ''}`}>
                  {ARTICLE_LABELS[selected.metadata.article]}
                </span>
              </div>
              <div className="text-sm text-slate-400">{selected.metadata.paiValues.filter((p) => p.value !== null).length}/14 PAI indicators reported</div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-left font-medium text-slate-500">ID</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Indicator</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Category</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500">Value</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Unit</th>
                </tr>
              </thead>
              <tbody>
                {selected.metadata.paiValues.map((pai) => (
                  <tr key={pai.id} className="border-b border-slate-50 hover:bg-slate-50" title={pai.description}>
                    <td className="px-3 py-2 font-mono text-xs text-slate-400">{pai.id}</td>
                    <td className="px-3 py-2 text-slate-700">{pai.name}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        pai.category === 'climate' ? 'bg-red-50 text-red-600' :
                        pai.category === 'environment' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>{pai.category}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input type="number" step="any"
                        defaultValue={pai.value ?? ''}
                        onBlur={(e) => e.target.value && updatePai(pai.id, parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border border-slate-200 rounded text-sm text-right tabular-nums hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="—"
                      />
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-400">{pai.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 min-h-[400px]">
            Select a fund or register a new one
          </div>
        )}
      </div>
    </div>
  );
}
