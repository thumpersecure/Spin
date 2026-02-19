/**
 * InvestigationGraph Component
 *
 * Force-directed entity relationship graph visualization.
 * "Jessica Jones" evidence board - entities as nodes, relationships as strings
 * connecting them. Uses a custom force simulation (no external D3 dependency).
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  ActionIcon,
  Tooltip,
  Card,
  Box,
} from '@mantine/core';
import {
  IconZoomIn,
  IconZoomOut,
  IconFocus2,
  IconGraph,
} from '@tabler/icons-react';

import { useAppSelector } from '../../store';
import { D3Node, D3Link } from '../../store/slices/investigationSlice';

interface InvestigationGraphProps {
  investigationId: string;
}

// Node type color mapping
const NODE_COLORS: Record<string, string> = {
  entity: '#a568f2',     // madroxPurple
  page: '#388dff',       // osintBlue
  person: '#1cdf66',     // hivemindGreen
  organization: '#ff8c00',
  location: '#ff6464',
  event: '#00b4d8',
  document: '#909296',
  identity: '#e040fb',
  email: '#42a5f5',
  phone: '#66bb6a',
  domain: '#ffa726',
  ip_address: '#ab47bc',
  username: '#ec407a',
  crypto_wallet: '#ffd54f',
  url: '#26c6da',
};

const DEFAULT_NODE_COLOR = '#909296';

// Simulation constants
const REPULSION_STRENGTH = 800;
const ATTRACTION_STRENGTH = 0.005;
const CENTER_GRAVITY = 0.01;
const DAMPING = 0.92;
const MIN_VELOCITY = 0.01;
const MAX_ITERATIONS_PER_FRAME = 1;

interface SimNode extends D3Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pinned: boolean;
}

interface ViewState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

function InvestigationGraph({ investigationId }: InvestigationGraphProps) {
  const { graphData } = useAppSelector((state) => state.investigation);

  const rawNodes = graphData?.nodes ?? [];
  const rawLinks: Array<{ source: string; target: string; relationship: string; label: string; weight: number; discovered_by: string; context?: string }> =
    (graphData?.links ?? []).map((link) => ({
      source: typeof link.source === 'string' ? link.source : link.source.id,
      target: typeof link.target === 'string' ? link.target : link.target.id,
      relationship: link.relationship,
      label: link.label,
      weight: link.weight,
      discovered_by: link.discovered_by,
      context: link.context,
    }));

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const dragNodeRef = useRef<string | null>(null);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [viewState, setViewState] = useState<ViewState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });

  const simNodesRef = useRef<SimNode[]>([]);

  // Compute connection counts from links
  const connectionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const link of rawLinks) {
      counts.set(link.source, (counts.get(link.source) ?? 0) + 1);
      counts.set(link.target, (counts.get(link.target) ?? 0) + 1);
    }
    return counts;
  }, [rawLinks]);

  // Initialize simulation nodes from raw graph data
  useEffect(() => {
    if (rawNodes.length === 0) {
      simNodesRef.current = [];
      setSimNodes([]);
      return;
    }

    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    const nodes: SimNode[] = rawNodes.map((node, i) => {
      // Spread nodes in a circle initially
      const angle = (2 * Math.PI * i) / rawNodes.length;
      const spread = Math.min(dimensions.width, dimensions.height) * 0.3;
      const connCount = connectionCounts.get(node.id) ?? 0;
      const nodeRadius = Math.max(8, Math.min(24, 6 + connCount * 2));

      return {
        ...node,
        x: cx + Math.cos(angle) * spread + (Math.random() - 0.5) * 40,
        y: cy + Math.sin(angle) * spread + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius: nodeRadius,
        pinned: false,
      };
    });

    simNodesRef.current = nodes;
    setSimNodes([...nodes]);
  }, [rawNodes, dimensions, connectionCounts]);

  // Observe container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Run force simulation
  useEffect(() => {
    if (simNodesRef.current.length === 0) return;

    let isRunning = true;
    let iterationCount = 0;
    const maxIterations = 500;

    const nodeMap = new Map<string, SimNode>();

    const step = () => {
      if (!isRunning || iterationCount >= maxIterations) return;

      const nodes = simNodesRef.current;
      if (nodes.length === 0) return;

      nodeMap.clear();
      for (const node of nodes) {
        nodeMap.set(node.id, node);
      }

      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;

      for (let iter = 0; iter < MAX_ITERATIONS_PER_FRAME; iter++) {
        // Apply repulsion between all node pairs
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let distSq = dx * dx + dy * dy;

            // Avoid division by zero
            if (distSq < 1) {
              dx = (Math.random() - 0.5) * 2;
              dy = (Math.random() - 0.5) * 2;
              distSq = dx * dx + dy * dy;
            }

            const dist = Math.sqrt(distSq);
            const force = REPULSION_STRENGTH / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (!a.pinned) {
              a.vx -= fx;
              a.vy -= fy;
            }
            if (!b.pinned) {
              b.vx += fx;
              b.vy += fy;
            }
          }
        }

        // Apply attraction along edges
        for (const link of rawLinks) {
          const source = nodeMap.get(link.source);
          const target = nodeMap.get(link.target);
          if (!source || !target) continue;

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1) continue;

          const idealDist = 120;
          const force = (dist - idealDist) * ATTRACTION_STRENGTH;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (!source.pinned) {
            source.vx += fx;
            source.vy += fy;
          }
          if (!target.pinned) {
            target.vx -= fx;
            target.vy -= fy;
          }
        }

        // Apply center gravity
        for (const node of nodes) {
          if (node.pinned) continue;
          node.vx += (cx - node.x) * CENTER_GRAVITY;
          node.vy += (cy - node.y) * CENTER_GRAVITY;
        }

        // Apply damping and update positions
        let totalVelocity = 0;
        for (const node of nodes) {
          if (node.pinned) continue;
          node.vx *= DAMPING;
          node.vy *= DAMPING;

          // Clamp velocity
          const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
          if (speed > 10) {
            node.vx = (node.vx / speed) * 10;
            node.vy = (node.vy / speed) * 10;
          }

          node.x += node.vx;
          node.y += node.vy;

          totalVelocity += Math.abs(node.vx) + Math.abs(node.vy);
        }

        iterationCount++;

        // Check convergence
        if (totalVelocity / nodes.length < MIN_VELOCITY) {
          // Simulation converged
          setSimNodes([...nodes]);
          return;
        }
      }

      setSimNodes([...nodes]);
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [rawNodes, rawLinks, dimensions]);

  // Build a lookup for quick access
  const nodeMap = useMemo(() => {
    const map = new Map<string, SimNode>();
    for (const node of simNodes) {
      map.set(node.id, node);
    }
    return map;
  }, [simNodes]);

  // Compute highlighted set for selection
  const highlightedIds = useMemo(() => {
    const activeId = selectedNodeId || hoveredNodeId;
    if (!activeId) return new Set<string>();

    const ids = new Set<string>([activeId]);
    for (const link of rawLinks) {
      if (link.source === activeId) ids.add(link.target);
      if (link.target === activeId) ids.add(link.source);
    }
    return ids;
  }, [selectedNodeId, hoveredNodeId, rawLinks]);

  // Compute graph stats
  const graphStats = useMemo(() => {
    if (simNodes.length === 0) {
      return { totalNodes: 0, totalEdges: 0, mostConnected: null as string | null };
    }

    let maxConnections = 0;
    let mostConnectedLabel: string | null = null;

    for (const node of simNodes) {
      const count = connectionCounts.get(node.id) ?? 0;
      if (count > maxConnections) {
        maxConnections = count;
        mostConnectedLabel = node.label;
      }
    }

    return {
      totalNodes: simNodes.length,
      totalEdges: rawLinks.length,
      mostConnected: mostConnectedLabel,
    };
  }, [simNodes, rawLinks, connectionCounts]);

  // Zoom handlers
  const handleZoomIn = () => {
    setViewState((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.25, 4) }));
  };

  const handleZoomOut = () => {
    setViewState((prev) => ({ ...prev, scale: Math.max(prev.scale / 1.25, 0.25) }));
  };

  const handleResetView = () => {
    setViewState({ offsetX: 0, offsetY: 0, scale: 1 });
    setSelectedNodeId(null);
  };

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleDelta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewState((prev) => ({
      ...prev,
      scale: Math.max(0.25, Math.min(4, prev.scale * scaleDelta)),
    }));
  }, []);

  // Pan and drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - viewState.offsetX) / viewState.scale;
      const mouseY = (e.clientY - rect.top - viewState.offsetY) / viewState.scale;

      // Check if clicking on a node
      let clickedNode: SimNode | null = null;
      for (const node of simNodesRef.current) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        if (dx * dx + dy * dy <= node.radius * node.radius) {
          clickedNode = node;
          break;
        }
      }

      if (clickedNode) {
        isDraggingRef.current = true;
        dragNodeRef.current = clickedNode.id;
        clickedNode.pinned = true;
      } else {
        panStartRef.current = { x: e.clientX, y: e.clientY };
      }

      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    },
    [viewState]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;

      if (isDraggingRef.current && dragNodeRef.current) {
        const rect = svg.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - viewState.offsetX) / viewState.scale;
        const mouseY = (e.clientY - rect.top - viewState.offsetY) / viewState.scale;

        const dragNode = simNodesRef.current.find((n) => n.id === dragNodeRef.current);
        if (dragNode) {
          dragNode.x = mouseX;
          dragNode.y = mouseY;
          dragNode.vx = 0;
          dragNode.vy = 0;
          setSimNodes([...simNodesRef.current]);
        }
      } else if (panStartRef.current) {
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        setViewState((prev) => ({
          ...prev,
          offsetX: prev.offsetX + dx,
          offsetY: prev.offsetY + dy,
        }));
      }

      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    },
    [viewState]
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current && dragNodeRef.current) {
      const dragNode = simNodesRef.current.find((n) => n.id === dragNodeRef.current);
      if (dragNode) {
        dragNode.pinned = false;
      }
    }
    isDraggingRef.current = false;
    dragNodeRef.current = null;
    panStartRef.current = null;
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const getNodeColor = (nodeType: string): string => {
    return NODE_COLORS[nodeType] ?? DEFAULT_NODE_COLOR;
  };

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;
  const hasHighlight = highlightedIds.size > 0;

  return (
    <Stack gap="sm">
      {/* Graph Stats Bar */}
      <Paper p="xs" withBorder>
        <Group justify="space-between">
          <Group gap="md">
            <Group gap={4}>
              <IconGraph size={14} style={{ color: 'var(--mantine-color-madroxPurple-5)' }} />
              <Text size="xs" fw={500}>
                Graph
              </Text>
            </Group>
            <Badge size="xs" variant="outline" color="blue">
              {graphStats.totalNodes} nodes
            </Badge>
            <Badge size="xs" variant="outline" color="green">
              {graphStats.totalEdges} edges
            </Badge>
            {graphStats.mostConnected && (
              <Badge size="xs" variant="outline" color="grape">
                Hub: {graphStats.mostConnected}
              </Badge>
            )}
          </Group>
          <Group gap={4}>
            <Tooltip label="Zoom In">
              <ActionIcon variant="subtle" size="sm" onClick={handleZoomIn}>
                <IconZoomIn size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Zoom Out">
              <ActionIcon variant="subtle" size="sm" onClick={handleZoomOut}>
                <IconZoomOut size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Reset View">
              <ActionIcon variant="subtle" size="sm" onClick={handleResetView}>
                <IconFocus2 size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Paper>

      {/* SVG Graph Container */}
      <Paper
        ref={containerRef}
        p={0}
        withBorder
        style={{
          height: 450,
          overflow: 'hidden',
          cursor: panStartRef.current ? 'grabbing' : 'grab',
          backgroundColor: 'var(--mantine-color-dark-8)',
          position: 'relative',
        }}
      >
        {rawNodes.length === 0 ? (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Text size="xs" c="dimmed">
              No graph data available. Discover entities to build the relationship graph.
            </Text>
          </Box>
        ) : (
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{ display: 'block', width: '100%', height: '100%' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <g transform={`translate(${viewState.offsetX},${viewState.offsetY}) scale(${viewState.scale})`}>
              {/* Render edges */}
              {rawLinks.map((link, i) => {
                const source = nodeMap.get(link.source);
                const target = nodeMap.get(link.target);
                if (!source || !target) return null;

                const isHighlighted =
                  hasHighlight &&
                  highlightedIds.has(link.source) &&
                  highlightedIds.has(link.target);
                const isDimmed = hasHighlight && !isHighlighted;

                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g key={`edge-${i}`}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={
                        isHighlighted
                          ? 'var(--mantine-color-madroxPurple-5)'
                          : 'var(--mantine-color-dark-4)'
                      }
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeOpacity={isDimmed ? 0.15 : isHighlighted ? 0.9 : 0.4}
                    />
                    {/* Edge label */}
                    {link.label && !isDimmed && (
                      <text
                        x={midX}
                        y={midY - 4}
                        textAnchor="middle"
                        fill="var(--mantine-color-dark-2)"
                        fontSize={9}
                        opacity={isHighlighted ? 0.9 : 0.5}
                        pointerEvents="none"
                      >
                        {link.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Render nodes */}
              {simNodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isHovered = node.id === hoveredNodeId;
                const isHighlightedNode = hasHighlight && highlightedIds.has(node.id);
                const isDimmedNode = hasHighlight && !isHighlightedNode;
                const color = getNodeColor(node.node_type);

                return (
                  <g
                    key={node.id}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeClick(node.id);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    {/* Glow ring for selected/hovered */}
                    {(isSelected || isHovered) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.radius + 4}
                        fill="none"
                        stroke={color}
                        strokeWidth={2}
                        strokeOpacity={0.5}
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius}
                      fill={color}
                      fillOpacity={isDimmedNode ? 0.2 : 0.85}
                      stroke={isSelected ? '#fff' : color}
                      strokeWidth={isSelected ? 2 : 1}
                      strokeOpacity={isDimmedNode ? 0.15 : 0.9}
                    />

                    {/* Node label */}
                    <text
                      x={node.x}
                      y={node.y + node.radius + 12}
                      textAnchor="middle"
                      fill="var(--mantine-color-dark-1)"
                      fontSize={10}
                      fontWeight={isSelected ? 600 : 400}
                      opacity={isDimmedNode ? 0.2 : 0.85}
                      pointerEvents="none"
                    >
                      {node.label.length > 20
                        ? node.label.slice(0, 18) + '...'
                        : node.label}
                    </text>

                    {/* Hover tooltip (rendered as SVG text above node) */}
                    {isHovered && !isDraggingRef.current && (
                      <g pointerEvents="none">
                        <rect
                          x={node.x - 70}
                          y={node.y - node.radius - 38}
                          width={140}
                          height={28}
                          rx={4}
                          fill="var(--mantine-color-dark-6)"
                          stroke="var(--mantine-color-dark-4)"
                          strokeWidth={1}
                        />
                        <text
                          x={node.x}
                          y={node.y - node.radius - 26}
                          textAnchor="middle"
                          fill="var(--mantine-color-dark-0)"
                          fontSize={10}
                          fontWeight={500}
                        >
                          {node.label}
                        </text>
                        <text
                          x={node.x}
                          y={node.y - node.radius - 14}
                          textAnchor="middle"
                          fill="var(--mantine-color-dark-2)"
                          fontSize={9}
                        >
                          {node.node_type} | {connectionCounts.get(node.id) ?? 0} connections
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </Paper>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card
          padding="sm"
          style={{
            backgroundColor: 'var(--mantine-color-dark-7)',
            borderLeft: `3px solid ${getNodeColor(selectedNode.node_type)}`,
          }}
        >
          <Stack gap={4}>
            <Group justify="space-between">
              <Text fw={500} size="sm">
                {selectedNode.label}
              </Text>
              <Badge
                size="xs"
                color="gray"
                variant="light"
                style={{ backgroundColor: getNodeColor(selectedNode.node_type) + '22' }}
              >
                {selectedNode.node_type}
              </Badge>
            </Group>
            <Group gap="md">
              <Text size="xs" c="dimmed">
                Connections: {connectionCounts.get(selectedNode.id) ?? 0}
              </Text>
              {selectedNode.metadata &&
                Object.entries(selectedNode.metadata).map(([key, value]) => (
                  <Text key={key} size="xs" c="dimmed">
                    {key}: {String(value)}
                  </Text>
                ))}
            </Group>
          </Stack>
        </Card>
      )}

      {/* Legend */}
      <Paper p="xs" withBorder>
        <Group gap="md" wrap="wrap">
          {Object.entries(NODE_COLORS)
            .slice(0, 8)
            .map(([type, color]) => (
              <Group key={type} gap={4}>
                <Box
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: color,
                  }}
                />
                <Text size="xs" c="dimmed" style={{ textTransform: 'capitalize' }}>
                  {type.replace(/_/g, ' ')}
                </Text>
              </Group>
            ))}
        </Group>
      </Paper>
    </Stack>
  );
}

export default InvestigationGraph;
