import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getAIProvider } from './server/aiProvider.ts';
import type { Classroom, Participant, ChatMessage, AttentionAlert, Poll, Quiz, AttendanceRecord } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);
const HOST_DEV_ACCESS_CODE = process.env.HOST_DEV_ACCESS_CODE || '13189';

app.use(express.json());

// In-memory real-time state for classrooms & signaling fallback
interface RoomState {
  classroom: Classroom;
  participants: Map<string, Participant>;
  chat: ChatMessage[];
  alerts: AttentionAlert[];
  polls: Poll[];
  quizzes: Quiz[];
  attendance: Map<string, AttendanceRecord>;
}

const rooms = new Map<string, RoomState>();
const clientSockets = new Map<string, { ws: WebSocket; roomId?: string; uid?: string }>();

// Pre-seed a default demo classroom for instant onboarding
const defaultClassroomId = 'PHYS-101';
rooms.set(defaultClassroomId, {
  classroom: {
    id: defaultClassroomId,
    title: 'Advanced Mechanics & Problem Solving',
    subject: 'Physics (JEE / Advanced)',
    hostUid: 'host-dr-sharma',
    hostName: 'Prof. R. K. Sharma',
    hostCodeRequired: true,
    createdAt: Date.now() - 1000 * 60 * 15,
    isActive: true,
    settings: {
      isLocked: false,
      chatEnabled: true,
      studentMicAllowed: false,
      maxParticipants: 100,
      requireApprovalToSpeak: true
    },
    activeScreenShareUid: null,
    activeSpeakerUid: 'host-dr-sharma'
  },
  participants: new Map([
    ['host-dr-sharma', {
      uid: 'host-dr-sharma',
      displayName: 'Prof. R. K. Sharma',
      role: 'HOST',
      joinedAt: Date.now() - 1000 * 60 * 15,
      lastSeenAt: Date.now(),
      isAudioMuted: false,
      isHandRaised: false,
      canSpeak: true,
      isSharingScreen: false,
      connectionQuality: 'excellent',
      pingMs: 14
    }]
  ]),
  chat: [
    {
      id: 'msg-init-1',
      senderUid: 'host-dr-sharma',
      senderName: 'Prof. R. K. Sharma',
      senderRole: 'HOST',
      text: 'Welcome students to today’s lecture on Rotational Dynamics & Moment of Inertia! Please have your notebooks ready.',
      timestamp: Date.now() - 1000 * 60 * 12,
      isAnnouncement: true
    }
  ],
  alerts: [],
  polls: [],
  quizzes: [],
  attendance: new Map([
    ['host-dr-sharma', {
      uid: 'host-dr-sharma',
      displayName: 'Prof. R. K. Sharma',
      joinTime: Date.now() - 1000 * 60 * 15,
      totalDurationSeconds: 900,
      reconnects: 0,
      status: 'active'
    }]
  ])
});

// REST API Endpoints

// 1. Health & Server Info
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'StudyLive Realtime Core',
    roomsCount: rooms.size,
    timestamp: Date.now()
  });
});

