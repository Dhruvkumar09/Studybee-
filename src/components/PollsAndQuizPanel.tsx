import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Plus, 
  Trophy,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Poll, Quiz, UserRole } from '../types';

interface PollsAndQuizPanelProps {
  polls: Poll[];
  quizzes: Quiz[];
  currentUserUid: string;
  currentUserRole: UserRole;
  onVotePoll: (pollId: string, optionId: string) => void;
  onSubmitQuizAnswer: (quizId: string, questionIndex: number, optionIndex: number) => void;
  onCreatePollModal: () => void;
  onCreateQuizModal: () => void;
}

export const PollsAndQuizPanel: React.FC<PollsAndQuizPanelProps> = ({
  polls,
  quizzes,
  currentUserUid,
  currentUserRole,
  onVotePoll,
  onSubmitQuizAnswer,
  onCreatePollModal,
  onCreateQuizModal
}) => {
  const [activeTab, setActiveTab] = useState<'polls' | 'quizzes'>('polls');
  const isHost = currentUserRole === 'HOST' || currentUserRole === 'CO_HOST';

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden select-none">
      
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('polls')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'polls'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Polls ({polls.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'quizzes'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Quizzes ({quizzes.length})</span>
          </button>
        </div>

        {isHost && (
          <button
            onClick={activeTab === 'polls' ? onCreatePollModal : onCreateQuizModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {activeTab === 'polls' ? (
          polls.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <BarChart2 className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-xs font-medium text-zinc-400">No active polls right now</p>
              <p className="text-[11px] text-zinc-600 mt-1">Host can launch quick polls to gauge class understanding.</p>
              {isHost && (
                <button
                  onClick={onCreatePollModal}
                  className="mt-4 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md"
                >
                  Create First Poll
                </button>
              )}
            </div>
          ) : (
            polls.map(poll => {
              const myVoteOptionId = poll.userVotes[currentUserUid];
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votesCount, 0);

              return (
                <div key={poll.id} className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-100 leading-snug">
                      {poll.question}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 whitespace-nowrap">
                      {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {poll.options.map(option => {
                      const isSelected = myVoteOptionId === option.id;
                      const percentage = totalVotes > 0 ? Math.round((option.votesCount / totalVotes) * 100) : 0;

                      return (
                        <button
                          key={option.id}
                          disabled={!!myVoteOptionId || !poll.isActive}
                          onClick={() => {
                            onVotePoll(poll.id, option.id);
                            triggerCelebration();
                          }}
                          className={`relative w-full text-left p-3 rounded-xl border text-xs font-medium transition-all overflow-hidden cursor-pointer ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200'
                              : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700'
                          } disabled:cursor-default`}
                        >
                          {/* Percentage Progress Bar Background */}
                          <div
                            className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
                              isSelected ? 'bg-indigo-600/30' : 'bg-zinc-800/40'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />

                          <div className="relative flex items-center justify-between z-10">
                            <span className="truncate pr-2">{option.text}</span>
                            <span className="font-mono text-[11px] text-zinc-400">
                              {percentage}% ({option.votesCount})
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {myVoteOptionId && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Vote recorded. Live results updated.
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          quizzes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <HelpCircle className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-xs font-medium text-zinc-400">No quizzes active</p>
              <p className="text-[11px] text-zinc-600 mt-1">Host can generate instant AI concept tests via Gemini.</p>
              {isHost && (
                <button
                  onClick={onCreateQuizModal}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate AI Quiz
                </button>
              )}
            </div>
          ) : (
            quizzes.map(quiz => {
              const userAnswers = quiz.userAnswers[currentUserUid] || [];
              const score = quiz.scores?.[currentUserUid] ?? 0;

              return (
                <div key={quiz.id} className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100">{quiz.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{quiz.questions.length} Questions</p>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-semibold font-mono">
                      <Trophy className="w-3.5 h-3.5" />
                      Score: {score}/{quiz.questions.length}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {quiz.questions.map((q, qIdx) => {
                      const answeredIndex = userAnswers[qIdx];
                      const isAnswered = answeredIndex !== undefined;

                      return (
                        <div key={q.id} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                            Question {qIdx + 1}
                          </span>
                          <p className="text-xs font-medium text-zinc-200 leading-snug">
                            {q.question}
                          </p>

                          <div className="space-y-1.5 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = answeredIndex === optIdx;
                              const isCorrect = q.correctIndex === optIdx;

                              let btnStyle = 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700';
                              if (isAnswered) {
                                if (isSelected && isCorrect) {
                                  btnStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-semibold';
                                } else if (isSelected && !isCorrect) {
                                  btnStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
                                } else if (isCorrect) {
                                  btnStyle = 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={isAnswered}
                                  onClick={() => {
                                    onSubmitQuizAnswer(quiz.id, qIdx, optIdx);
                                    if (optIdx === q.correctIndex) triggerCelebration();
                                  }}
                                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs text-left transition-all cursor-pointer ${btnStyle} disabled:cursor-default`}
                                >
                                  <span>{opt}</span>
                                  {isAnswered && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-2 shrink-0" />}
                                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-400 ml-2 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          {isAnswered && (
                            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400">
                              <span className="font-semibold text-zinc-300">Explanation: </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

    </div>
  );
};
