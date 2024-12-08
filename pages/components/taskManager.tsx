import { useState, useEffect } from "react";
import axios from "axios";

interface Task {
  _id: string;
  taskName: string;
  description: string;
  isCompleted: boolean;
  priority: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [frequency, setFrequency] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = "user123"; // Replace with dynamic user ID in production

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/tasksManager`, {
        params: { userId },
      });
      setTasks(response.data);
    } catch (err: any) {
      setError("Failed to fetch tasks. Please try again.");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!taskName || !description || !priority || !frequency) {
      setError("All fields are required!");
      return;
    }

    if (frequency === "weekly" && !dayOfWeek) {
      setError("Day of the week is required for weekly tasks.");
      return;
    }

    if (frequency === "once" && !date) {
      setError("Date is required for one-time tasks.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await axios.post("/api/tasksManager", {
        action: "createTask",
        taskName,
        description,
        frequency,
        priority,
        dayOfWeek: frequency === "weekly" ? dayOfWeek : undefined,
        date: frequency === "once" ? date : undefined,
        userId,
      });
      fetchTasks();
      clearForm();
    } catch (err: any) {
      setError("Failed to create task. Please try again.");
      console.error("Error creating task:", err);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post("/api/tasksManager", {
        action: "completeTask",
        taskId,
        userId,
      });
      fetchTasks();
    } catch (err: any) {
      setError("Failed to complete task. Please try again.");
      console.error("Error completing task:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setTaskName("");
    setDescription("");
    setPriority("medium");
    setFrequency("daily");
    setDayOfWeek("");
    setDate("");
    setError(null);
  };

  return (
    <div className="p-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center rounded-md">
      <h1 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
        Task Manager
      </h1>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-500 text-white p-2 rounded-md shadow-md w-full sm:w-96 text-center">
          {error}
        </div>
      )}
      {/* Add Task Form */}
      <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-lg w-full sm:w-96">
        <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
          Create Task
        </h2>
        <div className="space-y-1">
          <div className="flex flex-row m-2">
            <input
              type="text"
              placeholder="Task Name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            />
            <textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            />
          </div>
          <div className="flex flex-row m-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="once">Once</option>
            </select>

            {frequency === "weekly" && (
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
              >
                <option value="" disabled>Select a day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>            
            )}
            {frequency === "once" && (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
              />
            )}
            <button
              onClick={createTask}
              disabled={loading}
              className={`bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300 ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? (
                <svg className="w-6 h-6 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-75" strokeDasharray="150" strokeDashoffset="0" />
                </svg>
              ) : (
                <img src="/completedTask.svg" alt="Completed Task" width={60}/>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="mt-1 w-full sm:w-96 card bg-white rounded p-2">
        <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
          Your Tasks For The Day
        </h2>
        {loading ? (
          <p className="text-gray-900 dark:text-white">Loading tasks...</p>
        ) : tasks.length > 0 ? (
          <ul className="space-y-3 h-72 scrollabler overflow-y-auto overflow-x-hidden">
            {tasks.map((task) => (
              <li
                key={task._id} className={`h-15 p-2 rounded-md shadow-md flex justify-between items-center ${
                  task.isCompleted
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-white dark:bg-gray-700"
                }`}
              >
                <div className="flex flex-row justify-evenly">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {task.taskName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {task.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col">
                  {!task.isCompleted && (
                    <button
                      onClick={() => completeTask(task._id)}
                      className="text-blue-600 dark:text-blue-400 px-2 bg-gray-100 rounded-full shadow-md  mb-2" 
                    >
                      Complete
                    </button>
                  )}
                  <div
                    className={`text-xs px-1 py-1 rounded-full ${
                      task.priority === "high"
                        ? "bg-red-500 text-white"
                        : task.priority === "medium"
                        ? "bg-yellow-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-900 dark:text-white">No tasks to show.</p>
        )}
      </div>
    </div>
  );
}
