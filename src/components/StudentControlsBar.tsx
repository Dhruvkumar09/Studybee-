import React from 'react';
import { 
  Mic, 
  MicOff, 
  Hand, 
  Target, 
  MessageSquare, 
  Maximize2, 
  Sparkles, 
  LogOut,
  Volume2
} from 'lucide-react';
import type { Participant } from '../types';

interface StudentControlsBarProps {
  myParticipant?: Participant;
  isAudioMuted: boolean;
  canSpeak: boolean;
  isHandRaised: boolean;
  isFocusMode: boolean;
  isChatOpen: boolean;
  onToggleMic: () => void;
  onToggleHandRaise: () => void;
  onToggleFocusMode: () => void;
  onToggleChat: () => void;
  onOpenAI: () => void;
  onLeaveClassroom: () => void;
}

export const StudentControlsBar: React.FC<StudentControlsBarProps> = ({
  myParticipant,
  isAudioMuted,
  canSpeak,
  isHandRaised,
  isFocusMode,
  isChatOpen,
  onToggleMic,
  onToggleHandRaise,
  onToggleFocusMode,
  onToggleChat,
  onOpenAI,
  onLeaveClassroom
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/90 backdrop-blur-md rounded-2xl border border-zinc-800/80 shadow-2xl select-none">
      
      {/* Speaking Status Info */}
      <div className="flex items-center gap-2">
        {canSpeak ? (
          <button
            onClick={onToggleMic}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !isAudioMuted
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {!isAudioMuted ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-rose-400" />}
            <span>{!isAudioMuted ? 'Mic Live' : 'Unmute'}</span>
          </button>
        ) : (
          <button
            onClick={onToggleHandRaise}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isHandRaised
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-950/40 animate-pulse'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Hand className={`w-4 h-4 ${isHandRaised ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'}`} />
            <span>{isHandRaised ? 'Hand Raised (Waiting)' : 'Raise Hand to Speak'}</span>
          </button>
        )}
      </div>

      {/* Middle Interactive Shortcuts */}
      <div className="flex items-center gap-2">
        {/* Focus Mode */}
        <button
          onClick={onToggleFocusMode}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
            isFocusMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
          }`}
          title="Distraction-Free Focus Mode"
        >
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Focus Mode</span>
        </button>

        {/* AI Assistant */}
        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
          title="Ask AI Doubt Solver / Summary"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden sm:inline">Doubt Solver</span>
        </button>

        {/* Chat Toggle */}
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
            isChatOpen
              ? 'bg-indigo-950/60 text-indigo-200 border-indigo-500/40'
              : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Chat</span>
        </button>
      </div>

      {/* Leave Button */}
      <button
        onClick={onLeaveClassroom}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/30 text-xs font-medium transition-all cursor-pointer"
        title="Leave Classroom"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Leave</span>
      </button>

    </div>
  );
};
