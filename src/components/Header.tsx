import React from 'react';
import { 
  Tv, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  User as UserIcon, 
  Copy, 
  Check, 
  Activity, 
  Sparkles, 
  Target,
  LogOut
} from 'lucide-react';
import type { Classroom, UserProfile, UserRole } from '../types';

interface HeaderProps {
  classroom: Classroom;
  user: UserProfile;
  connectionStatus: {
    isConnected: boolean;
    status: string;
    quality: 'excellent' | 'good' | 'unstable' | 'poor';
    pingMs: number;
  };
  onOpenDiagnostics: () => void;
  onOpenAI: () => void;
  onToggleFocusMode: () => void;
  onLeaveClassroom: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  classroom,
  user,
  connectionStatus,
  onOpenDiagnostics,
  onOpenAI,
  onToggleFocusMode,
  onLeaveClassroom
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(classroom.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getQualityColor = () => {
    if (!connectionStatus.isConnected) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    switch (connectionStatus.quality) {
      case 'excellent': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'good': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'unstable': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'poor': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'HOST':
      case 'OWNER':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">HOST</span>;
      case 'CO_HOST':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">CO-HOST</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-zinc-800 text-zinc-400 border border-zinc-700">STUDENT</span>;
    }
  };

  return (
    <header className="h-16 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-6 flex items-center justify-between select-none z-30 sticky top-0">
      {/* Brand & Classroom Meta */}
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white hidden sm:inline">
            Study<span className="text-cyan-400">Live</span>
          </span>
        </div>

        <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-100 truncate max-w-[180px] md:max-w-xs">
              {classroom.title}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>{classroom.subject}</span>
            <span>•</span>
            <button 
              onClick={copyRoomId}
              className="inline-flex items-center gap-1 hover:text-zinc-200 transition-colors font-mono cursor-pointer"
              title="Click to copy Room Code"
            >
              ID: {classroom.id}
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Action Controls & User Meta */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Connection Quality Pill */}
        <button
          onClick={onOpenDiagnostics}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all ${getQualityColor()}`}
          title="Click for Connection Diagnostics"
        >
          {connectionStatus.isConnected ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          )}
          <span className="hidden md:inline font-mono">{connectionStatus.pingMs}ms</span>
          <span className="text-[11px] capitalize">{connectionStatus.status}</span>
        </button>

        {/* AI Study Tools */}
        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-indigo-950"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
          <span className="hidden sm:inline">AI Study</span>
        </button>

        {/* Focus Mode */}
        <button
          onClick={onToggleFocusMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-medium transition-all cursor-pointer"
          title="Toggle Distraction-Free Focus Mode"
        >
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Focus</span>
        </button>

        {/* User Role Badge & Name */}
        <div className="flex items-center gap-2 pl-1 border-l border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300">
            {user.displayName.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-medium text-zinc-200 leading-tight truncate max-w-[100px]">
              {user.displayName}
            </span>
            {getRoleBadge(user.role)}
          </div>
        </div>

        {/* Leave Classroom */}
        <button
          onClick={onLeaveClassroom}
          className="p-2 rounded-lg bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/30 transition-all cursor-pointer"
          title="Leave Lecture"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
