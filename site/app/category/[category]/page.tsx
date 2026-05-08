import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllWikiPages } from '@/lib/wiki';

export async function generateStaticParams() {
  const pages = getAllWikiPages();
  const categories = Array.from(new Set(pages.map((p) => p.category).filter(Boolean)));
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const category = params.category;
  return {
    title: `Category: ${category}`,
    description: `${category} 카테고리의 위키 문서 목록 페이지`
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = params.category;
  const pages = getAllWikiPages().filter((page) => page.category === category);
  if (pages.length === 0) notFound();

  return (
    <div>
      <h1>Category: {category}</h1>
      <ul>
        {pages.map((page) => (
          <li key={page.slug}><Link href={`/wiki/${page.slug}`}>{page.title}</Link></li>
        ))}
      </ul>
    </div>
  );
}
