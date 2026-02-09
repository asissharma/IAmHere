import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, {
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    addEdge,
    Background,
    Controls,
    MiniMap,
    Panel,
    Node,
    Edge
} from "reactflow";
import "reactflow/dist/style.css";
import { fetchMindMap, fetchGlobalMindMap, fetchNodes } from "@/pages/api/utils";
import { AiFillCloseCircle, AiOutlineGlobal, AiOutlineCluster } from "react-icons/ai";
import { FaTags, FaProjectDiagram, FaExpand, FaCompress } from "react-icons/fa";
import DOMPurify from "dompurify";

type TreeNode = {
    nodeId: string;
    title: string;
    type: string;
    parentId: string | null;
    content?: string;
    children: TreeNode[];
    tags?: string[];
    pinned?: boolean;
    prerequisites?: string[];
};

type MindMapProps = {
    parentId: string;
    onClose: () => void;
    onNavigate?: (nodeId: string) => void;
};

const MindMap: React.FC<MindMapProps> = ({ parentId, onClose, onNavigate }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<"tree" | "global">("tree");
    const [showTags, setShowTags] = useState(false);
    const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    // Colors for depth/types
    const getNodeStyle = (type: string, isExpanded: boolean) => {
        let bg = '#ffffff';
        if (type === 'syllabus') bg = '#e0e7ff'; // Indigo 100
        if (type === 'folder') bg = '#fef3c7'; // Amber 100

        return {
            background: bg,
            border: isExpanded ? '2px solid #6366f1' : '1px dashed #cbd5e1',
            borderRadius: type === 'file' ? '6px' : '20px',
            width: 160,
            fontSize: 12,
            padding: 8,
        };
    };

    // --- Layout Helper ---
    // Simple radial layout for new nodes around a center
    const getRadialPosition = (cx: number, cy: number, index: number, total: number, radius: number) => {
        if (total === 0) return { x: cx, y: cy };
        const angle = (index / total) * 2 * Math.PI;
        return {
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius
        };
    };

    const handleNodeClick = async (event: React.MouseEvent, node: Node) => {
        setSelectedNodeData(node.data);
        if (mode === 'global' || node.type === 'file') return;

        // Lazy Loading Logic for Tree Mode
        if (expandedNodes.has(node.id)) {
            // Collapse (remove children) - Optional, maybe just leave open?
            return;
        }

        try {
            // Using fetchMindMap effectively fetches subtree. We can use it.
            const res = await fetchMindMap(node.id);
            const treeRoot = Array.isArray(res) ? res.find(n => n.nodeId === node.id) : res;

            if (!treeRoot || !treeRoot.children) return;

            const newNodes: Node[] = [];
            const newEdges: Edge[] = [];
            const children = treeRoot.children;
            const radius = 250;

            children.forEach((child: TreeNode, i: number) => {
                // Check if node exists
                if (nodes.some(n => n.id === child.nodeId)) return;

                const pos = getRadialPosition(node.position.x, node.position.y, i, children.length, radius);

                newNodes.push({
                    id: child.nodeId,
                    type: 'default', // Using default for now, can be custom
                    data: { label: child.title, ...child },
                    position: pos,
                    style: getNodeStyle(child.type, false),
                });

                newEdges.push({
                    id: `${node.id}-${child.nodeId}`,
                    source: node.id,
                    target: child.nodeId,
                    style: { stroke: '#cbd5e1' },
                    type: 'smoothstep'
                });
            });

            setNodes((nds) => nds.concat(newNodes));
            setEdges((eds) => eds.concat(newEdges));
            setExpandedNodes(prev => new Set(prev).add(node.id));

            // Update style of clicked node to indicate expanded
            setNodes((nds) => nds.map(n => {
                if (n.id === node.id) {
                    return { ...n, style: getNodeStyle(n.data.type, true) };
                }
                return n;
            }));

        } catch (err) {
            console.error("Failed to expand node", err);
        }
    };

    const initGraph = async () => {
        setLoading(true);
        setNodes([]);
        setEdges([]);
        setExpandedNodes(new Set());

        try {
            if (mode === "global") {
                const data = await fetchGlobalMindMap();
                const gNodes: any[] = [];
                const gEdges: any[] = [];
                const roots = data.filter((n: any) => !n.parentId);
                const childMap = new Map();
                data.forEach((n: any) => { if (n.parentId) { if (!childMap.has(n.parentId)) childMap.set(n.parentId, []); childMap.get(n.parentId).push(n); } });

                const traverse = (node: any, cx: number, cy: number, angleRange: any, level: number) => {
                    gNodes.push({
                        id: node.nodeId,
                        data: { label: node.title, ...node },
                        position: { x: cx, y: cy },
                        style: getNodeStyle(node.type, false)
                    });
                    const children = childMap.get(node.nodeId) || [];
                    if (children.length === 0) return;
                    const step = (angleRange.end - angleRange.start) / children.length;
                    children.forEach((c: any, i: number) => {
                        const angle = angleRange.start + (i * step) + step / 2;
                        const r = 200 - level * 20;
                        const nx = cx + Math.cos(angle) * Math.max(r, 50);
                        const ny = cy + Math.sin(angle) * Math.max(r, 50);
                        gEdges.push({ id: `${node.nodeId}-${c.nodeId}`, source: node.nodeId, target: c.nodeId, style: { stroke: '#ddd' } });
                        traverse(c, nx, ny, { start: angle - step / 2, end: angle + step / 2 }, level + 1);
                    });
                };

                roots.forEach((r: any, i: number) => {
                    const a = (i / roots.length) * 2 * Math.PI;
                    traverse(r, Math.cos(a) * 500, Math.sin(a) * 500, { start: 0, end: 2 * Math.PI }, 0);
                });
                setNodes(gNodes);
                setEdges(gEdges);

            } else {
                // Lazy Tree Mode: Only load root + direct children
                const res = await fetchMindMap(parentId);

                // Flatten first level
                const rootTree = Array.isArray(res) ? res[0] : res;
                if (!rootTree) return; // Error or empty

                const initNodes: Node[] = [];
                const initEdges: Edge[] = [];

                // Root
                initNodes.push({
                    id: rootTree.nodeId,
                    data: { label: rootTree.title, ...rootTree },
                    position: { x: 0, y: 0 },
                    style: getNodeStyle(rootTree.type, true), // Root starts expanded-ish visually
                    type: 'input'
                });
                setExpandedNodes(new Set([rootTree.nodeId]));

                // Direct children
                if (rootTree.children) {
                    rootTree.children.forEach((child: TreeNode, i: number) => {
                        const pos = getRadialPosition(0, 0, i, rootTree.children.length, 250);
                        initNodes.push({
                            id: child.nodeId,
                            data: { label: child.title, ...child },
                            position: pos,
                            style: getNodeStyle(child.type, false) // Children start collapsed
                        });
                        initEdges.push({
                            id: `${rootTree.nodeId}-${child.nodeId}`,
                            source: rootTree.nodeId,
                            target: child.nodeId,
                            style: { stroke: '#cbd5e1' }
                        });
                    });
                }

                // --- Added: Prerequisite Edges ---
                // We optimize by looping through initNodes we just created
                initNodes.forEach(node => {
                    if (node.data.prerequisites && Array.isArray(node.data.prerequisites)) {
                        node.data.prerequisites.forEach((reqId: string) => {
                            // Only draw if target exists in current graph
                            if (initNodes.some(n => n.id === reqId)) {
                                initEdges.push({
                                    id: `req-${reqId}-${node.id}`,
                                    source: reqId,
                                    target: node.id,
                                    animated: true,
                                    style: { stroke: '#f87171', strokeDasharray: '5 5' },
                                    label: 'Prerequisite',
                                    labelStyle: { fill: '#f87171', fontSize: 10 },
                                    type: 'straight'
                                });
                            }
                        });
                    }
                });

                setNodes(initNodes);
                setEdges(initEdges);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initGraph();
    }, [mode, parentId]);

    return (
        <div className="w-full h-full bg-gray-50 relative">
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={handleNodeClick}
                    fitView
                    className="bg-gray-50 dark:bg-gray-900"
                >
                    <Background color="#ccc" gap={20} />
                    <Controls />
                    <MiniMap />

                    <Panel position="top-left" className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex gap-2">
                        <button
                            onClick={() => setMode(mode === 'tree' ? 'global' : 'tree')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'global' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            <AiOutlineGlobal /> {mode === 'global' ? 'Global View' : 'Tree View'}
                        </button>
                        <div className="w-px bg-gray-200 h-6 mx-1"></div>
                        <button onClick={initGraph} className="p-2 hover:bg-gray-100 rounded-full" title="Refresh">
                            <FaProjectDiagram />
                        </button>
                    </Panel>

                </ReactFlow>
            </ReactFlowProvider>

            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 text-gray-500"
            >
                <AiFillCloseCircle size={24} className="text-red-500" />
            </button>

            {/* Detail Overlay */}
            {selectedNodeData && (
                <div className="absolute top-20 right-4 w-80 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-4">{selectedNodeData.label}</h3>
                        <button onClick={() => setSelectedNodeData(null)} className="text-gray-400 hover:text-gray-600">×</button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mb-3">
                        {onNavigate && (
                            <button
                                onClick={() => {
                                    onNavigate(selectedNodeData.nodeId);
                                    onClose(); // Close mindmap to show content
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
                            >
                                Open in Editor
                            </button>
                        )}
                    </div>

                    {/* Prerequisites List */}
                    {selectedNodeData.prerequisites && selectedNodeData.prerequisites.length > 0 && (
                        <div className="mb-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Prerequisites</h4>
                            <div className="flex flex-wrap gap-1">
                                {selectedNodeData.prerequisites.map((reqId: string) => (
                                    <span key={reqId} className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                                        {/* Ideally we look up title, but ID is fallback */}
                                        {nodes.find(n => n.id === reqId)?.data.label || reqId}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-sm text-gray-600 dark:text-gray-300 max-h-60 overflow-y-auto custom-scrollbar">
                        {selectedNodeData.content ? (
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedNodeData.content) }} />
                        ) : (
                            <p className="italic text-gray-400">Double click to expand if folder.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MindMap;
