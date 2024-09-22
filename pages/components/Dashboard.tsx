import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FaLock } from 'react-icons/fa';
import { useState } from 'react';

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // For Doughnut chart
);

import { Line, Bar, Doughnut } from 'react-chartjs-2';

const Dashboard: NextPage = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  // Sample chart data
  const progressData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Progress',
        data: [20, 40, 22, 55, 100, 36, 0],
        borderColor: 'rgba(76, 175, 80, 1)',
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barData = {
    labels: ['Leetcode DP Handbook', 'DP Cheat Sheet', 'DP Patterns Video'],
    datasets: [
      {
        label: 'Usage',
        data: [4.5, 5, 4],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
      },
    ],
  };

  const doughnutData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        label: 'Overall Completion',
        data: [55, 45],
        backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(244, 67, 54, 0.8)'],
      },
    ],
  };

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {/* Main Section */}
      <div className="flex flex-1 flex-col md:flex-row p-6 space-y-6 md:space-y-0 md:space-x-6">
        {/* Left Column */}
        <div className="flex flex-col space-y-6 md:w-1/4">
          {/* Productivity Tracker */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Productivity Tracker</h2>
            <p>Tasks Completed Today: 5</p>
            <p>Weekly Trend: +15%</p>
          </div>

          {/* Total Time Spent */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Total Time Spent</h2>
            <p>Today: 3 hrs</p>
            <p>This Week: 20 hrs</p>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col space-y-6 md:w-2/4">
          {/* System Lock */}
          <div className="p-6 bg-white rounded-lg shadow-lg flex items-center justify-between">
            <h2 className="text-lg font-semibold">Focused Mode Active</h2>
            <FaLock className="text-2xl text-green-500" />
          </div>

          {/* Weekly Progress Line Chart */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Weekly Progress</h2>
            <Line data={progressData} />
          </div>

          {/* Resource Usage Bar Chart */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Resource Usage</h2>
            <Bar data={barData} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col space-y-6 md:w-1/4">
          {/* Annual Goals */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Annual Goals</h2>
            <Doughnut data={doughnutData} />
          </div>

          {/* Completed Projects */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Completed Projects</h2>
            <p>Total: 8</p>
            <p>This Month: 2</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
