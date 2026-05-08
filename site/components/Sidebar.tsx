import Link from 'next/link';
import { getAllWikiPages } from '@/lib/wiki';
import { buildFileTree } from '@/lib/filetree';
import { FileTree } from './FileTree';

export function Sidebar() {
  const pages = getAllWikiPages();
  const tree  = buildFileTree(pages);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          ⬡ KM Wiki
        </Link>
      </div>

      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="tree-item" style={{ paddingLeft: 8 }}>
          <span>🏠</span> Home
        </Link>
        <Link href="/search" className="tree-item" style={{ paddingLeft: 8 }}>
          <span>🔍</span> Search
        </Link>
        <Link href="/admin" className="tree-item" style={{ paddingLeft: 8 }}>
          <span>⚡</span> Ingest
        </Link>
      </div>

      <div className="sidebar-scroll">
        <div style={{ padding: '8px 12px 4px', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-faint)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
          Wiki
        </div>
        <FileTree tree={tree} />
      </div>

      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
        {pages.length} pages
      </div>
    </aside>
  );
}
