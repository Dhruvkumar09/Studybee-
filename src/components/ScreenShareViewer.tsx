import React, { useEffect, useRef, useState } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Monitor, 
  Volume2, 
  VolumeX, 
  Cast, 
  Sparkles,
  Radio
} from 'lucide-react';
import type { Participant } from '../types';

interface ScreenShareViewerProps {
  stream: MediaStream | null;
  isHostSharing: boolean;
  hostName: string;
  activeSpeaker?: Participant | null;
  onStartShare?: () => void;
  isHostUser?: boolean;
}

export const ScreenShareViewer: React.FC<ScreenShareViewerProps> = ({
  stream,
  isHostSharing,
  hostName,
  activeSpeaker,
  onStartShare,
  isHostUser
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeout = useRef<any>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.warn('[Video playback]:', e));
    }
  }, [stream]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 1));
  const handleResetZoom = () => setZoomLevel(1);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      if (isFullscreen) setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden select-none group ${
        isFullscreen ? 'fixed inset-0 z-50' : 'rounded-2xl border border-zinc-800/80 shadow-2xl'
      }`}
    >
      {/* Active Screen Share Video */}
      {isHostSharing && stream ? (
        <div 
          className="w-full h-full flex items-center justify-center transition-transform duration-200 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isAudioMuted}
            className="max-w-full max-h-full object-contain pointer-events-none rounded-lg"
          />
        </div>
      ) : (
        /* Idle / Whiteboard Concept Board */
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg z-10">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl shadow-indigo-950/40">
              <Monitor className="w-10 h-10 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold tracking-wider text-white shadow-md">
              1080p SFU
            </div>
          </div>

          <h3 className="text-xl font-bold text-zinc-100 tracking-tight mb-2">
            {isHostUser ? "You are ready to share your screen" : `${hostName} hasn't started screen sharing yet`}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            {isHostUser 
              ? "Share your lecture slides, digital pen tablet, or problem-solving notes with low-latency WebRTC." 
              : "When the host shares slides, whiteboard, or problems, high-definition live stream will appear here instantly."}
          </p>

          {isHostUser && onStartShare && (
            <button
              onClick={onStartShare}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Cast className="w-4 h-4" />
              Start Screen Share
            </button>
          )}

          {/* Educational Formula Graphic Placeholder */}
          <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-sm text-left">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Target Quality</span>
              <span className="text-xs font-mono text-cyan-400">1080p @ 30-60 FPS</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Latency Profile</span>
              <span className="text-xs font-mono text-emerald-400">&lt; 150ms Low-Latency</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Floating Badges (Speaker & Stream Info) */}
      <div className={`absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center gap-2 pointer-events-auto">
          {isHostSharing && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900/85 backdrop-blur-md text-zinc-200 border border-zinc-700/60 shadow-lg">
              <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              {hostName}'s Screen
            </span>
          )}

          {activeSpeaker && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/80 backdrop-blur-md text-indigo-300 border border-indigo-700/60 shadow-lg">
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-3 bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-1.5 bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              Speaking: {activeSpeaker.displayName}
            </span>
          )}
        </div>

        {isHostSharing && (
          <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-zinc-900/80 backdrop-blur-md text-zinc-400 border border-zinc-800">
              Zoom: {Math.round(zoomLevel * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Floating Bottom Floating Controls Overlay */}
      {isHostSharing && (
        <div className={`absolute bottom-4 right-4 flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800 shadow-2xl transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Reset Zoom */}
          {zoomLevel !== 1 && (
            <button
              onClick={handleResetZoom}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Reset Zoom (100%)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <div className="w-px h-5 bg-zinc-800 my-auto" />

          {/* Audio Mute for Screen Share */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
