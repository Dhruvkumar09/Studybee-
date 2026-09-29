import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Cast, 
  Square, 
  VolumeX, 
  Lock, 
  Unlock, 
  MessageSquare, 
  MessageSquareOff, 
  Flame, 
  BarChart3, 
  FileQuestion, 
  Users, 
  ShieldCheck, 
  Check, 
  X, 
  AlertCircle,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import type { Classroom, Participant } from '../types';

interface HostControlsPanelProps {
  classroom: Classroom;
  participants: Participant[];
  isAudioMuted: boolean;
  isSharingScreen: boolean;
  isHostVerified: boolean;
  audioLevel: number;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onMuteAll: () => void;
  onToggleLock: () => void;
  onToggleChat: () => void;
  onSendAttentionAlert: (title: string, message: string) => void;
  onApproveSpeaking: (uid: string, approve: boolean) => void;
  onOpenPollModal: () => void;
  onOpenQuizModal: () => void;
  onOpenAttendanceModal: () => void;
  onVerifyHostCode: (code: string) => Promise<boolean>;
}

export const HostControlsPanel: React.FC<HostControlsPanelProps> = ({
  classroom,
  participants,
  isAudioMuted,
  isSharingScreen,
  isHostVerified,
  audioLevel,
  onToggleAudio,
  onToggleScreenShare,
  onMuteAll,
  onToggleLock,
  onToggleChat,
  onSendAttentionAlert,
  onApproveSpeaking,
  onOpenPollModal,
  onOpenQuizModal,
  onOpenAttendanceModal,
  onVerifyHostCode
}) => {
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('JAAGTE RAHO 🔥');
  const [customAlertMsg, setCustomAlertMsg] = useState('Prof. Sharma asks: Are you awake and following?');
  const [showCustomAlertInput, setShowCustomAlertInput] = useState(false);

  const handsRaised = participants.filter(p => p.isHandRaised);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCodeInput.trim()) return;
    setIsVerifying(true);
    setVerifyError('');
    try {
      const ok = await onVerifyHostCode(accessCodeInput.trim());
      if (!ok) {
        setVerifyError('Invalid Host Access Code. Try 13189 for development.');
      }
    } catch {
      setVerifyError('Verification failed. Server connection error.');
    } finally {
      setIsVerifying(false);
    }
  };

  const sendQuickAlert = (title: string, msg: string) => {
    onSendAttentionAlert(title, msg);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-4 overflow-y-auto space-y-5 select-none custom-scrollbar">
      
      {/* Host Verification Banner if Not Verified */}
      {!isHostVerified ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Host Authorization Required
          </div>
          <p className="text-xs text-amber-300/80 mb-3 leading-relaxed">
            Enter the authorized host verification key to enable authoritative classroom controls (Development Key: <span className="font-mono font-bold text-amber-200">13189</span>).
          </p>
          <form onSubmit={handleVerify} className="flex gap-2">
            <input
              type="password"
              placeholder="Host Code (e.g. 13189)"
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? 'Checking...' : 'Unlock'}
            </button>
          </form>
          {verifyError && <p className="text-[11px] text-rose-400 mt-2">{verifyError}</p>}
        </div>
      ) : (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-zinc-200">Authoritative Host Mode</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
            KEY: 13189 VERIFIED
          </span>
        </div>
      )}

      {/* Primary Host Media Actions */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
          Live Broadcast Controls
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {/* Microphone */}
          <button
            onClick={onToggleAudio}
            disabled={!isHostVerified}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              !isAudioMuted
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 border-zinc-700/80 text-zinc-400 hover:text-zinc-200'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {!isAudioMuted ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-rose-400" />}
            <span>{!isAudioMuted ? 'Mic Live' : 'Unmute Mic'}</span>
            {!isAudioMuted && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            )}
          </button>

          {/* Screen Share */}
          <button
            onClick={onToggleScreenShare}
            disabled={!isHostVerified}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isSharingScreen
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200 shadow-md shadow-indigo-950'
                : 'bg-zinc-900 border-zinc-700/80 text-zinc-400 hover:text-zinc-200'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isSharingScreen ? <Square className="w-4 h-4 text-rose-400" /> : <Cast className="w-4 h-4 text-indigo-400" />}
            <span>{isSharingScreen ? 'Stop Sharing' : 'Share Screen'}</span>
          </button>
        </div>

        {/* Live Audio Level Meter */}
        {!isAudioMuted && (
          <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-zinc-950 rounded-lg border border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-mono">Mic Input</span>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 transition-all duration-75 rounded-full"
                style={{ width: `${Math.min(100, audioLevel * 1.5)}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">{audioLevel}%</span>
          </div>
        )}
      </div>

      {/* Jaagte Raho 🔥 Attention Alerts Section */}
      <div className="p-3.5 rounded-xl bg-gradient-to-b from-red-950/20 to-zinc-900/80 border border-red-900/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500/30" />
            <h4 className="text-xs font-bold text-red-200 uppercase tracking-wider">
              Attention Alert (Jaagte Raho 🔥)
            </h4>
          </div>
          <button
            onClick={() => setShowCustomAlertInput(!showCustomAlertInput)}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
          >
            {showCustomAlertInput ? 'Presets' : 'Custom'}
          </button>
        </div>

        {!showCustomAlertInput ? (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => sendQuickAlert('JAAGTE RAHO 🔥', 'Wake up! Crucial concept being explained right now.')}
              className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold text-left transition-all cursor-pointer"
            >
              🔥 JAAGTE RAHO
            </button>
            <button
              onClick={() => sendQuickAlert('FOCUS KARO 🎯', 'Put away other tabs and give 100% focus.')}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium text-left transition-all cursor-pointer"
            >
              🎯 FOCUS KARO
            </button>
            <button
              onClick={() => sendQuickAlert('IMPORTANT FORMULA 📐', 'Note this down! Highly likely in upcoming exam.')}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium text-left transition-all cursor-pointer"
            >
              📐 FORMULA ALERT
            </button>
            <button
              onClick={() => sendQuickAlert('QUICK QUESTION ❓', 'Check your screen and answer the quick check question!')}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium text-left transition-all cursor-pointer"
            >
              ❓ QUICK QUESTION
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={customAlertTitle}
              onChange={(e) => setCustomAlertTitle(e.target.value)}
              placeholder="Alert Title"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
            <input
              type="text"
              value={customAlertMsg}
              onChange={(e) => setCustomAlertMsg(e.target.value)}
              placeholder="Alert Message"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
            <button
              onClick={() => sendQuickAlert(customAlertTitle, customAlertMsg)}
              className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Broadcast Alert to All Students
            </button>
          </div>
        )}
      </div>

      {/* Speaking Request Queue (Raised Hands) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Speaking Requests ({handsRaised.length})
          </h4>
        </div>

        {handsRaised.length === 0 ? (
          <div className="px-3 py-2 rounded-xl bg-zinc-950/40 border border-zinc-800 text-center text-xs text-zinc-500">
            No active speaking requests
          </div>
        ) : (
          <div className="space-y-1.5">
            {handsRaised.map(student => (
              <div 
                key={student.uid}
                className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/30"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-medium text-amber-200 truncate">{student.displayName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onApproveSpeaking(student.uid, true)}
                    className="p-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                    title="Allow to speak"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onApproveSpeaking(student.uid, false)}
                    className="p-1 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors cursor-pointer"
                    title="Dismiss request"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Classroom Security & Host Controls */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
          Classroom Moderation
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {/* Mute All */}
          <button
            onClick={onMuteAll}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
          >
            <VolumeX className="w-3.5 h-3.5 text-amber-400" />
            <span>Mute All</span>
          </button>

          {/* Toggle Lock */}
          <button
            onClick={onToggleLock}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              classroom.settings.isLocked 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {classroom.settings.isLocked ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{classroom.settings.isLocked ? 'Locked' : 'Unlocked'}</span>
          </button>

          {/* Toggle Chat */}
          <button
            onClick={onToggleChat}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              !classroom.settings.chatEnabled 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {classroom.settings.chatEnabled ? <MessageSquare className="w-3.5 h-3.5" /> : <MessageSquareOff className="w-3.5 h-3.5 text-rose-400" />}
            <span>{classroom.settings.chatEnabled ? 'Chat Active' : 'Chat Off'}</span>
          </button>

          {/* Attendance */}
          <button
            onClick={onOpenAttendanceModal}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5 text-indigo-400" />
            <span>Attendance ({participants.length})</span>
          </button>
        </div>
      </div>

      {/* Live Interactive Tools */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
          Assessment & Engagement
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenPollModal}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Launch Poll</span>
          </button>

          <button
            onClick={onOpenQuizModal}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Quiz / MCQ</span>
          </button>
        </div>
      </div>

    </div>
  );
};
