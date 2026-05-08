import { WikiPage } from './wiki';

export type TreeNode = {
  name: string;
  slug?: string;
  title?: string;
  children?: TreeNode[];
  isFolder: boolean;
};

export function buildFileTree(pages: WikiPage[]): TreeNode[] {
  const root: Record<string, TreeNode> = {};

  for (const page of pages) {
    const parts = page.sourcePath.replace(/^wiki\//, '').split('/');
    
    if (parts.length === 1) {
      // 루트 파일
      const folder = 'root';
      if (!root[folder]) root[folder] = { name: 'wiki', isFolder: true, children: [] };
      root[folder].children!.push({ name: page.title, slug: page.slug, isFolder: false });
    } else {
      const folder = parts[0];
      if (!root[folder]) root[folder] = { name: folder, isFolder: true, children: [] };
      root[folder].children!.push({ name: page.title, slug: page.slug, isFolder: false });
    }
  }

  return Object.values(root)
    .filter(n => n.name !== 'root' && !['50_PROMPTS', '90_LOGS'].includes(n.name))
    .sort((a, b) => a.name.localeCompare(b.name));
}
