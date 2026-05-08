'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Node = { id: string; slug: string; title: string; category: string; color: string; x?: number; y?: number; vx?: number; vy?: number; fx?: number | null; fy?: number | null };
type Edge = { source: string | Node; target: string | Node };
type GraphData = { nodes: Node[]; edges: Edge[] };

export function GraphView() {
  const svgRef  = useRef<SVGSVGElement>(null);
  const router  = useRouter();

  useEffect(() => {
    let stopped = false;
    import('d3').then(d3 => {
      if (stopped || !svgRef.current) return;
      fetch('/graph.json').then(r => r.json()).then((data: GraphData) => {
        if (stopped || !data.nodes.length) return;

        const svg  = d3.select(svgRef.current!);
        const W    = svgRef.current!.clientWidth  || 600;
        const H    = svgRef.current!.clientHeight || 400;
        svg.selectAll('*').remove();

        const g = svg.append('g');

        // zoom
        svg.call(d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.3, 3])
          .on('zoom', e => g.attr('transform', e.transform)));

        const sim = d3.forceSimulation<Node>(data.nodes)
          .force('link',   d3.forceLink<Node, Edge>(data.edges).id(d => d.id).distance(80))
          .force('charge', d3.forceManyBody().strength(-150))
          .force('center', d3.forceCenter(W / 2, H / 2));

        const link = g.append('g').selectAll('line')
          .data(data.edges).join('line')
          .attr('stroke', '#334155').attr('stroke-width', 1.2).attr('opacity', 0.7);

        const node = g.append('g').selectAll<SVGCircleElement, Node>('circle')
          .data(data.nodes).join('circle')
          .attr('r', 7).attr('fill', d => d.color).attr('cursor', 'pointer')
          .on('click', (_, d) => router.push(`/wiki/${d.slug}`))
          .call(d3.drag<SVGCircleElement, Node>()
            .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
            .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

        node.append('title').text(d => d.title);

        const label = g.append('g').selectAll('text')
          .data(data.nodes).join('text')
          .text(d => d.title.slice(0, 12))
          .attr('font-size', 10).attr('fill', '#cbd5e1').attr('pointer-events', 'none');

        sim.on('tick', () => {
          link.attr('x1', d => (d.source as Node).x!).attr('y1', d => (d.source as Node).y!)
              .attr('x2', d => (d.target as Node).x!).attr('y2', d => (d.target as Node).y!);
          node.attr('cx', d => d.x!).attr('cy', d => d.y!);
          label.attr('x', d => d.x! + 9).attr('y', d => d.y! + 4);
        });
      });
    });
    return () => { stopped = true; };
  }, [router]);

  return (
    <svg ref={svgRef} width="100%" height="420"
      style={{ background: '#0f172a', borderRadius: 8, display: 'block' }} />
  );
}
