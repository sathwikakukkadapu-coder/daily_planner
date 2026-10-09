import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const COMMON_EMOJIS = [
  '⏰', '💪', '📖', '📝', '💰', '🎯', '🍷', '🌿', '📒', '🚿',
  '🏃‍♂️', '💻', '💧', '🧘', '🥗', '🌙', '🎸', '🎨', '🍎', '🚴',
  '🧹', '🚶', '☕', '💊', '🧗', '🏊', '🧠', '🎧', '🏋️', '✨'
];

const CATEGORIES = [
  'Morning', 'Health', 'Fitness', 'Mindset', 'Productivity', 'Finance', 'Focus', 'Sleep', 'Hobby', 'General'
];

export default function HabitModal({
  isOpen,
  onClose,
  onSaveHabit,
  habitToEdit = null,
  otherUserName = 'Friend',
}) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [category, setCategory] = useState('General');
  const [copyToOtherUser, setCopyToOtherUser] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title || '');
      setEmoji(habitToEdit.emoji || '✨');
      setCategory(habitToEdit.category || 'General');
      setCopyToOtherUser(false);
    } else {
      setTitle('');
      setEmoji('⏰');
      setCategory('Morning');
      setCopyToOtherUser(false);
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveHabit({
      id: habitToEdit?.id,
      title: title.trim(),
      emoji,
      category,
      copyToOtherUser: !habitToEdit && copyToOtherUser,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <h3 className="font-bold text-slate-800 text-sm">
            {habitToEdit ? 'Edit Habit' : 'Add New Habit'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Title Input */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Habit Name</label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 15 pages, 10k Steps, Gym..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Icon</label>
            <div className="grid grid-cols-6 gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
              {COMMON_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`text-lg p-1.5 rounded-lg text-center transition ${
                    emoji === em ? 'bg-emerald-100 ring-2 ring-emerald-500 scale-110' : 'hover:bg-slate-200/60'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Also copy to other user checkbox (for new habit) */}
          {!habitToEdit && (
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={copyToOtherUser}
                  onChange={(e) => setCopyToOtherUser(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Also add to {otherUserName}'s list as a shared challenge</span>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            >
              {habitToEdit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
