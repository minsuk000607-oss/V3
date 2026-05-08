import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SYSTEM = `You are a Korean medicine knowledge compiler (김민석 LLM Wiki OS).
Convert raw source into a structured wiki markdown page.
Output ONLY the markdown. No explanation, no code fences.

Required frontmatter:
---
id: SRC-{unique_5_digit}
slug: {kebab-case-slug}
title: {Korean title}
category: {category}
tags:
  - {relevant tags}
created: {today YYYY-MM-DD}
updated: {today YYYY-MM-DD}
clinical_priority: 1-5
research_priority: 1-5
foundational_priority: 1-5
review_status: draft
---

Rules:
- Korean for prose, English for technical terms
- Use Obsidian [[wikilinks]] for concepts
- Sections: ## 핵심 내용 / ## 임상 적용 / ## 현대 생리학적 해석 / ## Related
- Separate source facts from interpretation`;

function findWikiDir(category: string): string | null {
  const candidates = [
    path.resolve(process.cwd(), '..', 'wiki', category),
    path.resolve(process.cwd(), 'wiki', category),
  ];
  for (const c of candidates) {
    try { fs.mkdirSync(c, { recursive: true }); return c; } catch { continue; }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { text, filename, category = 'sources' } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: '텍스트가 없습니다.' }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY 없음' }, { status: 500 });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Category: ${category}\nHint: ${filename || 'auto'}\nToday: ${new Date().toISOString().slice(0, 10)}\n\n${text.slice(0, 8000)}` }],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: `Claude API 오류: ${await res.text()}` }, { status: 500 });

  const data = await res.json();
  const markdown: string = data.content?.[0]?.text ?? '';

  // 저장 시도 (런타임 - 재배포 시 초기화됨. 복사해서 git에 커밋 권장)
  let savedPath = '';
  const dir = findWikiDir(category);
  if (dir) {
    const slug = markdown.match(/^slug:\s*(.+)$/m)?.[1]?.trim() || filename || `ingest-${Date.now()}`;
    try {
      const outPath = path.join(dir, `${slug}.md`);
      fs.writeFileSync(outPath, markdown, 'utf8');
      savedPath = outPath;
    } catch { /* 저장 실패 시 마크다운만 반환 */ }
  }

  return NextResponse.json({ markdown, savedPath });
}
