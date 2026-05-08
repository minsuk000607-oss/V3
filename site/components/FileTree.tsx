'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { TreeNode } from '@/lib/filetree';

const FOLDER_ICONS: Record<string, string> = {
  concepts: '🧠', entities: '🔬', sources: '📄',
  '00_CORE': '⚙️', wiki: '📚',
};

function FolderItem({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(depth === 0);
  const icon = FOLDER_ICONS[node.name] ?? '📁';
  const indent = depth * 14 + 8;

  return (
    <div>
      <div
        className="tree-item tree-folder"
        style={{ paddingLeft: indent }}
        onClick={() => setOpen(o => !o)}
      >
        <span className={`tree-toggle ${open ? 'open' : ''}`}>▶</span>
        <span className="icon">{icon}</span>
        <span>{node.name}</span>
      </div>
      <div className={`tree-children ${open ? 'open' : ''}`}>
        {node.children?.map((child, i) =>
          child.isFolder
            ? <FolderItem key={i} node={child} depth={depth + 1} />
            : <FileItem key={i} node={child} depth={depth + 1} />
        )}
      </div>
    </div>
  );
}

function FileItem({ node, depth }: { node: TreeNode; depth: number }) {
  const pathname = usePathname();
  const href = `/wiki/${node.slug}`;
  const active = pathname === href;
  const indent = depth * 14 + 8;

  return (
    <Link href={href} className={`tree-item tree-file ${active ? 'active' : ''}`}
      style={{ paddingLeft: indent }}>
      <span className="icon" style={{ marginLeft: 16 }}>○</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.name}</span>
    </Link>
  );
}

export function FileTree({ tree }: { tree: TreeNode[] }) {
  return (
    <div>
      {tree.map((node, i) =>
        node.isFolder
          ? <FolderItem key={i} node={node} depth={0} />
          : <FileItem key={i} node={node} depth={0} />
      )}
    </div>
  );
}
