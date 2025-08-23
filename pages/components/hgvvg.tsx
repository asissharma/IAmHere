"use client";
import React, { useState, useEffect } from "react";

type Lane = "Dirty Businesses" | "Payable Skills" | "Basic Skills" | "Tech Smith" | "Project Dance";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

export default function ChaosOpsPage() {
  const lanes: Lane[] = [
    "Dirty Businesses",
    "Payable Skills",
    "Basic Skills",
    "Tech Smith",
    "Project Dance",
  ];

  const [tasks, setTasks] = useState<Record<Lane, Task[]>>({
    "Dirty Businesses": [],
    "Payable Skills": [],
    "Basic Skills": [],
    "Tech Smith": [],
    "Project Dance": [],
  });

  const [notes, setNotes] = useState<Record<Lane, string>>({
    "Dirty Businesses": "",
    "Payable Skills": "",
    "Basic Skills": "",
    "Tech Smith": "",
    "Project Dance": "",
  });

  const [streaks, setStreaks] = useState<Record<Lane, number>>({
    "Dirty Businesses": 0,
    "Payable Skills": 0,
    "Basic Skills": 0,
    "Tech Smith": 0,
    "Project Dance": 0,
  });

  const [queue, setQueue] = useState<Lane[]>([]);
  const [pomodoro, setPomodoro] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chaosOps");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTasks(parsed.tasks || tasks);
      setNotes(parsed.notes || notes);
      setStreaks(parsed.streaks || streaks);
      setQueue(parsed.queue || queue);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("chaosOps", JSON.stringify({ tasks, notes, streaks, queue }));
  }, [tasks, notes, streaks, queue]);

  // Pomodoro ticking
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setPomodoro((p) => {
        if (p <= 1) {
          setRunning(false);
          return 25 * 60; // reset
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const toggleTask = (lane: Lane, id: string) => {
    setTasks({
      ...tasks,
      [lane]: tasks[lane].map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    });
    setStreaks({ ...streaks, [lane]: streaks[lane] + 1 });
  };

  const addTask = (lane: Lane, text: string) => {
    const newTask: Task = { id: Date.now().toString(), text, done: false };
    setTasks({ ...tasks, [lane]: [...tasks[lane], newTask] });
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Chaos Ops Dashboard</h1>

      {/* Pomodoro */}
      <div className="flex items-center gap-4">
        <span className="text-2xl font-mono">{formatTime(pomodoro)}</span>
        <button
          onClick={() => setRunning(!running)}
          className="px-4 py-2 rounded bg-blue-500 text-white"
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => {
            setPomodoro(25 * 60);
            setRunning(false);
          }}
          className="px-4 py-2 rounded bg-gray-500 text-white"
        >
          Reset
        </button>
      </div>

      {/* Queue */}
      <div>
        <h2 className="text-xl font-semibold">Today’s Queue</h2>
        <div className="flex gap-2">
          {lanes.map((l) => (
            <button
              key={l}
              onClick={() => setQueue([...queue, l])}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Add {l}
            </button>
          ))}
        </div>
        <ul className="list-disc pl-5 mt-2">
          {queue.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </div>

      {/* Lanes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lanes.map((lane) => (
          <div key={lane} className="p-4 border rounded-lg shadow">
            <h2 className="text-lg font-bold">
              {lane} (🔥 {streaks[lane]})
            </h2>

            {/* Tasks */}
            <ul className="mt-2 space-y-1">
              {tasks[lane].map((t) => (
                <li
                  key={t.id}
                  className={`flex items-center gap-2 ${
                    t.done ? "line-through text-gray-500" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggleTask(lane, t.id)}
                  />
                  {t.text}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                const text = prompt("New task?");
                if (text) addTask(lane, text);
              }}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
            >
              + Add Task
            </button>

            {/* Notes */}
            <textarea
              className="w-full mt-3 p-2 border rounded"
              rows={3}
              placeholder="Atomic notes..."
              value={notes[lane]}
              onChange={(e) => setNotes({ ...notes, [lane]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
