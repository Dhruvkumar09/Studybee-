import React from 'react';
import { Activity, X, Wifi, Shield, Server, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ConnectionStats } from '../services/webrtc';

interface ConnectionDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ConnectionStats;
  isConnected: boolean;
  reconnectCount: number;
}

export const ConnectionDiagnosticsModal: React.FC<ConnectionDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  stats,
  isConnected,
  reconnectCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Connection & WebRTC Diagnostics</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quality Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          stats.quality === 'excellent' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : stats.quality === 'good' 
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
            : stats.quality === 'unstable' 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider block">Network Quality</span>
            <span className="text-lg font-bold capitalize">{stats.quality}</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold block">{stats.rttMs} ms RTT</span>
            <span className="text-[10px] text-zinc-400">Round-trip Ping</span>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Packet Loss</span>
            <span className="text-sm font-mono font-bold text-white">{stats.packetLossPercent}%</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Bitrate</span>
            <span className="text-sm font-mono font-bold text-cyan-400">{stats.bitrateKbps} kbps</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Signaling Transport</span>
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              WebSocket (/ws)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Reconnections</span>
            <span className="text-sm font-mono font-bold text-zinc-300">{reconnectCount} recovered</span>
          </div>
        </div>

        {/* Media & Security Information */}
        <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-1.5 text-[11px]">
          <div className="flex justify-between text-zinc-400">
            <span>Audio Codec:</span>
            <span className="font-mono text-zinc-200">Opus 48kHz (AEC, NS, AGC)</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Target Video Quality:</span>
            <span className="font-mono text-zinc-200">1080p Target / Adaptive WebRTC</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>ICE Connection:</span>
            <span className="font-mono text-emerald-400 uppercase">{stats.iceState}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-700 transition-colors cursor-pointer"
        >
          Close Diagnostics
        </button>

      </div>
    </div>
  );
};
