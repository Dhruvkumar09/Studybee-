import React, { useEffect, useState } from 'react';
import { Flame, BellRing, VolumeX, CheckCircle, AlertTriangle } from 'lucide-react';
import type { AttentionAlert } from '../types';
import { audioService } from '../services/audioService';

interface AttentionAlertModalProps {
  alert: AttentionAlert | null;
  onDismiss: () => void;
}

export const AttentionAlertModal: React.FC<AttentionAlertModalProps> = ({
  alert,
  onDismiss
}) => {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (alert && !muted) {
      audioService.playAttentionAlarm(alert.urgency);
    }
  }, [alert, muted]);

  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-red-500/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.35)] text-center animate-bounce-short">
        
        {/* Glowing Fire Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/40 mb-4 animate-pulse">
          <Flame className="w-10 h-10 text-white fill-amber-200" />
        </div>

        {/* Urgency Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold tracking-wider uppercase mb-3">
          <AlertTriangle className="w-3.5 h-3.5" />
          Attention Alert from {alert.sentBy}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-2">
          {alert.title}
        </h2>

        {/* Message */}
        <p className="text-sm font-medium text-zinc-300 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-6 leading-relaxed">
          "{alert.message}"
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onDismiss}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <CheckCircle className="w-4 h-4" />
            I AM AWAKE & FOCUSED!
          </button>

          <button
            onClick={() => setMuted(!muted)}
            className="inline-flex items-center justify-center gap-1.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <BellRing className="w-3.5 h-3.5" />}
            {muted ? 'Sound Muted' : 'Mute Alert Sound'}
          </button>
        </div>
      </div>
    </div>
  );
};
