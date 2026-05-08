'use client';
import { useState } from 'react';
import Link from 'next/link';

type SectionResult = {
  doc_id: string; slug: string; title: string; category: string;
  tags: string[]; section: string; level: number; body: string; score: number;
};

export default function SearchPage() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<SectionResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(q: string) {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  return (
    <div>
      <h1>🔍 Search</h1>
      <input
        className="search-input"
        placeholder="개념, 증상, 처방, 경맥 검색..."
        value={query}
        onChange={e => handleSearch(e.target.value)}
        autoFocus
      />

      {loading && <p style={{ color: 'var(--text-muted)' }}>검색 중...</p>}

      {!loading && results.length === 0 && query && (
        <p style={{ color: 'var(--text-muted)' }}>결과 없음</p>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {results.map((r, i) => (
          <Link key={i} href={`/wiki/${r.slug}#${r.section.toLowerCase().replace(/\s+/g, '-')}`}
            style={{ display: 'block', padding: 14, background: 'var(--bg-secondary)',
              border: '1px solid var(--border)', borderRadius: 6, textDecoration: 'none' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              {r.category} › {r.title}
              {r.section !== r.title && <span style={{ color: 'var(--accent)' }}> › {r.section}</span>}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)',
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {r.body || r.section}
            </p>
            <div style={{ marginTop: 6 }}>
              {r.tags.slice(0, 3).map(t => (
                <span key={t} className="tag">#{t}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
