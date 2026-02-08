import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../pages/api/utils';

// Helper to get last 365 days or similar
// For GitHub style: 52 weeks?
// Let's do last 6 months for compactness. 26 weeks.
const WEEKS = 26;

const ActivityHeatmap: React.FC = () => {
    const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // We need an endpoint to get aggregated logs.
                // Reusing /api/notes serves nodes? No.
                // We need /api/logs endpoint.
                // Let's assume we can fetch all logs or aggregated stats.
                // For now, let's mock or use a new endpoint if I created one.
                // I haven't created GET /api/logs yet.
                // I'll create a simple fetch logic here assuming /api/logs exists or I'll implement it.
                // Actually, let's just use what we have.
                // fetchNodes return nodes with 'lastStudied'.
                // But that's only LATEST study time. Heatmap needs HISTORY.
                // I need to fetch from 'activity_logs' collection.
                // So I definitely need GET /api/logs.
                const res = await apiRequest("/api/logs/stats", "GET"); // New endpoint
                if (res) {
                    setHeatmapData(res);
                }
            } catch (e) {
                console.error("Failed to fetch heatmap", e);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    // Generate Calendar Grid
    const generateCalendar = () => {
        const today = new Date();
        const data = [];
        // Start from WEEKS ago (Sunday)
        const endDate = new Date(today);
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (WEEKS * 7));

        // Align startDate to Sunday?
        const day = startDate.getDay();
        startDate.setDate(startDate.getDate() - day);

        let current = new Date(startDate);
        while (current <= endDate) {
            data.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return data;
    };

    const calendarDays = generateCalendar();

    const getColor = (count: number) => {
        if (!count) return "bg-gray-100 dark:bg-gray-800";
        if (count < 5 * 60) return "bg-green-200 dark:bg-green-900/40"; // < 5 mins
        if (count < 20 * 60) return "bg-green-300 dark:bg-green-800/60";
        if (count < 60 * 60) return "bg-green-400 dark:bg-green-700/80";
        return "bg-green-500 dark:bg-green-600";
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <span>Study Activity</span>
                <span className="text-xs font-normal text-gray-400">(Last 6 months)</span>
            </h3>

            <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                    {/* Weeks Columns */}
                    {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const dayDate = calendarDays[weekIndex * 7 + dayIndex];
                                if (!dayDate) return null;
                                const dateKey = dayDate.toDateString();
                                const minutes = Math.floor((heatmapData[dateKey] || 0) / 60);

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`w-3 h-3 rounded-sm ${getColor(heatmapData[dateKey] || 0)}`}
                                        title={`${dayDate.toLocaleDateString()}: ${minutes} mins`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end items-center gap-1 text-[10px] text-gray-400 mt-2">
                    <span>Less</span>
                    <div className="w-2 h-2 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
                    <div className="w-2 h-2 bg-green-200 dark:bg-green-900/40 rounded-sm"></div>
                    <div className="w-2 h-2 bg-green-400 dark:bg-green-700/80 rounded-sm"></div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
