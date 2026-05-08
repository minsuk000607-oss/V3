type InsightItem = { claim: string; confidence?: string; evidence?: string };
type PaperItem   = { title: string; doi?: string; pmid?: string; relevance?: string };
type RelationItem = { target: string; type: string; confidence?: string };

export function GeneratedBlock({ type, data }: {
  type: 'insights' | 'papers' | 'relations';
  data: object[];
}) {
  if (!data.length) return null;

  const titles = { insights: '🔍 Generated Insights', papers: '📄 Related Papers', relations: '🔗 Relations' };

  return (
    <section style={{ marginTop: 24, padding: 16, background: '#1e293b', borderRadius: 8 }}>
      <h3 style={{ marginTop: 0, color: '#94a3b8', fontSize: 14 }}>{titles[type]}</h3>
      {type === 'insights' && (data as InsightItem[]).map((item, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <p style={{ margin: 0 }}>{item.claim}</p>
          {item.confidence && <small style={{ color: '#64748b' }}>confidence: {item.confidence}</small>}
        </div>
      ))}
      {type === 'papers' && (data as PaperItem[]).map((item, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <a href={item.doi ? `https://doi.org/${item.doi}` : item.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${item.pmid}` : '#'}
            target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>
            {item.title}
          </a>
          {item.relevance && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>{item.relevance}</p>}
        </div>
      ))}
      {type === 'relations' && (data as RelationItem[]).map((item, i) => (
        <div key={i} style={{ marginBottom: 6, fontSize: 13 }}>
          <a href={`/wiki/${item.target}`} style={{ color: '#a78bfa' }}>{item.target}</a>
          {' '}
          <span style={{ color: '#64748b' }}>— {item.type}{item.confidence ? ` (${item.confidence})` : ''}</span>
        </div>
      ))}
    </section>
  );
}
