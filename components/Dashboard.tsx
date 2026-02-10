import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

import TaskCard from './taskManager';
import DumpYourThought from './DumpYourThought';
import DsaQuestionsGraph from './dsaQuestionsGraph';
import dynamic from 'next/dynamic';
const PdfToAudioClient = dynamic(() => import('./AudioBook'), { ssr: false });



interface Metric {
  title: string;
  value: number;
}

interface Insight {
  message: string;
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

const Dashboard: NextPage = () => {
  const [data, setData] = useState<{
    metrics: Metric[];
    insights: Insight[];
    notifications: Notification[];
  } | null>(null);
  const [solvedProblemGraph, setSolvedProblemGraph] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const result = await response.json();
        setData(result);
        setSolvedProblemGraph(result.metrics[1].meta);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  // Prepare chart data
  const lineChartData = {
    labels: data?.metrics?.map((metric) => metric.title) || [],
    datasets: [
      {
        label: 'Metric Values',
        data: data?.metrics?.map((metric) => metric.value) || [],
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: data.metrics.map((metric) => metric.title),
    datasets: [
      {
        label: 'Metric Values',
        data: data.metrics.map((metric) => metric.value),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const doughnutChartData = {
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
      className="flex flex-col p-6 space-y-6 bg-gray-100 max-w-screen-xl mx-auto overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
      <PdfToAudioClient />
      {/* Main Section */}

      <div className="flex flex-col md:flex-row md:space-x-6 w-full">
        {/* Left Column */}
        {/* Middle Section */}
        <div className="flex flex-col space-y-6 md:w-1/2 w-full">
          {/* Weekly Progress Line Chart */}
          <DsaQuestionsGraph solvedProblems={solvedProblemGraph} />
          <div className="p-6 bg-white rounded-lg shadow-lg border-t-4 border-indigo-500">
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg border-t-4 border-indigo-500">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Weekly Progress</h2>
            <Line data={lineChartData} />
          </div>

          {/* Resource Usage Bar Chart */}
          <div className="p-6 bg-white rounded-lg shadow-lg border-t-4 border-yellow-500">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Resource Usage</h2>
            <Bar data={barChartData} />
          </div>
          {/* Overall Completion Doughnut Chart */}

          {/* Insights */}
          <div className="p-6 bg-white rounded-lg shadow-lg border-t-4 border-blue-500">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Insights</h2>
            <ul className="space-y-3">
              {data.insights.map((insight, index) => (
                <li key={index} className="text-gray-600">
                  {insight.message}
                </li>
              ))}
            </ul>
          </div>

          {/* Notifications */}
          <div className="p-6 bg-white rounded-lg shadow-lg border-t-4 border-green-500">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Notifications</h2>
            <ul className="space-y-3">
              {data.notifications.map((notification) => (
                <li key={notification.id} className="text-gray-600">
                  {notification.message}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg border-t-4 border-teal-500">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Overall Completion</h2>
            <Doughnut data={doughnutChartData} />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col space-y-6 md:w-1/2 w-full">
          {/* Task Manager */}
          <TaskCard />

          {/* Metrics */}
          <div className="p-6 bg-white rounded-lg shadow-lg border-t-4 border-red-500">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Metrics</h2>
            <ul className="space-y-3">
              {data.metrics.map((metric) => (
                <li key={metric.title} className="text-gray-600">
                  {metric.title}: {metric.value}
                </li>
              ))}
            </ul>
          </div>
          <motion.div
            className="flex flex-col p-6 space-y-6 bg-gray-100 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            <DumpYourThought />
          </motion.div>
        </div>
      </div>

      {/* Dump Thoughts Section - Full Width */}
    </motion.div>
  );
};

export default Dashboard;
