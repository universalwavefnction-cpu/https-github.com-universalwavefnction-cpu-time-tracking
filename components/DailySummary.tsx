import React, { useMemo } from 'react';
import { Activity, Category } from '../types';
import { parse, differenceInMinutes } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ExportIcon, ClockIcon } from './icons/Icons';

// Recharts is loaded from a script tag, declare it for TypeScript
declare var Recharts: any;

interface DailySummaryProps {
  activities: Activity[];
  categories: Category[];
  onExport: () => void;
}

export const DailySummary: React.FC<DailySummaryProps> = ({ activities, categories, onExport }) => {
  const summaryData = useMemo(() => {
    const categoryMap = new Map<string, { duration: number; name: string; color: string }>();
    categories.forEach(c => categoryMap.set(c.id, { duration: 0, name: c.name, color: c.color }));

    let totalMinutes = 0;
    activities.forEach(activity => {
      const start = parse(activity.startTime, 'HH:mm', new Date());
      const end = parse(activity.endTime, 'HH:mm', new Date());
      const duration = differenceInMinutes(end, start);
      totalMinutes += duration;
      
      const categorySummary = categoryMap.get(activity.categoryId);
      if (categorySummary) {
        categorySummary.duration += duration;
      }
    });

    const chartData = Array.from(categoryMap.values())
      .filter(d => d.duration > 0)
      .map(d => ({ name: d.name, value: d.duration, color: d.color }));
      
    return { chartData, totalMinutes };
  }, [activities, categories]);

  const totalHours = Math.floor(summaryData.totalMinutes / 60);
  const totalMins = summaryData.totalMinutes % 60;

  const sortedActivities = useMemo(() => {
      return [...activities].sort((a,b) => a.startTime.localeCompare(b.startTime));
  }, [activities]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hours = Math.floor(data.value / 60);
      const minutes = data.value % 60;
      return (
        <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm p-2 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full" style={{backgroundColor: data.color}}></div>
            <p className="font-semibold text-sm">{`${data.name}: ${hours > 0 ? `${hours}h ` : ''}${minutes}m`}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Daily Summary</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total time logged today</p>
            </div>
             <button
              onClick={onExport}
              className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
             <ExportIcon className="w-4 h-4" />
             <span className="hidden sm:inline">Export</span>
            </button>
        </div>
        
        <div className="flex items-center space-x-2 text-3xl font-bold text-gray-900 dark:text-white">
          <ClockIcon className="w-7 h-7 text-blue-500" />
          <span>{totalHours}<span className="text-xl font-medium text-gray-500 dark:text-gray-400">h</span> {totalMins}<span className="text-xl font-medium text-gray-500 dark:text-gray-400">m</span></span>
        </div>
        
        <div className="mt-6">
            <h4 className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider">Timeline</h4>
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-2">
                {sortedActivities.map(activity => {
                    const category = categories.find(c => c.id === activity.categoryId);
                    const start = parse(activity.startTime, 'HH:mm', new Date(0,0,0,6,0,0)); // Start of day is 6am
                    const activityStart = parse(activity.startTime, 'HH:mm', new Date(0,0,0,0,0,0));
                    const startMinutes = differenceInMinutes(activityStart, start);
                    
                    const duration = differenceInMinutes(parse(activity.endTime, 'HH:mm', new Date()), parse(activity.startTime, 'HH:mm', new Date()));
                    const totalDayMinutes = (23 - 6) * 60;
                    
                    const width = (duration / totalDayMinutes) * 100;
                    const left = (startMinutes / totalDayMinutes) * 100;

                    return (
                        <div key={activity.id} style={{ left: `${left}%`, width: `${width}%`, backgroundColor: category?.color }} className="absolute h-4 rounded-full" title={`${activity.description}: ${duration} min`}></div>
                    )
                })}
            </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Category Breakdown</h3>
        {summaryData.chartData.length > 0 ? (
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={summaryData.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} cornerRadius={5}>
                  {summaryData.chartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">Log an activity to see your breakdown.</p>
        )}
      </div>
    </div>
  );
};