import React, { useMemo, useState, useEffect } from 'react';
import { Activity, Category } from '../types';
import { parse, differenceInMinutes } from 'date-fns';
import { ExportIcon, ClockIcon, ChevronDownIcon, SparklesIcon } from './icons/Icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis } from 'recharts';


interface DailySummaryProps {
  activities: Activity[];
  categories: Category[];
  onExport: (range: 'day' | 'week' | 'month') => void;
}

export const DailySummary: React.FC<DailySummaryProps> = ({ activities, categories, onExport }) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setIsExportMenuOpen(false);
    if (isExportMenuOpen) {
      window.addEventListener('click', closeMenu);
    }
    return () => window.removeEventListener('click', closeMenu);
  }, [isExportMenuOpen]);

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

  const energyData = useMemo(() => {
    return activities
      .filter(a => typeof a.energyLevel === 'number')
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(a => ({
        time: a.startTime.slice(0, 5), // Format as HH:mm
        level: a.energyLevel,
        description: a.description
      }));
  }, [activities]);

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
        <div className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm p-2 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full" style={{backgroundColor: data.color}}></div>
            <p className="font-semibold text-sm">{`${data.name}: ${hours > 0 ? `${hours}h ` : ''}${minutes}m`}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const EnergyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm p-2 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{`Energy: ${data.level}`}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">{`${label} - ${data.description}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Daily Summary</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total time logged today</p>
            </div>
             <div className="relative inline-block text-left" onClick={e => e.stopPropagation()}>
                <div>
                    <button
                    type="button"
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                    <ExportIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDownIcon className="w-4 h-4 -mr-1"/>
                    </button>
                </div>
                {isExportMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                        <a href="#" onClick={(e) => { e.preventDefault(); onExport('day'); setIsExportMenuOpen(false); }} className="text-slate-700 dark:text-slate-200 block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600">Today</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onExport('week'); setIsExportMenuOpen(false); }} className="text-slate-700 dark:text-slate-200 block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600">This Week</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onExport('month'); setIsExportMenuOpen(false); }} className="text-slate-700 dark:text-slate-200 block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600">This Month</a>
                    </div>
                    </div>
                )}
            </div>
        </div>
        
        <div className="flex items-center space-x-2 text-3xl font-bold text-slate-900 dark:text-white">
          <ClockIcon className="w-7 h-7 text-blue-500" />
          <span>{totalHours}<span className="text-xl font-medium text-slate-500 dark:text-slate-400">h</span> {totalMins}<span className="text-xl font-medium text-slate-500 dark:text-slate-400">m</span></span>
        </div>
        
        <div className="mt-6">
            <h4 className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400 tracking-wider">Timeline</h4>
            <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mt-2">
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
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
            <SparklesIcon className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Energy Analysis</h3>
        </div>
        {energyData.length > 1 ? (
            <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
                <LineChart data={energyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="time" stroke="rgba(156, 163, 175, 0.7)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis domain={[1, 10]} allowDecimals={false} stroke="rgba(156, 163, 175, 0.7)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<EnergyTooltip />} />
                    <Line type="monotone" dataKey="level" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, className: 'stroke-amber-500 fill-white dark:fill-slate-800' }} activeDot={{ r: 6, className: 'stroke-amber-400' }} />
                </LineChart>
            </ResponsiveContainer>
            </div>
        ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-10">Log more activities with energy levels to see your daily trend.</p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Category Breakdown</h3>
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
          <p className="text-center text-slate-500 dark:text-slate-400 py-10">Log an activity to see your breakdown.</p>
        )}
      </div>
    </div>
  );
};