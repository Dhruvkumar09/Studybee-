import React, { useState } from 'react';
import { Sparkles, X, MessageSquare, BookOpen, Sigma, Send, Loader2, Copy, Check } from 'lucide-react';
import { aiService } from '../services/aiService';

interface AIStudyAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroomTitle: string;
  subject: string;
}

export const AIStudyAssistantModal: React.FC<AIStudyAssistantModalProps> = ({
  isOpen,
  onClose,
  classroomTitle,
  subject
}) => {
  const [activeTab, setActiveTab] = useState<'doubt' | 'summary' | 'formulas'>('doubt');
  const [question, setQuestion] = useState('');
  const [doubtResponse, setDoubtResponse] = useState('');
  const [summaryResponse, setSummaryResponse] = useState('');
  const [formulasResponse, setFormulasResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'JEE' | 'NEET' | 'NCERT'>('JEE');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsLoading(true);
    try {
      const res = await aiService.solveDoubt(question, `${classroomTitle} (${subject})`);
      setDoubtResponse(res);
    } catch (err: any) {
      setDoubtResponse('Error solving doubt: ' + (err?.message || 'Server error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    try {
      const res = await aiService.summarizeLecture(classroomTitle, `Subject: ${subject}. Real-time lecture notes.`);
      setSummaryResponse(res);
    } catch (err: any) {
      setSummaryResponse('Error generating summary: ' + (err?.message || 'Server error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractFormulas = async () => {
    setIsLoading(true);
    try {
      const res = await aiService.extractFormulas(classroomTitle, mode);
      setFormulasResponse(res);
    } catch (err: any) {
      setFormulasResponse('Error extracting formulas: ' + (err?.message || 'Server error'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                StudyLive AI Study Engine
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-normal">
                  Gemini Flash 2.5
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Classroom: {classroomTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-3 px-6 border-b border-zinc-800/80 bg-zinc-950">
          <button
            onClick={() => setActiveTab('doubt')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'doubt'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Instant Doubt Solver</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('summary');
              if (!summaryResponse) handleGenerateSummary();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lecture Summary</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('formulas');
              if (!formulasResponse) handleExtractFormulas();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'formulas'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sigma className="w-3.5 h-3.5" />
            <span>Formula Sheet</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'doubt' && (
            <div className="space-y-4">
              <form onSubmit={handleAskDoubt} className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Ask your doubt related to this lecture:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Why is moment of inertia about center of mass always minimum?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !question.trim()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Solve</span>
                  </button>
                </div>
              </form>

              {doubtResponse && (
                <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                    <span className="font-semibold text-cyan-400">AI Teacher Resolution</span>
                    <button
                      onClick={() => copyToClipboard(doubtResponse)}
                      className="flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    {doubtResponse}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Synthesizes lecture transcript and key concepts:</span>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 cursor-pointer flex items-center gap-1.5"
                >
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Regenerate
                </button>
              </div>

              {isLoading && !summaryResponse ? (
                <div className="p-8 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  <p className="text-xs">Analyzing lecture concepts & extracting key notes...</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                    <span className="font-semibold text-cyan-400">Concise Revision Points</span>
                    <button
                      onClick={() => copyToClipboard(summaryResponse)}
                      className="flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Notes</span>
                    </button>
                  </div>
                  <div className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    {summaryResponse}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'formulas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Exam Target:</span>
                  {(['JEE', 'NEET', 'NCERT'] as const).map(target => (
                    <button
                      key={target}
                      onClick={() => setMode(target)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        mode === target 
                          ? 'bg-cyan-600 text-white' 
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {target}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleExtractFormulas}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 cursor-pointer flex items-center gap-1.5"
                >
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Extract
                </button>
              </div>

              {isLoading && !formulasResponse ? (
                <div className="p-8 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  <p className="text-xs">Extracting {mode} syllabus formulas and relations...</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                    <span className="font-semibold text-cyan-400">{mode} Formula Cheat Sheet</span>
                    <button
                      onClick={() => copyToClipboard(formulasResponse)}
                      className="flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Formulas</span>
                    </button>
                  </div>
                  <div className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed font-mono">
                    {formulasResponse}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
