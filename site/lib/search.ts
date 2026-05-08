import fs from 'fs';
import path from 'path';

export type SectionResult = {
  doc_id:   string;
  slug:     string;
  title:    string;
  category: string;
  tags:     string[];
  section:  string;
  level:    number;
  body:     string;
  score:    number;
};

function loadIndex(): SectionResult[] {
  const candidates = [
    path.resolve(process.cwd(), '..', 'generated', 'index', 'docs.index.json'),
    path.resolve(process.cwd(), 'generated', 'index', 'docs.index.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(c, 'utf8'));
        return Array.isArray(parsed) ? parsed : [];
      } catch { continue; }
    }
  }
  return [];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 쿼리 → 관련 섹션 반환 (LLM 없는 키워드 매칭)
export function searchSections(query: string, limit = 10): SectionResult[] {
  if (!query.trim()) return [];

  const index   = loadIndex();
  const terms   = query.toLowerCase().split(/\s+/).filter(Boolean);

  return index
    .map(sec => {
      const haystack = [sec.title, sec.section, sec.body, ...sec.tags]
        .join(' ').toLowerCase();
      const score = terms.reduce((sum, t) => {
        const safe  = escapeRegExp(t);
        const count = (haystack.match(new RegExp(safe, 'g')) || []).length;
        // 제목/섹션명 매칭은 가중치 3배
        const titleBonus = (sec.title.toLowerCase().includes(t) || sec.section.toLowerCase().includes(t)) ? 2 : 0;
        return sum + count + titleBonus;
      }, 0);
      return { ...sec, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
