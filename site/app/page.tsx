import Link from 'next/link';
import { getAllWikiPages, importanceScore, sortedPages } from '@/lib/wiki';
import { GraphView } from '@/components/GraphView';
import { TagBadge } from '@/components/TagBadge';

function excerpt(content: string, len = 90): string {
  const text = content
    .replace(/#+\s+.+/gm, '')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, l) => l ?? t)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > len ? text.slice(0, len) + '…' : text;
}

export default function HomePage() {
  const pages      = getAllWikiPages();
  const top        = sortedPages(pages).slice(0, 8);
  const byCategory = Object.entries(
    pages.reduce<Record<string, typeof pages>>((acc, p) => {
      (acc[p.category] ??= []).push(p); return acc;
    }, {})
  ).sort((a, b) => importanceScore(sortedPages(b[1])[0]) - importanceScore(sortedPages(a[1])[0]));

  return (
    <div className="home-grid">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-tag">Knowledge OS</div>
        <h1 className="hero-title">Kim Minseok LLM Wiki</h1>
        <p className="hero-subtitle">Korean Medicine · Neuroscience · Fascia · Clinical Reasoning</p>
        <div className="hero-stats">
          <span className="hero-stat"><b>{pages.length}</b> documents</span>
          <span className="hero-stat-sep">·</span>
          <span className="hero-stat"><b>{byCategory.length}</b> categories</span>
        </div>
      </section>

      {/* ── Knowledge Graph ── */}
      <section>
        <div className="section-header">
          <h2 style={{ margin: 0 }}>Knowledge Graph</h2>
          <span className="stat-pill">{pages.length} nodes</span>
        </div>
        <div className="graph-card">
          <GraphView />
        </div>
      </section>

      {/* ── Top Documents ── */}
      <section>
        <div className="section-header">
          <h2 style={{ margin: 0 }}>Top Documents</h2>
          <span className="stat-pill">by importance</span>
        </div>
        {pages.length === 0
          ? <p style={{ color: 'var(--text-muted)' }}>wiki/ 에 마크다운 파일을 추가하거나 <code>python scripts/ingest.py</code> 를 실행하세요.</p>
          : <div className="doc-grid">
              {top.map(p => (
                <Link key={p.id} href={`/wiki/${p.slug}`} className="doc-card">
                  <div className="doc-card-top">
                    <span className={`cat-badge cat-${p.category.replace(/\s+/g, '-').toLowerCase()}`}>{p.category}</span>
                    <span className="doc-score">{importanceScore(p).toFixed(1)}</span>
                  </div>
                  <div className="doc-title">{p.title}</div>
                  <div className="doc-excerpt">{excerpt(p.content)}</div>
                  <div className="doc-tags">{p.tags.slice(0, 3).map(t => <TagBadge key={t} tag={t} />)}</div>
                </Link>
              ))}
            </div>
        }
      </section>

      {/* ── Categories ── */}
      <section>
        <h2>Categories</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {byCategory.map(([cat, ps]) => (
            <Link key={cat} href={`/category/${encodeURIComponent(cat)}`} className="cat-pill">
              <span className={`cat-dot cat-dot-${cat.replace(/\s+/g, '-').toLowerCase()}`} />
              {cat}
              <span className="cat-count">{ps.length}</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
