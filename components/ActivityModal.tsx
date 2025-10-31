import React, { useState, useEffect } from 'react';
import { Activity, Category } from '../types';
import { format, parse, addMinutes, differenceInMinutes } from 'date-fns';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (description: string, categoryId: string) => void;
  onDelete: () => void;
  categories: Category[];
  selectedSlots: string[];
  editingActivity: Activity | null;
  selectedDate: Date;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose, onSave, onDelete, categories, selectedSlots, editingActivity, selectedDate }) => {
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (editingActivity) {
      setDescription(editingActivity.description);
      setCategoryId(editingActivity.categoryId);
    } else {
      setDescription('');
      setCategoryId(categories[0]?.id || '');
    }
  }, [editingActivity, categories, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
        alert("Please select a category.");
        return;
    }
    onSave(description, categoryId);
  };
  
  const sortedSlots = [...selectedSlots].sort();
  const startTime = sortedSlots.length > 0 ? format(parse(sortedSlots[0], 'HH:mm', selectedDate), 'h:mm a') : '';
  const endTime = sortedSlots.length > 0 ? format(addMinutes(parse(sortedSlots[sortedSlots.length - 1], 'HH:mm', selectedDate), 15), 'h:mm a') : '';
  const duration = sortedSlots.length > 0 ? differenceInMinutes(parse(endTime, 'h:mm a', selectedDate), parse(startTime, 'h:mm a', selectedDate)) : 0;
  const durationText = duration >= 60 ? `${Math.floor(duration/60)}h ${duration % 60}m` : `${duration}m`;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSave}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{editingActivity ? 'Edit Activity' : 'Add Activity'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{`${startTime} - ${endTime} (${durationText})`}</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Project meeting"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-between items-center rounded-b-xl">
             <div>
              {editingActivity && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors"
              >
                {editingActivity ? 'Update Activity' : 'Add Activity'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};