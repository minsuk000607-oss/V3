import Link from 'next/link';
import { getAllWikiPages, importanceScore, sortedPages } from '@/lib/wiki';
import { GraphView } from '@/components/GraphView';
import { TagBadge } from '@/components/TagBadge';

export default function HomePage() {
  const pages      = getAllWikiPages();
  const top        = sortedPages(pages).slice(0, 8);
  const byCategory = Object.entries(
    pages.reduce<Record<string, typeof pages>>((acc, p) => {
      (acc[p.category] ??= []).push(p); return acc;
    }, {})
  ).sort((a, b) => importanceScore(sortedPages(b[1])[0]) - importanceScore(sortedPages(a[1])[0]));

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section>
        <h2 style={{ marginBottom: 8 }}>Knowledge Graph</h2>
        <GraphView />
      </section>

      <section>
        <h2>Top Documents</h2>
        {pages.length === 0
          ? <p style={{ color: '#64748b' }}>wiki/ 에 마크다운 파일을 추가하거나 <code>python scripts/ingest.py</code> 를 실행하세요.</p>
          : <ul style={{ paddingLeft: 20 }}>
              {top.map(p => (
                <li key={p.id} style={{ marginBottom: 8 }}>
                  <Link href={`/wiki/${p.slug}`}>{p.title}</Link>{' '}
                  <small style={{ color: '#64748b' }}>{p.category} · {importanceScore(p).toFixed(1)}</small>
                  <div>{p.tags.slice(0, 3).map(t => <TagBadge key={t} tag={t} />)}</div>
                </li>
              ))}
            </ul>
        }
      </section>

      <section>
        <h2>Categories</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {byCategory.map(([cat, ps]) => (
            <Link key={cat} href={`/category/${encodeURIComponent(cat)}`}
              style={{ padding: '6px 14px', background: '#1e293b', borderRadius: 6, fontSize: 14 }}>
              {cat} <span style={{ color: '#64748b' }}>({ps.length})</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
