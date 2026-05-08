import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { TagBadge } from '@/components/TagBadge';
import { GeneratedBlock } from '@/components/GeneratedBlock';
import { convertWikiLinks, getAllWikiPages, getBacklinks, getGeneratedBlocks, getPageBySlug } from '@/lib/wiki';

export async function generateStaticParams() {
  return getAllWikiPages().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = getPageBySlug(params.slug);
  return page ? { title: page.title, description: page.category } : { title: 'Wiki' };
}

export default function WikiPage({ params }: { params: { slug: string } }) {
  const page = getPageBySlug(params.slug);
  if (!page) notFound();

  const backlinks = getBacklinks(page.id);
  const insights  = getGeneratedBlocks('insights',  page.id);
  const papers    = getGeneratedBlocks('papers',    page.id);
  const relations = getGeneratedBlocks('relations', page.id);

  return (
    <article>
      <h1>{page.title}</h1>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, fontSize: 13, color: '#94a3b8' }}>
        <Link href={`/category/${encodeURIComponent(page.category)}`}>{page.category}</Link>
        {page.review_status && <span>· {page.review_status}</span>}
        {page.tags.map(t => <TagBadge key={t} tag={t} />)}
      </div>

      <ReactMarkdown remarkPlugins={[remarkGfm]}>{convertWikiLinks(page.content)}</ReactMarkdown>

      <GeneratedBlock type="insights"  data={insights} />
      <GeneratedBlock type="papers"    data={papers} />
      <GeneratedBlock type="relations" data={relations} />

      {backlinks.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 13, color: '#64748b' }}>Backlinks ({backlinks.length})</h3>
          <ul style={{ paddingLeft: 20 }}>
            {backlinks.map(b => <li key={b.id}><Link href={`/wiki/${b.slug}`}>{b.title}</Link></li>)}
          </ul>
        </section>
      )}
    </article>
  );
}
