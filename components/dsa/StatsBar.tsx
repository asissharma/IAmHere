import React from 'react';
import { DSAStats } from '../../types/dsa';
import { motion } from 'framer-motion';

interface StatsBarProps {
    stats: DSAStats;
}

const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between text-sm"
        >
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Solved</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                        {stats.totalSolved} <span className="text-gray-400 text-sm">/ {stats.totalQuestions}</span>
                    </span>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

                <div className="flex gap-4">
                    <StatItem label="Mastered" value={stats.mastery.mastered} color="text-purple-600 dark:text-purple-400" />
                    <StatItem label="Easy" value={stats.easy} color="text-green-600 dark:text-green-400" />
                    <StatItem label="Medium" value={stats.medium} color="text-yellow-600 dark:text-yellow-400" />
                    <StatItem label="Hard" value={stats.hard} color="text-red-600 dark:text-red-400" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Placeholder for Streak or Next Review Indicator */}
                <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                    🔥 Streamline Mode
                </div>
            </div>
        </motion.div>
    );
};

const StatItem = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="flex flex-col items-center">
        <span className="text-gray-500 dark:text-gray-500 text-[10px] uppercase">{label}</span>
        <span className={`font-bold ${color}`}>{value}</span>
    </div>
);

export default StatsBar;
