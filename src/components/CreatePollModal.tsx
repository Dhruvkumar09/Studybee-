import React, { useState } from 'react';
import { BarChart3, X, Plus, Trash2 } from 'lucide-react';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (question: string, options: string[], durationSeconds: number) => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  isOpen,
  onClose,
  onCreatePoll
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['Option A: Completely clear', 'Option B: Needs one more example', 'Option C: Repeat derivation']);
  const [duration, setDuration] = useState(60);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (validOptions.length < 2) return;
    onCreatePoll(question.trim(), validOptions, duration);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Create Live Student Poll</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Poll Question</label>
            <input
              type="text"
              placeholder="e.g. Is the concept of Rotational Inertia clear?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Poll Options</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[i] = e.target.value;
                      setOptions(updated);
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200"
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 5 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Option
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Duration (Seconds)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value={30}>30 Seconds</option>
              <option value={60}>60 Seconds</option>
              <option value={120}>2 Minutes</option>
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-medium text-xs border border-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-950 transition-colors cursor-pointer"
            >
              Launch Poll Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
