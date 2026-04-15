import { useState, useRef, useEffect } from 'react';

interface Props {
  value: number | null;
  onSave: (newValue: number) => Promise<void>;
  disabled?: boolean;
}

export function InlineEdit({ value, onSave, disabled }: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function startEdit() {
    if (disabled) return;
    setEditValue(value !== null ? String(value) : '');
    setEditing(true);
  }

  async function handleSave() {
    if (!editValue && editValue !== '0') { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(parseFloat(editValue));
      setEditing(false);
    } catch {
      // keep editing on error
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        step="any"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={saving}
        className="w-24 px-2 py-0.5 text-right border border-blue-400 rounded text-sm bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500 tabular-nums"
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      className={`tabular-nums font-medium cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-1 py-0.5 rounded transition-colors ${
        disabled ? 'cursor-default' : ''
      }`}
      title={disabled ? '' : 'Click to edit'}
    >
      {value !== null ? Number(value).toLocaleString() : '\u2014'}
    </span>
  );
}
