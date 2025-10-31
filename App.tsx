import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { TimeGrid } from './components/TimeGrid';
import { DailySummary } from './components/DailySummary';
import { ActivityModal } from './components/ActivityModal';
import { CategoryManager } from './components/CategoryManager';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Activity, Category } from './types';
import { DEFAULT_CATEGORIES } from './constants';
import { parse, format, startOfDay, addMinutes, differenceInMinutes } from 'date-fns';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [activities, setActivities] = useLocalStorage<Activity[]>('activities', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', DEFAULT_CATEGORIES);
  
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const dailyActivities = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return activities.filter(a => a.date === dateStr);
  }, [activities, selectedDate]);

  const handleSelectSlots = (slots: string[]) => {
    if (slots.length === 0) return;
    // Find if the first selected slot is part of an existing activity
    const firstSlot = slots.sort()[0];
    const existingActivity = dailyActivities.find(a => {
        const start = parse(a.startTime, 'HH:mm', selectedDate);
        const end = parse(a.endTime, 'HH:mm', selectedDate);
        const slotTime = parse(firstSlot, 'HH:mm', selectedDate);
        return slotTime >= start && slotTime < end;
    });

    if (existingActivity) {
        // If an existing activity is clicked, select all its slots for editing
        const activitySlots: string[] = [];
        let current = parse(existingActivity.startTime, 'HH:mm', selectedDate);
        const end = parse(existingActivity.endTime, 'HH:mm', selectedDate);
        while (current < end) {
            activitySlots.push(format(current, 'HH:mm'));
            current = addMinutes(current, 15);
        }
        setSelectedSlots(activitySlots);
        setEditingActivity(existingActivity);
    } else {
        // Otherwise, prepare for a new activity
        setSelectedSlots(slots);
        setEditingActivity(null);
    }
    setIsActivityModalOpen(true);
  };

  const handleCloseActivityModal = () => {
    setIsActivityModalOpen(false);
    setSelectedSlots([]);
    setEditingActivity(null);
  };

  const handleSaveActivity = (description: string, categoryId: string) => {
    if (selectedSlots.length === 0 || !categoryId) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const sortedSlots = selectedSlots.sort();
    const startTime = sortedSlots[0];
    const lastSlotTime = parse(sortedSlots[sortedSlots.length - 1], 'HH:mm', new Date());
    const endTime = format(addMinutes(lastSlotTime, 15), 'HH:mm');

    const newActivity: Activity = {
      id: editingActivity?.id || crypto.randomUUID(),
      date: dateStr,
      startTime,
      endTime,
      description,
      categoryId,
    };
    
    // Remove the old version of the activity if editing
    let tempActivities = editingActivity ? activities.filter(a => a.id !== editingActivity.id) : [...activities];

    // Remove any activities that conflict with the new time slot
    const updatedActivities = tempActivities.filter(a => {
        if (a.date !== dateStr) return true;
        return a.endTime <= newActivity.startTime || a.startTime >= newActivity.endTime;
    });

    setActivities([...updatedActivities, newActivity]);
    handleCloseActivityModal();
  };
  
  const handleDeleteActivity = () => {
    if (editingActivity) {
      setActivities(activities.filter(a => a.id !== editingActivity.id));
      handleCloseActivityModal();
    }
  };

  // Ensure there's always at least one category
  useEffect(() => {
    if (categories.length === 0) {
      setCategories(DEFAULT_CATEGORIES);
    }
  }, [categories, setCategories]);

  const exportToCSV = useCallback(() => {
    const headers = ['Date', 'Start Time', 'End Time', 'Duration (min)', 'Description', 'Category'];
    const rows = dailyActivities
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(activity => {
        const category = categories.find(c => c.id === activity.categoryId);
        const start = parse(activity.startTime, 'HH:mm', new Date());
        const end = parse(activity.endTime, 'HH:mm', new Date());
        const duration = differenceInMinutes(end, start);
        return [
          activity.date,
          activity.startTime,
          activity.endTime,
          duration,
          `"${activity.description.replace(/"/g, '""')}"`,
          category ? `"${category.name.replace(/"/g, '""')}"` : 'Uncategorized'
        ].join(',');
      });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `time_log_${format(selectedDate, 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [dailyActivities, categories, selectedDate]);

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TimeGrid
              activities={dailyActivities}
              categories={categories}
              onSelectSlots={handleSelectSlots}
              selectedDate={selectedDate}
            />
          </div>
          <div>
            <DailySummary
              activities={dailyActivities}
              categories={categories}
              onExport={exportToCSV}
            />
          </div>
        </div>
      </main>
      
      {isActivityModalOpen && (
        <ActivityModal
          isOpen={isActivityModalOpen}
          onClose={handleCloseActivityModal}
          onSave={handleSaveActivity}
          onDelete={handleDeleteActivity}
          categories={categories}
          selectedSlots={selectedSlots}
          editingActivity={editingActivity}
          selectedDate={selectedDate}
        />
      )}
      
      {isCategoryManagerOpen && (
        <CategoryManager
          isOpen={isCategoryManagerOpen}
          onClose={() => setIsCategoryManagerOpen(false)}
          categories={categories}
          setCategories={setCategories}
        />
      )}
    </div>
  );
};

export default App;