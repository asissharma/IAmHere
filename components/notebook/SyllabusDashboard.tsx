import React, { useMemo } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { FaBook, FaCheckCircle, FaClock, FaFire, FaTrophy, FaLightbulb, FaRocket, FaChartLine, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";



type Node = {
    id: string;
    title: string;
    type: "syllabus" | "folder" | "file";
    children: Node[];
    progress?: number;
    masteryLevel?: number;
    lastViewed?: Date;
    tags?: string[];
    pinned?: boolean;
    sourceFile?: string;
    importedAt?: string;
};

interface SyllabusDashboardProps {
    node: Node;
    onNavigate: (nodeId: string) => void;
}

const SyllabusDashboard: React.FC<SyllabusDashboardProps> = ({ node, onNavigate }) => {
    const topics = useMemo(() => node.children || [], [node]);
    const totalTopics = topics.length;

    const aggregateProgress = useMemo(() => {
        if (totalTopics === 0) return 0;
        const total = topics.reduce((acc, curr) => acc + (curr.progress || 0), 0);
        return Math.round(total / totalTopics);
    }, [topics, totalTopics]);

    const completedStats = topics.reduce((acc, curr) => {
        if ((curr.progress || 0) >= 100) acc.completed++;
        else if ((curr.progress || 0) > 0) acc.inProgress++;
        else acc.notStarted++;
        return acc;
    }, { completed: 0, inProgress: 0, notStarted: 0 });

    const barData = {
        labels: topics.map(n => n.title.length > 15 ? n.title.substring(0, 15) + '...' : n.title),
        datasets: [
            {
                label: "Progress (%)",
                data: topics.map(n => n.progress || 0),
                backgroundColor: topics.map(n => {
                    const progress = n.progress || 0;
                    if (progress >= 100) return "rgba(16, 185, 129, 0.8)";
                    if (progress >= 50) return "rgba(59, 130, 246, 0.8)";
                    return "rgba(139, 92, 246, 0.6)";
                }),
                borderRadius: 8,
                borderWidth: 0,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                padding: 16,
                cornerRadius: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                displayColors: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(139, 92, 246, 0.08)', drawBorder: false },
                ticks: { color: 'rgba(156, 163, 175, 0.8)', font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(156, 163, 175, 0.8)', font: { size: 11 } }
            }
        },
    };

    const doughnutData = {
        labels: ["Completed", "In Progress", "Not Started"],
        datasets: [
            {
                data: [completedStats.completed, completedStats.inProgress, completedStats.notStarted],
                backgroundColor: [
                    "rgba(16, 185, 129, 0.9)",
                    "rgba(245, 158, 11, 0.9)",
                    "rgba(156, 163, 175, 0.2)",
                ],
                borderWidth: 0,
                cutout: '75%',
            },
        ],
    };

    return (
        <div className="p-6 md:p-10 h-full overflow-y-auto bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-pink-50/30 dark:from-gray-950 dark:via-purple-950/10 dark:to-gray-950">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-7xl mx-auto space-y-6"
            >
                {/* Hero Header with Gradient */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 md:p-10 shadow-2xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                                <FaBook className="text-yellow-300" />
                                <span>Learning Journey</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">{node.title}</h1>
                            <p className="text-purple-100 text-sm md:text-base flex items-center gap-2">
                                <FaRocket className="text-yellow-300" />
                                {totalTopics} {totalTopics === 1 ? 'topic' : 'topics'} • Your personalized curriculum
                            </p>
                            {node.sourceFile && (
                                <p className="text-xs text-purple-200 mt-2 flex items-center gap-1.5 opacity-75">
                                    <FaClock size={10} />
                                    Imported from <span className="font-mono bg-white/10 px-2 py-0.5 rounded">{node.sourceFile}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-end">
                            <div className="text-sm text-purple-200 mb-1 font-medium">Overall Progress</div>
                            <div className="flex items-baseline gap-2">
                                <div className="text-5xl md:text-6xl font-black text-white tracking-tight">{aggregateProgress}</div>
                                <div className="text-2xl text-purple-200 font-bold">%</div>
                            </div>
                            <div className="mt-2 w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${aggregateProgress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                                    className="h-full bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Modern Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                        icon={<FaCheckCircle />}
                        label="Completed"
                        value={completedStats.completed}
                        total={totalTopics}
                        gradient="from-emerald-500 to-teal-600"
                        accentColor="emerald"
                    />
                    <MetricCard
                        icon={<FaFire />}
                        label="In Progress"
                        value={completedStats.inProgress}
                        gradient="from-amber-500 to-orange-600"
                        accentColor="amber"
                    />
                    <MetricCard
                        icon={<FaStar />}
                        label="Mastery Score"
                        value={aggregateProgress >= 80 ? "Expert" : aggregateProgress >= 50 ? "Intermediate" : "Beginner"}
                        gradient="from-purple-500 to-pink-600"
                        accentColor="purple"
                    />
                </div>

                {/* Charts - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-purple-100/50 dark:border-purple-900/30">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                                <FaChartLine className="text-purple-600" />
                                Topic Breakdown
                            </h3>
                        </div>
                        <div className="h-64">
                            {/* <Bar data={barData} options={barOptions} /> */}
                            <Bar data={barData} />
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-purple-100/50 dark:border-purple-900/30 flex flex-col">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">Status Overview</h3>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-48 h-48 relative">
                                <Doughnut data={doughnutData} options={{ maintainAspectRatio: true, plugins: { legend: { display: false } } }} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">{aggregateProgress}%</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Complete</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 mt-4 text-xs font-semibold">
                            <span className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                                <span className="text-gray-600 dark:text-gray-300">Done ({completedStats.completed})</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
                                <span className="text-gray-600 dark:text-gray-300">Active ({completedStats.inProgress})</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Topics Grid - Enhanced */}
                <div>
                    <h3 className="text-2xl font-bold mb-5 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Your Topics</h3>
                    {topics.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {topics.map((topic, idx) => (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    onClick={() => onNavigate(topic.id)}
                                    className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 rounded-xl border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl transition-all duration-300"
                                >
                                    {/* Progress indicator on top edge */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${topic.progress || 0}%` }}
                                            transition={{ duration: 1, delay: idx * 0.05 + 0.2 }}
                                            className={`h-full ${(topic.progress || 0) >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                                (topic.progress || 0) >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                                    'bg-gradient-to-r from-purple-500 to-pink-500'
                                                }`}
                                        />
                                    </div>

                                    <div className="flex items-start justify-between mb-3 mt-1">
                                        <div className="p-2.5 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                                            <FaLightbulb className="text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" size={18} />
                                        </div>
                                        {topic.pinned && (
                                            <div className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                                                <FaStar className="text-yellow-500" size={10} />
                                            </div>
                                        )}
                                    </div>

                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {topic.title}
                                    </h4>

                                    <div className="flex items-center justify-between mt-3 text-xs">
                                        <span className="font-semibold text-gray-500 dark:text-gray-400">
                                            {topic.progress || 0}% complete
                                        </span>
                                        {(topic.progress || 0) >= 100 && (
                                            <FaCheckCircle className="text-emerald-500" size={14} />
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-2xl bg-purple-50/30 dark:bg-purple-950/10">
                            <FaBook className="mx-auto text-purple-300 dark:text-purple-700 mb-4" size={48} />
                            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">No topics yet</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm">Start building your learning path</p>
                        </div>
                    )}
                </div>

            </motion.div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, total, gradient, accentColor }: any) => (
    <motion.div
        whileHover={{ y: -2, scale: 1.02 }}
        className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 group"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500`}></div>

        <div className="relative z-10 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                <span className="text-xl">{icon}</span>
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {typeof value === 'number' && total ? `${value}/${total}` : value}
                </p>
            </div>
        </div>
    </motion.div>
);

export default SyllabusDashboard;
