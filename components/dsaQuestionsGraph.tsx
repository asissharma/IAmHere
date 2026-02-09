import React, { useState, useEffect } from "react";

// Type definitions
type SolvedProblem = {
  _id: string;
  sno: number;
  topic: string;
  problem: string;
  difficulty: string;
  tags: string[];
  createdAt: string | null;
  isSolved: boolean;
  solvedBy: string;
  code: string;
  updatedAt: string;
};

type Day = {
  count: number;
  date: string;
};

type ContributionData = {
  weeklyData: Day[][];
  monthlyData: Day[][];
  yearlyData: Day[][];
};

// Utility function to group data by date
const groupByDate = (data: SolvedProblem[]): Record<string, number> => {
  const grouped: Record<string, number> = {};
  data.forEach((problem) => {
    const date = new Date(problem.updatedAt).toISOString().split("T")[0]; // Get only the YYYY-MM-DD part
    grouped[date] = (grouped[date] || 0) + 1; // Count contributions for each day
  });
  return grouped;
};

const ContributionGraph: React.FC<{ solvedProblems: SolvedProblem[] }> = ({ solvedProblems }) => {
  const [view, setView] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [contributionData, setContributionData] = useState<ContributionData>({
    weeklyData: [],
    monthlyData: [],
    yearlyData: [],
  });

  useEffect(() => {
    const groupedData = groupByDate(solvedProblems);
    const today = new Date();

    const generateWeeklyData = (): Day[][] => {
      const weeks: Day[][] = [[]];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split("T")[0];
        weeks[0].push({ date: dateString, count: groupedData[dateString] || 0 });
      }
      return weeks;
    };

    const generateMonthlyData = (): Day[][] => {
      const weeks: Day[][] = [];
      let currentWeek: Day[] = [];
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      for (let date = new Date(startOfMonth); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
        const dateString = date.toISOString().split("T")[0];
        currentWeek.push({ date: dateString, count: groupedData[dateString] || 0 });

        if (date.getDay() === 6 || date.getDate() === endOfMonth.getDate()) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }
      return weeks;
    };

    const generateYearlyData = (): Day[][] => {
      const weeks: Day[][] = [];
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear() + 1, 0, 0);

      let currentWeek: Day[] = [];
      for (let date = new Date(startOfYear); date <= endOfYear; date.setDate(date.getDate() + 1)) {
        const dateString = date.toISOString().split("T")[0];
        currentWeek.push({ date: dateString, count: groupedData[dateString] || 0 });

        if (date.getDay() === 6 || date.getDate() === endOfYear.getDate()) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }
      return weeks;
    };

    setContributionData({
      weeklyData: generateWeeklyData(),
      monthlyData: generateMonthlyData(),
      yearlyData: generateYearlyData(),
    });
  }, [solvedProblems]);

  const getContributions = (): Day[][] => {
    if (view === "weekly") return contributionData.weeklyData;
    if (view === "monthly") return contributionData.monthlyData;
    return contributionData.yearlyData;
  };

  const getColor = (count: number): string => {
    if (count === 0) return "bg-gray-200";
    if (count < 2) return "bg-green-100";
    if (count < 5) return "bg-green-300";
    if (count < 10) return "bg-green-500";
    return "bg-green-700";
  };

  const generateDayLabels = (): React.JSX.Element[] => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((day) => (
      <div key={day} className="text-xs text-gray-500 text-center">
        {day}
      </div>
    ));
  };

  const generateMonthLabels = (): React.JSX.Element[] => {
    return new Array(12).fill(0).map((_, monthIndex) => (
      <div key={monthIndex} className="text-xs text-gray-500">
        {new Date(2025, monthIndex).toLocaleString("default", { month: "short" })}
      </div>
    ));
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* View Selector */}
      <div className="flex space-x-4 mb-4">
        {["weekly", "monthly", "yearly"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v as "weekly" | "monthly" | "yearly")}
            className={`px-4 py-2 rounded text-sm font-semibold ${view === v ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Contribution Grid */}
      <div>
        {view === "yearly" && (
          <div className="grid grid-flow-col gap-1 mb-2">{generateMonthLabels()}</div>
        )}
        <div className="grid grid-flow-col gap-1 overflow-x-auto">
          {view === "monthly" && (
            <div className="grid grid-rows-7 gap-1">{generateDayLabels()}</div>
          )}
          {getContributions().map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-1 h-1 rounded ${getColor(day.count)}`}
                  title={`${day.count} solved problems on ${day.date}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center mt-4 space-x-2">
        <span className="text-sm text-gray-500">Less</span>
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
        <div className="w-4 h-4 bg-green-100 rounded"></div>
        <div className="w-4 h-4 bg-green-300 rounded"></div>
        <div className="w-4 h-4 bg-green-500 rounded"></div>
        <div className="w-4 h-4 bg-green-700 rounded"></div>
        <span className="text-sm text-gray-500">More</span>
      </div>
    </div>
  );
};

export default ContributionGraph;
