import React, { useState } from 'react';
import { HelpCircle, X, Sparkles, Loader2, Check } from 'lucide-react';
import { aiService } from '../services/aiService';
import type { QuizQuestion } from '../types';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroomTitle: string;
  onCreateQuiz: (title: string, questions: QuizQuestion[]) => void;
}

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  isOpen,
  onClose,
  classroomTitle,
  onCreateQuiz
}) => {
  const [topic, setTopic] = useState(classroomTitle || 'Physics Mechanics');
  const [mode, setMode] = useState<'General' | 'JEE' | 'NEET' | 'NCERT'>('JEE');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerateAIQuiz = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const data = await aiService.generateQuiz(topic, mode, 3);
      if (data && data.questions && data.questions.length > 0) {
        onCreateQuiz(`${mode}: ${topic} Concept Check`, data.questions);
        onClose();
      } else {
        setError('No questions returned by AI. Please retry.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualQuickQuiz = () => {
    const defaultQuestions: QuizQuestion[] = [
      {
        id: 'q-manual-1',
        question: `For the lecture on ${topic}, what occurs if net torque about the center of mass is zero?`,
        options: [
          'Angular momentum is conserved',
          'Linear momentum must be zero',
          'System kinetic energy becomes zero',
          'Angular acceleration increases uniformly'
        ],
        correctIndex: 0,
        explanation: 'When net external torque is zero, the time derivative of angular momentum is zero (dL/dt = 0).'
      },
      {
        id: 'q-manual-2',
        question: 'Which of the following describes the SI unit of moment of inertia?',
        options: [
          'kg · m²',
          'N · m / s',
          'kg / m²',
          'Joule · s'
        ],
        correctIndex: 0,
        explanation: 'Moment of inertia is defined as I = ∫ r² dm, giving SI units of kilogram meters squared (kg·m²).'
      }
    ];

    onCreateQuiz(`Quick Check: ${topic}`, defaultQuestions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Generate Live Class Quiz</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Lecture Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Rotational Dynamics & Inertia"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Syllabus / Mode</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['JEE', 'NEET', 'NCERT', 'General'] as const).map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold cursor-pointer ${
                    mode === item
                      ? 'bg-cyan-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleGenerateAIQuiz}
              disabled={isGenerating || !topic.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGenerating ? 'AI Generating Questions...' : 'Generate 3 AI Questions (Gemini)'}</span>
            </button>

            <button
              onClick={handleManualQuickQuiz}
              disabled={isGenerating}
              className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs border border-zinc-800 transition-colors cursor-pointer"
            >
              Use Standard Syllabus Preset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
