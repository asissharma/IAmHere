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
import { FaBook, FaCheckCircle, FaClock, FaFire, FaTrophy, FaLightbulb } from "react-icons/fa";
import { motion } from "framer-motion";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

type Node = {
    id: string;
    title: string;
    type: "syllabus" | "folder" | "file";
    children: Node[];
    progress?: number;
    masteryLevel?: number; // 0-4
    lastViewed?: Date;
    tags?: string[];
    pinned?: boolean;
};

interface SyllabusDashboardProps {
    node: Node;
    onNavigate: (nodeId: string) => void;
}

const SyllabusDashboard: React.FC<SyllabusDashboardProps> = ({ node, onNavigate }) => {
    // Use children of this syllabus node for stats
    const topics = useMemo(() => node.children || [], [node]);

    const totalTopics = topics.length;

    // Calculate aggregate progress from children
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

    // Chart Data: Progress per Topic
    const barData = {
        labels: topics.map(n => n.title.length > 15 ? n.title.substring(0, 15) + '...' : n.title),
        datasets: [
            {
                label: "Progress (%)",
                data: topics.map(n => n.progress || 0),
                backgroundColor: "rgba(99, 102, 241, 0.6)", // Indigo
                borderColor: "rgba(99, 102, 241, 1)",
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
        },
    };

    const doughnutData = {
        labels: ["Completed", "In Progress", "Not Started"],
        datasets: [
            {
                data: [completedStats.completed, completedStats.inProgress, completedStats.notStarted],
                backgroundColor: [
                    "rgba(16, 185, 129, 0.8)", // Green
                    "rgba(245, 158, 11, 0.8)", // Amber
                    "rgba(156, 163, 175, 0.3)", // Gray
                ],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8"
            >
                {/* Header Section */}
                <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-700 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-1">
                            <FaBook /> Syllabus Dashboard
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{node.title}</h1>
                        <p className="text-gray-500 mt-2">{totalTopics} topics in this course</p>
                    </div>

                    <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Overall Completion</div>
                        <div className="text-3xl font-bold text-indigo-600">{aggregateProgress}%</div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        icon={<FaCheckCircle />}
                        label="Topics Completed"
                        value={`${completedStats.completed} / ${totalTopics}`}
                        color="bg-green-100 text-green-600"
                    />
                    <StatCard
                        icon={<FaFire />}
                        label="In Progress"
                        value={completedStats.inProgress}
                        color="bg-orange-100 text-orange-600"
                    />
                    <StatCard
                        icon={<FaTrophy />}
                        label="Mastery Level"
                        value="Novice" // Dynamic later
                        color="bg-purple-100 text-purple-600"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Topic Progress</h3>
                        <div className="flex-1 min-h-0">
                            <Bar data={barData} options={barOptions} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                        <h3 className="text-lg font-bold mb-4 w-full text-left text-gray-800 dark:text-gray-100">Status</h3>
                        <div className="w-48 h-48 relative">
                            <Doughnut data={doughnutData} options={{ maintainAspectRatio: true, plugins: { legend: { display: false } } }} />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-gray-700 dark:text-gray-200">{aggregateProgress}%</span>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4 text-xs font-medium text-gray-500">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Done</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Active</span>
                        </div>
                    </div>
                </div>

                {/* Topics List / Grid */}
                <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Topics</h3>
                    {topics.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {topics.map((topic) => (
                                <motion.div
                                    key={topic.id}
                                    whileHover={{ y: -2 }}
                                    onClick={() => onNavigate(topic.id)}
                                    className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-indigo-300 transition-colors group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 bg-indigo-50 dark:bg-gray-700 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            {/* Icon based on type if needed, usually folder/file inside syllabus */}
                                            <FaLightbulb size={16} />
                                        </div>
                                        {topic.pinned && <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>}
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{topic.title}</h4>
                                    <div className="mt-3">
                                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-indigo-500 h-1.5 rounded-full"
                                                style={{ width: `${topic.progress || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <p className="text-gray-500">This syllabus is empty.</p>
                            <button className="mt-2 text-indigo-600 font-medium hover:underline">Add your first topic</button>
                        </div>
                    )}
                </div>

            </motion.div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }: any) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
            <span className="text-xl">{icon}</span>
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export default SyllabusDashboard;
