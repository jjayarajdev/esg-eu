import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';

interface Topic {
  id: string;
  standard_code: string;
  standard_name: string;
  standard_category: string;
  impact_score: number | null;
  financial_score: number | null;
  is_material: boolean | null;
  justification: any;
}

interface Assessment {
  id: string;
  name: string;
  status: string;
  topics: Topic[];
}

const CATEGORY_COLORS: Record<string, string> = {
  environmental: '#10b981',
  social: '#3b82f6',
  governance: '#f59e0b',
};

export function DmaWizardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [severity, setSeverity] = useState(3);
  const [likelihood, setLikelihood] = useState(3);
  const [magnitude, setMagnitude] = useState(3);
  const [probability, setProbability] = useState(3);
  const [impactRationale, setImpactRationale] = useState('');
  const [financialRationale, setFinancialRationale] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadAssessment();
  }, [id]);

  useEffect(() => {
    if (assessment) loadTopicScores(currentIndex);
  }, [currentIndex, assessment]);

  async function loadAssessment() {
    const res = await api<{ data: Assessment }>(`/dma/${id}`);
    setAssessment(res.data);
    // Jump to first unscored topic
    const firstUnscored = res.data.topics.findIndex((t) => t.impact_score === null);
    if (firstUnscored >= 0) setCurrentIndex(firstUnscored);
  }

  function loadTopicScores(idx: number) {
    if (!assessment) return;
    const topic = assessment.topics[idx];
    if (topic.justification) {
      const j = typeof topic.justification === 'string' ? JSON.parse(topic.justification) : topic.justification;
      setSeverity(j.impact?.severity || 3);
      setLikelihood(j.impact?.likelihood || 3);
      setMagnitude(j.financial?.magnitude || 3);
      setProbability(j.financial?.probability || 3);
      setImpactRationale(j.impact?.rationale || '');
      setFinancialRationale(j.financial?.rationale || '');
    } else {
      setSeverity(3); setLikelihood(3); setMagnitude(3); setProbability(3);
      setImpactRationale(''); setFinancialRationale('');
    }
  }

  async function saveScore() {
    if (!assessment) return;
    const topic = assessment.topics[currentIndex];
    setSaving(true);
    try {
      await api(`/dma/${id}/topics/${topic.standard_code}`, {
        method: 'PUT',
        body: { severity, likelihood, magnitude, probability, impactRationale, financialRationale },
      });
      await loadAssessment();
      // Auto-advance to next unscored
      if (currentIndex < assessment.topics.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function finalize() {
    try {
      await api(`/dma/${id}/finalize`, { method: 'POST' });
      navigate(`/dma/${id}/matrix`);
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (!assessment) return <p>Loading...</p>;

  const topic = assessment.topics[currentIndex];
  const scored = assessment.topics.filter((t) => t.impact_score !== null).length;
  const allScored = scored === assessment.topics.length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/dma')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&larr;</button>
        <h2 style={{ margin: 0 }}>{assessment.name}</h2>
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{scored}/{assessment.topics.length} topics scored</span>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#f3f4f6', borderRadius: '4px', height: '8px', marginBottom: '1.5rem' }}>
        <div style={{ background: '#3b82f6', borderRadius: '4px', height: '100%', width: `${(scored / assessment.topics.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      {/* Topic navigation */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {assessment.topics.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setCurrentIndex(i)}
            style={{
              padding: '4px 10px',
              border: i === currentIndex ? '2px solid #3b82f6' : '1px solid #d1d5db',
              borderRadius: '6px',
              background: t.impact_score !== null ? CATEGORY_COLORS[t.standard_category] + '20' : 'white',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: i === currentIndex ? 700 : 400,
              color: i === currentIndex ? '#3b82f6' : '#374151',
            }}
          >
            {t.standard_code}
          </button>
        ))}
      </div>

      {/* Scoring form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Impact Materiality */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', borderTop: '3px solid #ef4444' }}>
          <h3 style={{ margin: '0 0 0.5rem' }}>
            Impact Materiality
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#6b7280' }}> (Inside-Out)</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 1rem' }}>
            How does <strong>{topic.standard_name}</strong> impact people, environment, and society?
          </p>
          <SliderField label="Severity" value={severity} onChange={setSeverity} />
          <SliderField label="Likelihood" value={likelihood} onChange={setLikelihood} />
          <div style={{ fontWeight: 700, fontSize: '1.2rem', marginTop: '0.5rem' }}>
            Score: {severity * likelihood}/25
          </div>
          <textarea
            value={impactRationale}
            onChange={(e) => setImpactRationale(e.target.value)}
            placeholder="Rationale for impact scoring..."
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.8rem', minHeight: '60px' }}
          />
        </div>

        {/* Financial Materiality */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', borderTop: '3px solid #3b82f6' }}>
          <h3 style={{ margin: '0 0 0.5rem' }}>
            Financial Materiality
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#6b7280' }}> (Outside-In)</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 1rem' }}>
            How does <strong>{topic.standard_name}</strong> affect your financial performance?
          </p>
          <SliderField label="Magnitude" value={magnitude} onChange={setMagnitude} />
          <SliderField label="Probability" value={probability} onChange={setProbability} />
          <div style={{ fontWeight: 700, fontSize: '1.2rem', marginTop: '0.5rem' }}>
            Score: {magnitude * probability}/25
          </div>
          <textarea
            value={financialRationale}
            onChange={(e) => setFinancialRationale(e.target.value)}
            placeholder="Rationale for financial scoring..."
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.8rem', minHeight: '60px' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          style={{ ...navBtn, opacity: currentIndex === 0 ? 0.3 : 1 }}
        >
          Previous
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={saveScore} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.5 : 1 }}>
            {saving ? 'Saving...' : 'Save Score'}
          </button>
          {allScored && (
            <button onClick={finalize} style={{ ...primaryBtn, background: '#10b981' }}>
              Finalize Assessment
            </button>
          )}
        </div>
        <button
          onClick={() => setCurrentIndex(Math.min(assessment.topics.length - 1, currentIndex + 1))}
          disabled={currentIndex === assessment.topics.length - 1}
          style={{ ...navBtn, opacity: currentIndex === assessment.topics.length - 1 ? 0.3 : 1 }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function SliderField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <span>{label}</span>
        <strong>{value}/5</strong>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ width: '100%' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9ca3af' }}>
        <span>Low</span><span>Medium</span><span>High</span><span>Very High</span><span>Critical</span>
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = { padding: '0.5rem 1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 };
const navBtn: React.CSSProperties = { padding: '0.5rem 1rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' };
