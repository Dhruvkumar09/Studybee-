export type SignalingEventHandler = (data: any) => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private url: string = '';
  private handlers: Map<string, Set<SignalingEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private isExplicitlyClosed = false;

  public isConnected = false;
  public lastPingMs = 15;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = `${protocol}//${window.location.host}/ws`;
  }

  connect(roomId: string, uid: string, payload?: any) {
    this.isExplicitlyClosed = false;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('CONNECTION_CHANGE', { isConnected: true, status: 'Connected' });

        // Join room immediately upon connection
        this.send('JOIN_ROOM', roomId, uid, payload);

        // Start ping/pong for real RTT measurement
        this.startPing(roomId, uid);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'PONG') {
            const clientTime = msg.payload?.clientTime;
            if (clientTime) {
              this.lastPingMs = Math.max(5, Date.now() - clientTime);
              this.emit('PING_UPDATE', { pingMs: this.lastPingMs });
            }
          } else {
            this.emit(msg.type, msg.payload);
          }
        } catch (err) {
          console.error('[SignalingClient] Parse error:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopPing();
        this.emit('CONNECTION_CHANGE', { isConnected: false, status: 'Reconnecting...' });

        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect(roomId, uid, payload);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[SignalingClient] Socket error:', err);
      };
    } catch (err) {
      console.error('[SignalingClient] Connection error:', err);
      this.scheduleReconnect(roomId, uid, payload);
    }
  }

  private scheduleReconnect(roomId: string, uid: string, payload?: any) {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('CONNECTION_CHANGE', { isConnected: false, status: 'Connection failed. Please retry.' });
      return;
    }

    const backoff = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.connect(roomId, uid, payload);
    }, backoff);
  }

  private startPing(roomId: string, uid: string) {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('PING', roomId, uid, { clientTime: Date.now() });
      }
    }, 4000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  send(type: string, roomId: string, uid: string, payload?: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, roomId, uid, payload }));
    }
  }

  on(type: string, handler: SignalingEventHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.off(type, handler);
  }

  off(type: string, handler: SignalingEventHandler) {
    const list = this.handlers.get(type);
    if (list) {
      list.delete(handler);
    }
  }

  private emit(type: string, data: any) {
    const list = this.handlers.get(type);
    if (list) {
      list.forEach(fn => fn(data));
    }
  }

  disconnect() {
    this.isExplicitlyClosed = true;
    this.stopPing();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const signalingClient = new SignalingClient();
