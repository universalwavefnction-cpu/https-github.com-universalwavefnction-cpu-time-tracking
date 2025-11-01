import React from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, TagIcon } from './icons/Icons';

interface HeaderProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onOpenCategoryManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({ selectedDate, setSelectedDate, onOpenCategoryManager }) => {
  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  return (
    <header className="bg-white/80 dark:bg-slate-800/80 shadow-sm sticky top-0 z-20 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
             <h1 className="text-xl font-bold bg-gradient-to-r from-sky-500 to-indigo-500 dark:from-sky-400 dark:to-indigo-400 text-transparent bg-clip-text">
              Zenith Time
            </h1>
          </div>
          <div className="flex items-center justify-center flex-1 space-x-2">
            <button onClick={handlePrevDay} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold text-center">
                {format(selectedDate, 'MMMM d')}
              </h2>
               <p className="text-xs text-slate-500 dark:text-slate-400">{format(selectedDate, 'EEEE')}</p>
            </div>
            <button onClick={handleNextDay} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ChevronRightIcon className="w-5 h-5" />
            </button>
            <button onClick={handleToday} className="ml-4 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
               Today
            </button>
          </div>
          <div className="flex items-center">
            <button onClick={onOpenCategoryManager} className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors">
              <TagIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="hidden md:inline">Categories</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
