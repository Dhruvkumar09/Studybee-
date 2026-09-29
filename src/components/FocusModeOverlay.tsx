import React, { useState, useEffect } from 'react';
import { Target, Play, Pause, RotateCcw, X, ShieldAlert, Sparkles } from 'lucide-react';

interface FocusModeOverlayProps {
  isOpen: boolean;
  onExit: () => void;
  classroomTitle: string;
}

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
  isOpen,
  onExit,
  classroomTitle
}) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); // 25 min default
  const [isRunning, setIsRunning] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isOpen && isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isRunning, secondsLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleAttemptExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    onExit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-6 md:p-10 select-none animate-in fade-in duration-300">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">
              StudyLive Deep Focus Mode
            </span>
            <span className="text-xs text-zinc-400 truncate max-w-xs">{classroomTitle}</span>
          </div>
        </div>

        {/* Lecture Lock Protected Exit Button */}
        <button
          onClick={handleAttemptExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Exit Focus</span>
        </button>
      </div>

      {/* Center Pomodoro / Lecture Immersion Timer */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        <div className="p-3 px-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-6 inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          Distractions Silenced • Eyes on the Board
        </div>

        <div className="text-7xl md:text-9xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_35px_rgba(245,158,11,0.2)] mb-8">
          {timeFormatted}
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause Timer' : 'Resume Timer'}</span>
          </button>

          <button
            onClick={() => {
              setSecondsLeft(25 * 60);
              setIsRunning(false);
            }}
            className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            title="Reset to 25 mins"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Affirmation Card */}
        <div className="mt-12 max-w-md p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 text-xs leading-relaxed">
          💡 <span className="font-semibold text-zinc-200">Lecture Lock Active:</span> Notifications and clutter are suppressed. Dedicate this block of time entirely to mastering concepts.
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-[11px] text-zinc-600 font-mono">
        StudyLive Focus Guard • Press 'Esc' or click Exit Focus to return
      </div>

      {/* Exit Confirmation Dialog (Lecture Lock) */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Leave Focus Mode?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to break focus? Re-entering study flow takes an average of 15 minutes.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer"
              >
                Keep Studying
              </button>
              <button
                onClick={confirmExit}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs cursor-pointer"
              >
                Exit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