// 2. Authoritative Host Access Code Verification
app.post('/api/auth/verify-host', (req: Request, res: Response) => {
  const { code, classroomId, uid } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  // Authoritative server check against HOST_DEV_ACCESS_CODE ("13189")
  if (code.trim() === HOST_DEV_ACCESS_CODE.trim()) {
    // Generate secure session token for host
    const hostToken = `host_${uid || 'user'}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return res.json({
      success: true,
      role: 'HOST',
      hostToken,
      message: 'Host privileges verified successfully'
    });
  }

  return res.status(403).json({
    success: false,
    error: 'Invalid Host Access Code. Please enter the correct authorization key.'
  });
});

// 3. Classrooms List & Lookup
app.get('/api/classrooms', (_req: Request, res: Response) => {
  const list = Array.from(rooms.values()).map(r => ({
    ...r.classroom,
    participantsCount: r.participants.size
  }));
  res.json({ classrooms: list });
});

app.get('/api/classrooms/:id', (req: Request, res: Response) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Classroom not found' });
  }
  res.json({
    classroom: room.classroom,
    participants: Array.from(room.participants.values()),
    chat: room.chat,
    polls: room.polls,
    quizzes: room.quizzes,
    attendance: Array.from(room.attendance.values())
  });
});

app.post('/api/classrooms', (req: Request, res: Response) => {
  const { id, title, subject, hostUid, hostName, hostCode } = req.body;
  
  // Verify host code if creating classroom as host
  if (hostCode && hostCode.trim() !== HOST_DEV_ACCESS_CODE.trim()) {
    return res.status(403).json({ error: 'Invalid Host Access Code' });
  }

  const roomId = id?.trim() || `CLASS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const newClassroom: Classroom = {
    id: roomId,
    title: title || 'Live Study Session',
    subject: subject || 'General Studies',
    hostUid: hostUid || 'host-user',
    hostName: hostName || 'Instructor',
    hostCodeRequired: true,
    createdAt: Date.now(),
    isActive: true,
    settings: {
      isLocked: false,
      chatEnabled: true,
      studentMicAllowed: false,
      maxParticipants: 150,
      requireApprovalToSpeak: true
    },
    activeScreenShareUid: null,
    activeSpeakerUid: hostUid || null
  };

  rooms.set(roomId, {
    classroom: newClassroom,
    participants: new Map(),
    chat: [],
    alerts: [],
    polls: [],
    quizzes: [],
    attendance: new Map()
  });

  res.status(201).json({ classroom: newClassroom });
});

// 4. AI Provider Endpoints (Powered by Google Gemini with AIProvider abstraction)
app.post('/api/ai/study', async (req: Request, res: Response) => {
  const { action, topic, mode, count, question, notesContext, providerName } = req.body;
  const aiProvider = getAIProvider(providerName || 'gemini');

  try {
    switch (action) {
      case 'generate-quiz': {
        const quizData = await aiProvider.generateQuiz({
          topic: topic || 'Physics Newton Laws',
          mode: mode || 'JEE',
          count: count || 3
        });
        return res.json({ success: true, data: quizData });
      }

      case 'summarize-lecture': {
        const summary = await aiProvider.summarizeLecture({
          topic: topic || 'Live Lecture Topic',
          notesContext: notesContext || '',
          mode: mode || 'quick_recap'
        });
        return res.json({ success: true, summary });
      }

      case 'solve-doubt': {
        const solution = await aiProvider.solveDoubt({
          question: question || 'How does conservation of momentum apply here?',
          classroomContext: topic || ''
        });
        return res.json({ success: true, solution });
      }

      case 'extract-formulas': {
        const formulas = await aiProvider.extractFormulas(topic || 'Electromagnetism', mode || 'JEE');
        return res.json({ success: true, formulas });
      }

      default:
        return res.status(400).json({ error: 'Unknown action parameter' });
    }
  } catch (err: any) {
    console.error('[AI API Error]', err);
    return res.status(500).json({
      error: 'AI generation error',
      message: err?.message || 'Server error processing AI query'
    });
  }
});

// 5. FCM Push Alert Endpoint (for Android native notification delivery simulation/relay)
app.post('/api/fcm/send-alert', (req: Request, res: Response) => {
  const { classroomId, alertTitle, alertMessage, urgency } = req.body;
  // If FCM_SERVER_KEY is configured in .env, we can make upstream FCM REST call
  // We log and return structured payload for native Android receiver
  console.log(`[FCM Relay] Dispatched alert to ${classroomId}: "${alertTitle}" - "${alertMessage}" (${urgency})`);
  res.json({
    success: true,
    messageId: `fcm-${Date.now()}`,
    status: 'dispatched',
    recipientsCount: rooms.get(classroomId)?.participants.size || 0
  });
});

// Setup WebSocket Signaling Server for WebRTC & Real-time Sync
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcastToRoom(roomId: string, message: any, excludeSocketId?: string) {
  const payload = JSON.stringify(message);
  for (const [sId, client] of clientSockets.entries()) {
    if (client.roomId === roomId && sId !== excludeSocketId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }
}

wss.on('connection', (ws: WebSocket) => {
  const socketId = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  clientSockets.set(socketId, { ws });

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const { type, roomId, uid, payload } = msg;

      switch (type) {
        // --- 1. Classroom Join & Presence ---
        case 'JOIN_ROOM': {
          const room = rooms.get(roomId);
          if (!room) {
            ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Classroom not found' } }));
            return;
          }

          if (room.classroom.settings.isLocked && payload?.role !== 'HOST') {
            ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Classroom is currently locked by the Host.' } }));
            return;
          }

          const clientMeta = clientSockets.get(socketId);
          if (clientMeta) {
            clientMeta.roomId = roomId;
            clientMeta.uid = uid;
          }

          const participant: Participant = {
            uid,
            displayName: payload?.displayName || 'Student',
            role: payload?.role || 'STUDENT',
            joinedAt: Date.now(),
            lastSeenAt: Date.now(),
            isAudioMuted: payload?.isAudioMuted ?? true,
            isHandRaised: false,
            canSpeak: payload?.role === 'HOST' || !room.classroom.settings.requireApprovalToSpeak,
            isSharingScreen: false,
            connectionQuality: 'excellent',
            pingMs: 15
          };

          room.participants.set(uid, participant);

          // Update attendance
          const existingAtt = room.attendance.get(uid);
          if (existingAtt) {
            existingAtt.reconnects += 1;
            existingAtt.status = 'active';
          } else {
            room.attendance.set(uid, {
              uid,
              displayName: participant.displayName,
              joinTime: Date.now(),
              totalDurationSeconds: 0,
              reconnects: 0,
              status: 'active'
            });
          }

          // Acknowledge join to the sender with full state snapshot
          ws.send(JSON.stringify({
            type: 'ROOM_JOINED',
            payload: {
              classroom: room.classroom,
              participants: Array.from(room.participants.values()),
              chat: room.chat,
              polls: room.polls,
              quizzes: room.quizzes,
              activeScreenShareUid: room.classroom.activeScreenShareUid,
              activeSpeakerUid: room.classroom.activeSpeakerUid
            }
          }));

          // Notify all other peers in the room
          broadcastToRoom(roomId, {
            type: 'PARTICIPANT_JOINED',
            payload: { participant }
          }, socketId);

          // System message in chat
          const sysMsg: ChatMessage = {
            id: `sys-${Date.now()}`,
            senderUid: 'system',
            senderName: 'System',
            senderRole: 'STUDENT',
            text: `${participant.displayName} joined the classroom.`,
            timestamp: Date.now(),
            isSystem: true
          };
          room.chat.push(sysMsg);
          broadcastToRoom(roomId, { type: 'CHAT_MESSAGE', payload: sysMsg });
          break;
        }

        // --- 2. WebRTC Signaling (Offers, Answers, ICE Candidates) ---
        case 'RTC_OFFER':
        case 'RTC_ANSWER':
        case 'RTC_CANDIDATE': {
          const { targetUid } = payload;
          // Route directly to the targeted peer socket
          for (const [, client] of clientSockets.entries()) {
            if (client.roomId === roomId && client.uid === targetUid && client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(JSON.stringify({
                type,
                payload: {
                  senderUid: uid,
                  ...payload
                }
              }));
              break;
            }
          }
          break;
        }

        // --- 3. Screen Sharing Notification ---
        case 'SCREEN_SHARE_START': {
          const room = rooms.get(roomId);
          if (room) {
            room.classroom.activeScreenShareUid = uid;
            const p = room.participants.get(uid);
            if (p) p.isSharingScreen = true;

            broadcastToRoom(roomId, {
              type: 'SCREEN_SHARE_STATUS',
              payload: { activeScreenShareUid: uid, isSharing: true }
            });
          }
          break;
        }

        case 'SCREEN_SHARE_STOP': {
          const room = rooms.get(roomId);
          if (room && room.classroom.activeScreenShareUid === uid) {
            room.classroom.activeScreenShareUid = null;
            const p = room.participants.get(uid);
            if (p) p.isSharingScreen = false;

            broadcastToRoom(roomId, {
              type: 'SCREEN_SHARE_STATUS',
              payload: { activeScreenShareUid: null, isSharing: false }
            });
          }
          break;
        }

        // --- 4. Audio & Microphone Controls ---
        case 'AUDIO_STATE_CHANGE': {
          const room = rooms.get(roomId);
          if (room) {
            const p = room.participants.get(uid);
            if (p) {
              p.isAudioMuted = !!payload.isMuted;
              broadcastToRoom(roomId, {
                type: 'PARTICIPANT_AUDIO_CHANGED',
                payload: { uid, isAudioMuted: p.isAudioMuted }
              });
            }
          }
          break;
        }

        // --- 5. Host Authoritative Controls ---
        case 'HOST_MUTE_PARTICIPANT': {
          const room = rooms.get(roomId);
          if (room) {
            const { targetUid } = payload;
            const target = room.participants.get(targetUid);
            if (target) {
              target.isAudioMuted = true;
              target.canSpeak = false;
              broadcastToRoom(roomId, {
                type: 'PARTICIPANT_FORCE_MUTED',
                payload: { targetUid }
              });
            }
          }
          break;
        }

        case 'HOST_MUTE_ALL': {
          const room = rooms.get(roomId);
          if (room) {
            for (const [, p] of room.participants.entries()) {
              if (p.role !== 'HOST') {
                p.isAudioMuted = true;
                p.canSpeak = false;
              }
            }
            broadcastToRoom(roomId, {
              type: 'MUTE_ALL_ENFORCED',
              payload: { enforcedBy: uid }
            });
          }
          break;
        }

        case 'HOST_TOGGLE_LOCK': {
          const room = rooms.get(roomId);
          if (room) {
            room.classroom.settings.isLocked = !room.classroom.settings.isLocked;
            broadcastToRoom(roomId, {
              type: 'ROOM_LOCK_CHANGED',
              payload: { isLocked: room.classroom.settings.isLocked }
            });
          }
          break;
        }

        case 'HOST_TOGGLE_CHAT': {
          const room = rooms.get(roomId);
          if (room) {
            room.classroom.settings.chatEnabled = !room.classroom.settings.chatEnabled;
            broadcastToRoom(roomId, {
              type: 'ROOM_CHAT_TOGGLED',
              payload: { chatEnabled: room.classroom.settings.chatEnabled }
            });
          }
          break;
        }

        // --- 6. Hand Raise & Speaking Permission ---
        case 'RAISE_HAND': {
          const room = rooms.get(roomId);
          if (room) {
            const p = room.participants.get(uid);
            if (p) {
              p.isHandRaised = !p.isHandRaised;
              broadcastToRoom(roomId, {
                type: 'HAND_RAISE_CHANGED',
                payload: { uid, isHandRaised: p.isHandRaised }
              });
            }
          }
          break;
        }

        case 'APPROVE_SPEAKING': {
          const room = rooms.get(roomId);
          if (room) {
            const { targetUid, canSpeak } = payload;
            const p = room.participants.get(targetUid);
            if (p) {
              p.canSpeak = canSpeak;
              p.isHandRaised = false;
              broadcastToRoom(roomId, {
                type: 'SPEAKING_PERMISSION_UPDATED',
                payload: { targetUid, canSpeak }
              });
            }
          }
          break;
        }

        // --- 7. Real-Time Chat ---
        case 'SEND_CHAT': {
          const room = rooms.get(roomId);
          if (room) {
            if (!room.classroom.settings.chatEnabled && payload.role !== 'HOST') {
              ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Chat is currently disabled by Host.' } }));
              return;
            }

            const chatMsg: ChatMessage = {
              id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              senderUid: uid,
              senderName: payload.senderName || 'Anonymous',
              senderRole: payload.senderRole || 'STUDENT',
              text: payload.text.substring(0, 1000),
              timestamp: Date.now(),
              isAnnouncement: !!payload.isAnnouncement
            };
            room.chat.push(chatMsg);
            broadcastToRoom(roomId, { type: 'CHAT_MESSAGE', payload: chatMsg });
          }
          break;
        }

        case 'DELETE_CHAT': {
          const room = rooms.get(roomId);
          if (room) {
            const { messageId } = payload;
            room.chat = room.chat.filter(m => m.id !== messageId);
            broadcastToRoom(roomId, {
              type: 'CHAT_DELETED',
              payload: { messageId }
            });
          }
          break;
        }

        // --- 8. Jaagte Raho 🔥 Attention Alert ---
        case 'SEND_ATTENTION_ALERT': {
          const room = rooms.get(roomId);
          if (room) {
            const alert: AttentionAlert = {
              id: `alert-${Date.now()}`,
              title: payload.title || 'JAAGTE RAHO 🔥',
              message: payload.message || 'Host has requested immediate attention!',
              sentBy: payload.senderName || 'Host',
              timestamp: Date.now(),
              urgency: payload.urgency || 'urgent'
            };
            room.alerts.push(alert);
            broadcastToRoom(roomId, { type: 'ATTENTION_ALERT', payload: alert });
          }
          break;
        }

        // --- 9. Polls & Quizzes ---
        case 'CREATE_POLL': {
          const room = rooms.get(roomId);
          if (room) {
            const newPoll: Poll = {
              id: `poll-${Date.now()}`,
              question: payload.question,
              options: payload.options.map((opt: string, idx: number) => ({
                id: `opt-${idx}`,
                text: opt,
                votesCount: 0
              })),
              createdBy: uid,
              createdAt: Date.now(),
              durationSeconds: payload.durationSeconds || 60,
              endsAt: Date.now() + (payload.durationSeconds || 60) * 1000,
              isActive: true,
              userVotes: {}
            };
            room.polls.push(newPoll);
            broadcastToRoom(roomId, { type: 'POLL_CREATED', payload: newPoll });
          }
          break;
        }

        case 'VOTE_POLL': {
          const room = rooms.get(roomId);
          if (room) {
            const { pollId, optionId } = payload;
            const targetPoll = room.polls.find(p => p.id === pollId);
            if (targetPoll && targetPoll.isActive && !targetPoll.userVotes[uid]) {
              targetPoll.userVotes[uid] = optionId;
              const opt = targetPoll.options.find(o => o.id === optionId);
              if (opt) opt.votesCount += 1;

              broadcastToRoom(roomId, {
                type: 'POLL_UPDATED',
                payload: targetPoll
              });
            }
          }
          break;
        }

        case 'CREATE_QUIZ': {
          const room = rooms.get(roomId);
          if (room) {
            const newQuiz: Quiz = {
              id: `quiz-${Date.now()}`,
              title: payload.title || 'Live Concept Check',
              questions: payload.questions,
              timePerQuestionSeconds: payload.timePerQuestionSeconds || 30,
              isActive: true,
              currentQuestionIndex: 0,
              userAnswers: {},
              scores: {}
            };
            room.quizzes.push(newQuiz);
            broadcastToRoom(roomId, { type: 'QUIZ_CREATED', payload: newQuiz });
          }
          break;
        }

        case 'SUBMIT_QUIZ_ANSWER': {
          const room = rooms.get(roomId);
          if (room) {
            const { quizId, questionIndex, selectedOptionIndex } = payload;
            const q = room.quizzes.find(item => item.id === quizId);
            if (q && q.isActive) {
              if (!q.userAnswers[uid]) q.userAnswers[uid] = [];
              q.userAnswers[uid][questionIndex] = selectedOptionIndex;

              // Update score if correct
              const question = q.questions[questionIndex];
              if (question && question.correctIndex === selectedOptionIndex) {
                q.scores = q.scores || {};
                q.scores[uid] = (q.scores[uid] || 0) + 1;
              }

              broadcastToRoom(roomId, {
                type: 'QUIZ_SUBMISSION_RECORDED',
                payload: { quizId, uid, scores: q.scores }
              });
            }
          }
          break;
        }

        // --- 10. Ping/Pong Latency Diagnostics ---
        case 'PING': {
          ws.send(JSON.stringify({ type: 'PONG', payload: { clientTime: payload?.clientTime, serverTime: Date.now() } }));
          break;
        }
      }
    } catch (err) {
      console.error('[WebSocket Error]', err);
    }
  });

  ws.on('close', () => {
    const meta = clientSockets.get(socketId);
    if (meta && meta.roomId && meta.uid) {
      const room = rooms.get(meta.roomId);
      if (room) {
        room.participants.delete(meta.uid);
        if (room.classroom.activeScreenShareUid === meta.uid) {
          room.classroom.activeScreenShareUid = null;
          broadcastToRoom(meta.roomId, {
            type: 'SCREEN_SHARE_STATUS',
            payload: { activeScreenShareUid: null, isSharing: false }
          });
        }

        const att = room.attendance.get(meta.uid);
        if (att) {
          att.status = 'disconnected';
          att.leaveTime = Date.now();
          att.totalDurationSeconds = Math.round((att.leaveTime - att.joinTime) / 1000);
        }

        broadcastToRoom(meta.roomId, {
          type: 'PARTICIPANT_LEFT',
          payload: { uid: meta.uid }
        });
      }
    }
    clientSockets.delete(socketId);
  });
});

// Configure Vite integration for dev server or static files for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`[StudyLive Server] Running on http://localhost:${port}`);
    console.log(`[StudyLive Server] WebSocket signaling active on ws://localhost:${port}/ws`);
    console.log(`[StudyLive Server] Dev Host Access Code: ${HOST_DEV_ACCESS_CODE}`);
  });
}

startServer();
