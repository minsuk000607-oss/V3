import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

export type WikiPage = {
  id: string; slug: string; title: string; aliases: string[];
  category: string; tags: string[]; content: string; sourcePath: string;
  pinned: boolean; clinical_priority: number; research_priority: number;
  foundational_priority: number; review_status?: string;
};

function findRoot(name: string): string | null {
  const candidates = [
    path.resolve(process.cwd(), name),
    path.resolve(process.cwd(), '..', name),
  ];
  return candidates.find(c => fs.existsSync(c) && fs.statSync(c).isDirectory()) ?? null;
}

export const WIKI_ROOT      = findRoot('wiki');
export const GENERATED_ROOT = findRoot('generated');

const SKIP_DIRS = new Set(['50_PROMPTS', '90_LOGS']);
const WIKILINK  = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : walk(full);
    return full.endsWith('.md') ? [full] : [];
  });
}

function num(v: unknown, fallback = 3): number {
  return typeof v === 'number' && isFinite(v) ? v : fallback;
}

export function importanceScore(p: WikiPage): number {
  const s = p.clinical_priority * 0.35 + p.research_priority * 0.25 + p.foundational_priority * 0.25;
  return p.pinned ? s + 2 : s;
}

export const getAllWikiPages = cache((): WikiPage[] => {
  if (!WIKI_ROOT) return [];
  return walk(WIKI_ROOT).map(file => {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const slug = data.slug ?? path.basename(file, '.md');
    const id   = (typeof data.id === 'string' && data.id.trim()) ? data.id.trim() : slug;
    return {
      id, slug, title: data.title ?? slug,
      aliases:               Array.isArray(data.aliases) ? data.aliases : [],
      category:              data.category ?? 'uncategorized',
      tags:                  Array.isArray(data.tags) ? data.tags : [],
      content, sourcePath:   path.relative(WIKI_ROOT!, file),
      pinned:                Boolean(data.pinned),
      clinical_priority:     num(data.clinical_priority),
      research_priority:     num(data.research_priority),
      foundational_priority: num(data.foundational_priority),
      review_status:         typeof data.review_status === 'string' ? data.review_status : undefined,
    };
  });
});

export function getPageBySlug(slug: string): WikiPage | undefined {
  return getAllWikiPages().find(p => p.slug === slug);
}

const backlinkIndex = cache((): Map<string, WikiPage[]> => {
  const pages  = getAllWikiPages();
  const idMap  = new Map<string, string>();
  const result = new Map<string, WikiPage[]>();
  pages.forEach(p => {
    idMap.set(p.slug.toLowerCase(), p.id);
    idMap.set(p.title.toLowerCase(), p.id);
    p.aliases.forEach(a => idMap.set(a.toLowerCase(), p.id));
  });
  pages.forEach(src => {
    for (const m of src.content.matchAll(new RegExp(WIKILINK.source, 'g'))) {
      const tgtId = idMap.get(m[1].trim().toLowerCase());
      if (!tgtId || tgtId === src.id) continue;
      if (!result.has(tgtId)) result.set(tgtId, []);
      result.get(tgtId)!.push(src);
    }
  });
  return result;
});

export function getBacklinks(id: string): WikiPage[] {
  return backlinkIndex().get(id) ?? [];
}

export function getCategories(): string[] {
  return [...new Set(getAllWikiPages().map(p => p.category))].sort();
}

export function sortedPages(pages: WikiPage[]): WikiPage[] {
  return [...pages].sort((a, b) => importanceScore(b) - importanceScore(a));
}

export function convertWikiLinks(content: string): string {
  const idMap = new Map<string, WikiPage>();
  getAllWikiPages().forEach(p => {
    idMap.set(p.slug.toLowerCase(), p);
    idMap.set(p.title.toLowerCase(), p);
    p.aliases.forEach(a => idMap.set(a.toLowerCase(), p));
  });
  return content.replace(new RegExp(WIKILINK.source, 'g'), (_, target: string, label?: string) => {
    const page    = idMap.get(target.trim().toLowerCase());
    const display = (label ?? target).trim();
    return page ? `[${display}](/wiki/${page.slug})` : display;
  });
}

export function getGeneratedBlocks(type: 'insights' | 'papers' | 'relations', id: string): object[] {
  if (!GENERATED_ROOT || !id) return [];
  const ext  = { insights: '.insight.json', papers: '.papers.json', relations: '.relations.json' }[type];
  const file = path.join(GENERATED_ROOT, type, `${id}${ext}`);
  if (!fs.existsSync(file)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
