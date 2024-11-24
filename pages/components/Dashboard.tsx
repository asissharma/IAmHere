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
  ArcElement
);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  // Prepare chart data
  const lineChartData = {
    labels: data?.metrics?.map((metric) => metric.title) || [], // Ensure data.metrics exists
    datasets: [
      {
        label: 'Metric Values',
        data: data?.metrics?.map((metric) => metric.value) || [], // Handle undefined safely
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
        data: [55, 45], // You can replace this with actual data
        backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(244, 67, 54, 0.8)'],
      },
    ],
  };

  return (
    <motion.div
      className="flex flex-col p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Main Section */}
      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Left Column */}
        <div className="flex flex-col space-y-6 md:w-1/4">
          {/* Insights */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Insights</h2>
            <ul>
              {data.insights.map((insight, index) => (
                <li key={index} className="mb-2 text-gray-700">
                  {insight.message}
                </li>
              ))}
            </ul>
          </div>

          {/* Notifications */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <ul>
              {data.notifications.map((notification) => (
                <li key={notification.id} className="mb-2 text-gray-700">
                  {notification.message}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col space-y-6 md:w-2/4">
          {/* Weekly Progress Line Chart */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Weekly Progress</h2>
            <Line data={lineChartData} />
          </div>

          {/* Resource Usage Bar Chart */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Resource Usage</h2>
            <Bar data={barChartData} />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col space-y-6 md:w-1/4">
          {/* Overall Completion Doughnut Chart */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Overall Completion</h2>
            <Doughnut data={doughnutChartData} />
          </div>

          {/* Additional Metrics Display */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Metrics</h2>
            <ul>
              {data.metrics.map((metric) => (
                <li key={metric.title} className="mb-2 text-gray-700">
                  {metric.title}: {metric.value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
