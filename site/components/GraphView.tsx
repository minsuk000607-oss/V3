'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Node = { id: string; slug: string; title: string; category: string; color: string; x?: number; y?: number; vx?: number; vy?: number; fx?: number | null; fy?: number | null };
type Edge = { source: string | Node; target: string | Node };
type GraphData = { nodes: Node[]; edges: Edge[] };

export function GraphView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  useEffect(() => {
    let stopped = false;
    import('d3').then(d3 => {
      if (stopped || !svgRef.current) return;
      fetch('/graph.json').then(r => r.json()).then((data: GraphData) => {
        if (stopped || !data.nodes.length) return;

        const svg = d3.select(svgRef.current!);
        const W   = svgRef.current!.clientWidth  || 600;
        const H   = svgRef.current!.clientHeight || 440;
        svg.selectAll('*').remove();

        // glow filter
        const defs = svg.append('defs');
        const filter = defs.append('filter').attr('id', 'node-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
        filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'blur');
        const merge = filter.append('feMerge');
        merge.append('feMergeNode').attr('in', 'blur');
        merge.append('feMergeNode').attr('in', 'SourceGraphic');

        const g = svg.append('g');

        svg.call(d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.3, 3])
          .on('zoom', e => g.attr('transform', e.transform)));

        const sim = d3.forceSimulation<Node>(data.nodes)
          .force('link',      d3.forceLink<Node, Edge>(data.edges).id(d => d.id).distance(150))
          .force('charge',    d3.forceManyBody().strength(-400))
          .force('center',    d3.forceCenter(W / 2, H / 2))
          .force('collision', d3.forceCollide<Node>(36));

        const link = g.append('g').selectAll('line')
          .data(data.edges).join('line')
          .attr('stroke', '#2d3748').attr('stroke-width', 1.2).attr('opacity', 0.6);

        const node = g.append('g').selectAll<SVGCircleElement, Node>('circle')
          .data(data.nodes).join('circle')
          .attr('r', 8)
          .attr('fill', d => d.color)
          .attr('cursor', 'pointer')
          .attr('filter', 'url(#node-glow)')
          .on('click', (_, d) => router.push(`/wiki/${d.slug}`))
          .call(d3.drag<SVGCircleElement, Node>()
            .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
            .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

        node.append('title').text(d => d.title);

        const label = g.append('g').selectAll('text')
          .data(data.nodes).join('text')
          .text(d => d.title.slice(0, 10))
          .attr('font-size', 10)
          .attr('fill', '#94a3b8')
          .attr('text-anchor', 'middle')
          .attr('pointer-events', 'none');

        sim.on('tick', () => {
          link.attr('x1', d => (d.source as Node).x!).attr('y1', d => (d.source as Node).y!)
              .attr('x2', d => (d.target as Node).x!).attr('y2', d => (d.target as Node).y!);
          node.attr('cx', d => d.x!).attr('cy', d => d.y!);
          label.attr('x', d => d.x!).attr('y', d => d.y! + 22);
        });
      });
    });
    return () => { stopped = true; };
  }, [router]);

  return (
    <svg ref={svgRef} width="100%" height="440"
      style={{ borderRadius: 12, display: 'block' }} />
  );
}
