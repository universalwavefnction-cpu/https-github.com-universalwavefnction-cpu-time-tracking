import React, { useState } from 'react';
import { Category } from '../types';
import { PlusIcon, TrashIcon, CheckIcon, XIcon, PencilIcon } from './icons/Icons';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose, categories, setCategories }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#2563eb');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryColor, setEditingCategoryColor] = useState('');

  if (!isOpen) return null;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim() === '') return;
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryColor('#2563eb');
  };

  const handleDeleteCategory = (id: string) => {
    if(categories.length > 1) {
        // In a real app, you'd handle re-assigning activities.
        setCategories(categories.filter(c => c.id !== id));
    } else {
        alert("You must have at least one category.");
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setEditingCategoryColor(category.color);
  };
  
  const cancelEditing = () => {
    setEditingCategoryId(null);
  };

  const handleUpdateCategory = () => {
    if (editingCategoryId && editingCategoryName.trim() !== '') {
        setCategories(categories.map(c => 
            c.id === editingCategoryId 
            ? { ...c, name: editingCategoryName.trim(), color: editingCategoryColor } 
            : c
        ));
        setEditingCategoryId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Manage Categories</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 -mr-2">
            {categories.map(cat => (
              <div key={cat.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50">
                {editingCategoryId === cat.id ? (
                  <>
                    <input type="color" value={editingCategoryColor} onChange={e => setEditingCategoryColor(e.target.value)} className="w-8 h-8 rounded-md border-none cursor-pointer bg-transparent" />
                    <input type="text" value={editingCategoryName} onChange={e => setEditingCategoryName(e.target.value)} className="mx-2 flex-grow px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" autoFocus/>
                    <button onClick={handleUpdateCategory} className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full"><CheckIcon className="w-5 h-5"/></button>
                    <button onClick={cancelEditing} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><XIcon className="w-5 h-5"/></button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditing(cat)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors">
                            <PencilIcon className="w-4 h-4"/>
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                            <TrashIcon className="w-4 h-4"/>
                        </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleAddCategory} className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Add New Category</h3>
          <div className="flex items-center space-x-2">
            <input type="color" value={newCategoryColor} onChange={e => setNewCategoryColor(e.target.value)} className="w-10 h-10 p-0 border-none rounded-lg cursor-pointer bg-transparent" />
            <input
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="Category Name"
              className="flex-grow px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end rounded-b-xl border-t border-slate-200 dark:border-slate-700">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};
