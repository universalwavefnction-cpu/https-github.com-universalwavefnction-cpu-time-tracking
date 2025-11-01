import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Category } from '../types';
import { TIME_SLOTS } from '../constants';
import { parse, format, addMinutes } from 'date-fns';

interface TimeGridProps {
  activities: Activity[];
  categories: Category[];
  onSelectSlots: (slots: string[]) => void;
  selectedDate: Date;
}

export const TimeGrid: React.FC<TimeGridProps> = ({ activities, categories, onSelectSlots, selectedDate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartSlot, setDragStartSlot] = useState<string | null>(null);
  const [currentSelection, setCurrentSelection] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

  const activitiesMap = React.useMemo(() => {
    const map = new Map<string, { activity: Activity; category?: Category }>();
    activities.forEach(activity => {
      const category = categories.find(c => c.id === activity.categoryId);
      let current = parse(activity.startTime, 'HH:mm', selectedDate);
      const end = parse(activity.endTime, 'HH:mm', selectedDate);
      while (current < end) {
        const timeSlot = format(current, 'HH:mm');
        map.set(timeSlot, { activity, category });
        current = addMinutes(current, 15);
      }
    });
    return map;
  }, [activities, categories, selectedDate]);

  const handleMouseDown = (time: string, isActivity: boolean) => {
    if (isActivity) {
      onSelectSlots([time]); // Let parent component handle activity selection
    } else {
      setIsDragging(true);
      setDragStartSlot(time);
      setCurrentSelection(new Set([time]));
    }
  };

  const handleMouseEnter = (time: string) => {
    if (isDragging && dragStartSlot) {
        const allSlots = TIME_SLOTS;
        const startIndex = allSlots.indexOf(dragStartSlot);
        const currentIndex = allSlots.indexOf(time);
        const newSelection = new Set<string>();
        const [start, end] = [startIndex, currentIndex].sort((a,b)=>a-b);
        for(let i=start; i<=end; i++){
            // Prevent selecting over existing activities
            if (!activitiesMap.has(allSlots[i])) {
              newSelection.add(allSlots[i]);
            }
        }
        setCurrentSelection(newSelection);
    }
  };
  
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (currentSelection.size > 0) {
        onSelectSlots(Array.from(currentSelection));
      }
      setCurrentSelection(new Set());
      setDragStartSlot(null);
    }
  }, [isDragging, currentSelection, onSelectSlots]);
  
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);


  return (
    <div ref={gridRef} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg select-none">
      <div className="relative">
        {TIME_SLOTS.map((time) => (
          <div key={time} className="relative flex items-center h-10 border-b border-slate-100 dark:border-slate-700/50">
            <div className="w-16 text-xs text-slate-400 dark:text-slate-500 pr-2 text-right shrink-0">
              {time.endsWith(':00') ? format(parse(time, 'HH:mm', new Date()), 'h a') : ''}
            </div>
            <div
              data-time={time}
              onMouseDown={() => handleMouseDown(time, false)}
              onMouseEnter={() => handleMouseEnter(time)}
              className="flex-1 h-full border-l border-slate-100 dark:border-slate-700/50"
            />
          </div>
        ))}
        {activities.map(activity => {
            const category = categories.find(c => c.id === activity.categoryId);
            const start = parse(activity.startTime, 'HH:mm', selectedDate);
            const end = parse(activity.endTime, 'HH:mm', selectedDate);
            const duration = (end.getTime() - start.getTime()) / 60000;
            const topOffset = TIME_SLOTS.indexOf(activity.startTime) * 2.5; // h-10 = 2.5rem
            const height = (duration / 15) * 2.5;

            return (
                 <div
                    key={activity.id}
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(activity.startTime, true); }}
                    className="absolute left-16 right-0 p-2 text-white rounded-lg cursor-pointer transition-all duration-200 ease-out hover:opacity-90"
                    style={{
                        top: `${topOffset}rem`,
                        height: `${height}rem`,
                        backgroundColor: category?.color || '#64748b',
                    }}
                 >
                    <p className="text-xs font-bold truncate">{activity.description}</p>
                    <p className="text-[10px] opacity-80">{category?.name || 'Uncategorized'}</p>
                 </div>
            )
        })}
        {Array.from(currentSelection).map(time => {
            const topOffset = TIME_SLOTS.indexOf(time) * 2.5;
            return (
                <div
                    key={`selection-${time}`}
                    className="absolute left-16 right-0 bg-blue-500/30 dark:bg-blue-400/30 rounded-lg pointer-events-none"
                    style={{
                        top: `${topOffset}rem`,
                        height: '2.5rem'
                    }}
                />
            )
        })}
      </div>
    </div>
  );
};
