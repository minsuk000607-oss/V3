'use client';
import { useState } from 'react';

const CATEGORIES = ['sources', 'concepts', 'entities'] as const;

export default function AdminPage() {
  const [text, setText]         = useState('');
  const [filename, setFilename] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('sources');
  const [result, setResult]     = useState('');
  const [savedPath, setSavedPath] = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleIngest() {
    if (!text.trim()) return;
    setStatus('loading'); setResult(''); setSavedPath('');

    const res = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, filename, category }),
    });
    const data = await res.json();

    if (res.ok) {
      setResult(data.markdown);
      setSavedPath(data.savedPath || '');
      setStatus('done');
    } else {
      setResult(data.error ?? 'Unknown error');
      setStatus('error');
    }
  }

  return (
    <div>
      <h1>⚡ Wiki Ingest</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
        텍스트를 붙여넣으면 Claude가 wiki 마크다운으로 변환 후 자동 저장합니다.
      </p>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
              background: category === c ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
              border: `1px solid ${category === c ? 'var(--accent)' : 'var(--border)'}`,
              color: category === c ? 'var(--text)' : 'var(--text-muted)',
            }}>{c}</button>
          ))}
        </div>

        <input className="search-input" style={{ marginBottom: 0 }}
          placeholder="파일명 힌트 (선택) — 예: oryeongsan, gunn-ims"
          value={filename} onChange={e => setFilename(e.target.value)} />

        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="강의 노트, 논문 요약, 대화 내용 등 붙여넣기..." rows={14}
          style={{
            width: '100%', padding: 12, borderRadius: 6, resize: 'vertical',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
          }} />

        <button onClick={handleIngest} disabled={status === 'loading' || !text.trim()} style={{
          padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 14,
          background: 'var(--accent-dim)', border: 'none', color: 'var(--text)',
          opacity: (status === 'loading' || !text.trim()) ? 0.5 : 1,
        }}>
          {status === 'loading' ? '⏳ 변환 중...' : '⚡ Ingest'}
        </button>
      </div>

      {status === 'done' && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <h3 style={{ margin: 0, display: 'inline' }}>생성된 마크다운</h3>
              {savedPath
                ? <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--green)' }}>✓ 저장됨: {savedPath}</span>
                : <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>복사 후 git에 추가하세요</span>
              }
            </div>
            <button onClick={() => navigator.clipboard.writeText(result)} style={{
              padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12,
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-muted)',
            }}>복사</button>
          </div>
          <pre style={{
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 6, padding: 16, overflow: 'auto', fontSize: 12,
            color: 'var(--green)', maxHeight: 480, whiteSpace: 'pre-wrap',
          }}>{result}</pre>
        </div>
      )}

      {status === 'error' && (
        <div style={{ marginTop: 16, padding: 12, background: '#2d1b1b', borderRadius: 6, color: '#f87171' }}>
          {result}
        </div>
      )}
    </div>
  );
}
