import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

function resolveWikiRoot() {
  const candidates = [
    path.resolve(process.cwd(), 'wiki'),
    path.resolve(process.cwd(), '..', 'wiki')
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) ?? null;
}

const root = resolveWikiRoot();
const out = path.resolve(process.cwd(), 'wiki-index.json');
const EXCLUDED_TOP_LEVEL_DIRS = new Set(['50_PROMPTS', '90_LOGS']);

function shouldSkip(fullPath, rootDir) {
  const relative = path.relative(rootDir, fullPath);
  const segments = relative.split(path.sep);
  if (segments[0] && EXCLUDED_TOP_LEVEL_DIRS.has(segments[0])) return true;
  if (relative.startsWith(path.join('00_CORE', 'wiki'))) return true;
  if (!fullPath.endsWith('.md')) return true;
  return path.basename(fullPath) === '.gitkeep';
}

function hasValidFrontmatter(file) {
  const parsed = matter(fs.readFileSync(file, 'utf8'));
  return typeof parsed.data?.slug === 'string' && parsed.data.slug.trim().length > 0;
}

function walk(dir, rootDir = dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, rootDir);
    return shouldSkip(full, rootDir) ? [] : [full];
  });
}

if (!root) {
  console.warn('[build-index] Could not find wiki directory. Checked: ./wiki and ../wiki. Writing empty index.');
  fs.writeFileSync(out, JSON.stringify([], null, 2));
  process.exit(0);
}

const docs = walk(root)
  .filter((file) => {
    const relative = path.relative(root, file);
    if (relative.startsWith('00_CORE')) return hasValidFrontmatter(file);
    return true;
  })
  .map((file) => {
    const parsed = matter(fs.readFileSync(file, 'utf8'));
    const slug = parsed.data.slug ?? path.basename(file, '.md');
    const id = typeof parsed.data.id === 'string' && parsed.data.id.trim().length > 0 ? parsed.data.id.trim() : slug;
    const aliases = Array.isArray(parsed.data.aliases) ? parsed.data.aliases.filter((alias) => typeof alias === 'string') : [];
    const tags = Array.isArray(parsed.data.tags) ? parsed.data.tags.filter((tag) => typeof tag === 'string') : [];
    return {
      id,
      slug,
      title: parsed.data.title ?? slug,
      aliases,
      category: parsed.data.category ?? 'uncategorized',
      tags,
      content: parsed.content.slice(0, 5000)
    };
  });

fs.writeFileSync(out, JSON.stringify(docs, null, 2));
