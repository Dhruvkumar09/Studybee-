class StudyLiveAudioService {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;

  private getContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play high-urgency Jaagte Raho Attention Siren
  playAttentionAlarm(urgency: 'high' | 'urgent' = 'urgent') {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      const duration = urgency === 'urgent' ? 1.8 : 1.2;

      // Frequency modulation for police/siren alert effect
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.linearRampToValueAtTime(1100, now + 0.3);
      osc.frequency.linearRampToValueAtTime(650, now + 0.6);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.9);
      osc.frequency.linearRampToValueAtTime(650, now + 1.2);
      osc.frequency.linearRampToValueAtTime(1300, now + 1.5);
      osc.frequency.linearRampToValueAtTime(650, now + 1.8);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);

      // Trigger hardware vibration if supported on mobile/Android devices
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 250, 100, 400]);
      }
    } catch (err) {
      console.warn('[AudioService] Siren playback skipped/blocked by browser gesture:', err);
    }
  }

  // Play gentle chime for hand raise or poll
  playChime(type: 'hand' | 'poll' | 'chat') {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      osc.type = 'sine';

      if (type === 'hand') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      } else if (type === 'poll') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      } else {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      }

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignore
    }
  }

  // Setup real mic audio level monitoring
  startAudioLevelMonitoring(stream: MediaStream, onLevelChange: (level: number) => void) {
    try {
      this.stopAudioLevelMonitoring();
      this.micStream = stream;
      const ctx = this.getContext();
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.5;

      this.sourceNode = ctx.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkLevel = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        onLevelChange(normalized);
        this.animationFrameId = requestAnimationFrame(checkLevel);
      };

      checkLevel();
    } catch (err) {
      console.warn('[AudioService] Level monitoring initialization error:', err);
    }
  }

  stopAudioLevelMonitoring() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    this.analyser = null;
    this.micStream = null;
  }
}

export const audioService = new StudyLiveAudioService();
