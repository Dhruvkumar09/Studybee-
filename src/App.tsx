/**
 * StudyLive - Production Live Classroom & Study Platform
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  ScreenShareViewer 
} from './components/ScreenShareViewer';
import { 
  HostControlsPanel 
} from './components/HostControlsPanel';
import { 
  StudentControlsBar 
} from './components/StudentControlsBar';
import { 
  ChatPanel 
} from './components/ChatPanel';
import { 
  PollsAndQuizPanel 
} from './components/PollsAndQuizPanel';
import { 
  AttentionAlertModal 
} from './components/AttentionAlertModal';
import { 
  FocusModeOverlay 
} from './components/FocusModeOverlay';
import { 
  AttendanceModal 
} from './components/AttendanceModal';
import { 
  ConnectionDiagnosticsModal 
} from './components/ConnectionDiagnosticsModal';
import { 
  AIStudyAssistantModal 
} from './components/AIStudyAssistantModal';
import { 
  CreatePollModal 
} from './components/CreatePollModal';
import { 
  CreateQuizModal 
} from './components/CreateQuizModal';
import { 
  AuthModal 
} from './components/AuthModal';

import { signalingClient } from './services/signaling';
import { webrtcManager, ConnectionStats } from './services/webrtc';
import { audioService } from './services/audioService';
import type { 
  Classroom, 
  UserProfile, 
  Participant, 
  ChatMessage, 
  AttentionAlert, 
  Poll, 
  Quiz, 
  AttendanceRecord,
  QuizQuestion 
} from './types';
import { 
  MessageSquare, 
  BarChart2, 
  ShieldCheck, 
  Users, 
  Hand, 
  Mic, 
  MicOff 
} from 'lucide-react';

export default function App() {
  // 1. Current User State (Defaults to verified Teacher for immediate usability)
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    uid: 'host-prof-sharma',
    displayName: 'Prof. R. K. Sharma',
    role: 'HOST',
    email: 'prof.sharma@studylive.edu',
    isHostVerified: true
  });

  // 2. Classroom State
  const [classroom, setClassroom] = useState<Classroom>({
    id: 'PHYS-101',
    title: 'Advanced Mechanics & Rotational Dynamics',
    subject: 'Physics (JEE / Advanced)',
    hostUid: 'host-prof-sharma',
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
    activeSpeakerUid: 'host-prof-sharma'
  });

  const [participants, setParticipants] = useState<Participant[]>([
    {
      uid: 'host-prof-sharma',
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
    },
    {
      uid: 'student-aryan-01',
      displayName: 'Aryan Gupta',
      role: 'STUDENT',
      joinedAt: Date.now() - 1000 * 60 * 12,
      lastSeenAt: Date.now(),
      isAudioMuted: true,
      isHandRaised: false,
      canSpeak: false,
      isSharingScreen: false,
      connectionQuality: 'excellent',
      pingMs: 18
    },
    {
      uid: 'student-priya-02',
      displayName: 'Priya Verma',
      role: 'STUDENT',
      joinedAt: Date.now() - 1000 * 60 * 8,
      lastSeenAt: Date.now(),
      isAudioMuted: true,
      isHandRaised: false,
      canSpeak: false,
      isSharingScreen: false,
      connectionQuality: 'good',
      pingMs: 28
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-seed-1',
      senderUid: 'host-prof-sharma',
      senderName: 'Prof. R. K. Sharma',
      senderRole: 'HOST',
      text: 'Good morning class! Today we will derive the parallel-axis theorem and solve 3 previous JEE Advanced problems.',
      timestamp: Date.now() - 1000 * 60 * 10,
      isAnnouncement: true
    },
    {
      id: 'msg-seed-2',
      senderUid: 'student-aryan-01',
      senderName: 'Aryan Gupta',
      senderRole: 'STUDENT',
      text: 'Sir, will we also cover radius of gyration today?',
      timestamp: Date.now() - 1000 * 60 * 6
    }
  ]);

  const [polls, setPolls] = useState<Poll[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      uid: 'host-prof-sharma',
      displayName: 'Prof. R. K. Sharma',
      joinTime: Date.now() - 1000 * 60 * 15,
      totalDurationSeconds: 900,
      reconnects: 0,
      status: 'active'
    },
    {
      uid: 'student-aryan-01',
      displayName: 'Aryan Gupta',
      joinTime: Date.now() - 1000 * 60 * 12,
      totalDurationSeconds: 720,
      reconnects: 0,
      status: 'active'
    },
    {
      uid: 'student-priya-02',
      displayName: 'Priya Verma',
      joinTime: Date.now() - 1000 * 60 * 8,
      totalDurationSeconds: 480,
      reconnects: 0,
      status: 'active'
    }
  ]);

  // 3. Media & WebRTC States
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // 4. Connection Diagnostics State
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    rttMs: 14,
    packetLossPercent: 0,
    bitrateKbps: 2450,
    iceState: 'connected',
    quality: 'excellent'
  });
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: true,
    status: 'Connected',
    quality: 'excellent' as 'excellent' | 'good' | 'unstable' | 'poor',
    pingMs: 14
  });
  const [reconnectCount, setReconnectCount] = useState(0);

  // 5. Active Modals & Overlays
  const [currentAttentionAlert, setCurrentAttentionAlert] = useState<AttentionAlert | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // 6. UI Tabs for Side Panel (Chat / Polls / Host / Participants)
  const isHost = currentUser.role === 'HOST' || currentUser.role === 'CO_HOST';
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'polls' | 'host' | 'students'>('chat');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const myParticipant = participants.find(p => p.uid === currentUser.uid);
  const activeSpeaker = participants.find(p => p.uid === classroom.activeSpeakerUid);

  // Connect to Signaling Server on mount
  useEffect(() => {
    signalingClient.connect(classroom.id, currentUser.uid, {
      displayName: currentUser.displayName,
      role: currentUser.role,
      isAudioMuted
    });

    // Subscriptions
    const unsubRoom = signalingClient.on('ROOM_JOINED', (data) => {
      if (data.classroom) setClassroom(data.classroom);
      if (data.participants) setParticipants(data.participants);
      if (data.chat) setChatMessages(data.chat);
      if (data.polls) setPolls(data.polls);
      if (data.quizzes) setQuizzes(data.quizzes);
    });

    const unsubJoined = signalingClient.on('PARTICIPANT_JOINED', (data) => {
      setParticipants(prev => {
        const filtered = prev.filter(p => p.uid !== data.participant.uid);
        return [...filtered, data.participant];
      });
      setAttendanceRecords(prev => {
        const exists = prev.find(r => r.uid === data.participant.uid);
        if (exists) {
          return prev.map(r => r.uid === data.participant.uid ? { ...r, status: 'active', reconnects: r.reconnects + 1 } : r);
        }
        return [...prev, {
          uid: data.participant.uid,
          displayName: data.participant.displayName,
          joinTime: Date.now(),
          totalDurationSeconds: 0,
          reconnects: 0,
          status: 'active'
        }];
      });
    });

    const unsubLeft = signalingClient.on('PARTICIPANT_LEFT', (data) => {
      setParticipants(prev => prev.filter(p => p.uid !== data.uid));
      setAttendanceRecords(prev => prev.map(r => r.uid === data.uid ? { ...r, status: 'disconnected', leaveTime: Date.now() } : r));
    });

    const unsubScreenStatus = signalingClient.on('SCREEN_SHARE_STATUS', (data) => {
      setClassroom(prev => ({
        ...prev,
        activeScreenShareUid: data.activeScreenShareUid
      }));
      setParticipants(prev => prev.map(p => ({
        ...p,
        isSharingScreen: p.uid === data.activeScreenShareUid
      })));
    });

    const unsubAlert = signalingClient.on('ATTENTION_ALERT', (alert: AttentionAlert) => {
      setCurrentAttentionAlert(alert);
    });

    const unsubChat = signalingClient.on('CHAT_MESSAGE', (msg: ChatMessage) => {
      setChatMessages(prev => [...prev, msg]);
      audioService.playChime('chat');
    });

    const unsubChatDel = signalingClient.on('CHAT_DELETED', (data) => {
      setChatMessages(prev => prev.filter(m => m.id !== data.messageId));
    });

    const unsubPollCreated = signalingClient.on('POLL_CREATED', (poll: Poll) => {
      setPolls(prev => [poll, ...prev]);
      audioService.playChime('poll');
    });

    const unsubPollUpdated = signalingClient.on('POLL_UPDATED', (poll: Poll) => {
      setPolls(prev => prev.map(p => p.id === poll.id ? poll : p));
    });

    const unsubQuizCreated = signalingClient.on('QUIZ_CREATED', (quiz: Quiz) => {
      setQuizzes(prev => [quiz, ...prev]);
      audioService.playChime('poll');
    });

    const unsubQuizSubmitted = signalingClient.on('QUIZ_SUBMISSION_RECORDED', (data) => {
      setQuizzes(prev => prev.map(q => q.id === data.quizId ? { ...q, scores: data.scores } : q));
    });

    const unsubLock = signalingClient.on('ROOM_LOCK_CHANGED', (data) => {
      setClassroom(prev => ({
        ...prev,
        settings: { ...prev.settings, isLocked: data.isLocked }
      }));
    });

    const unsubChatToggle = signalingClient.on('ROOM_CHAT_TOGGLED', (data) => {
      setClassroom(prev => ({
        ...prev,
        settings: { ...prev.settings, chatEnabled: data.chatEnabled }
      }));
    });

    const unsubAudioChanged = signalingClient.on('PARTICIPANT_AUDIO_CHANGED', (data) => {
      setParticipants(prev => prev.map(p => p.uid === data.uid ? { ...p, isAudioMuted: data.isAudioMuted } : p));
    });

    const unsubForceMute = signalingClient.on('PARTICIPANT_FORCE_MUTED', (data) => {
      if (data.targetUid === currentUser.uid) {
        setIsAudioMuted(true);
        webrtcManager.stopMicrophone();
      }
      setParticipants(prev => prev.map(p => p.uid === data.targetUid ? { ...p, isAudioMuted: true, canSpeak: false } : p));
    });

    const unsubMuteAll = signalingClient.on('MUTE_ALL_ENFORCED', () => {
      if (currentUser.role !== 'HOST') {
        setIsAudioMuted(true);
        webrtcManager.stopMicrophone();
      }
      setParticipants(prev => prev.map(p => p.role !== 'HOST' ? { ...p, isAudioMuted: true, canSpeak: false } : p));
    });

    const unsubHand = signalingClient.on('HAND_RAISE_CHANGED', (data) => {
      setParticipants(prev => prev.map(p => p.uid === data.uid ? { ...p, isHandRaised: data.isHandRaised } : p));
      if (data.isHandRaised) {
        audioService.playChime('hand');
      }
    });

    const unsubSpeakingPerm = signalingClient.on('SPEAKING_PERMISSION_UPDATED', (data) => {
      setParticipants(prev => prev.map(p => p.uid === data.targetUid ? { ...p, canSpeak: data.canSpeak, isHandRaised: false } : p));
    });

    const unsubConn = signalingClient.on('CONNECTION_CHANGE', (data) => {
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: data.isConnected,
        status: data.status
      }));
      if (!data.isConnected) {
        setReconnectCount(c => c + 1);
      }
    });

    const unsubPing = signalingClient.on('PING_UPDATE', (data) => {
      setConnectionStatus(prev => ({
        ...prev,
        pingMs: data.pingMs,
        quality: data.pingMs < 45 ? 'excellent' : data.pingMs < 90 ? 'good' : data.pingMs < 150 ? 'unstable' : 'poor'
      }));
    });

    // Start WebRTC connection stats monitoring
    webrtcManager.startStatsMonitoring((stats) => {
      setConnectionStats(stats);
    });

    return () => {
      unsubRoom();
      unsubJoined();
      unsubLeft();
      unsubScreenStatus();
      unsubAlert();
      unsubChat();
      unsubChatDel();
      unsubPollCreated();
      unsubPollUpdated();
      unsubQuizCreated();
      unsubQuizSubmitted();
      unsubLock();
      unsubChatToggle();
      unsubAudioChanged();
      unsubForceMute();
      unsubMuteAll();
      unsubHand();
      unsubSpeakingPerm();
      unsubConn();
      unsubPing();
      webrtcManager.cleanup();
      audioService.stopAudioLevelMonitoring();
    };
  }, [classroom.id, currentUser.uid, currentUser.displayName, currentUser.role]);

  // Host Access Code verification against authoritative server endpoint
  const handleVerifyHostCode = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/verify-host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, classroomId: classroom.id, uid: currentUser.uid })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(prev => ({ ...prev, role: 'HOST', isHostVerified: true }));
        setParticipants(prev => prev.map(p => p.uid === currentUser.uid ? { ...p, role: 'HOST', canSpeak: true } : p));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Screen Sharing
  const handleToggleScreenShare = async () => {
    if (isSharingScreen) {
      webrtcManager.stopScreenShare();
      setScreenStream(null);
      setIsSharingScreen(false);
      signalingClient.send('SCREEN_SHARE_STOP', classroom.id, currentUser.uid);
    } else {
      try {
        const stream = await webrtcManager.startScreenShare({
          target1080p: true,
          lectureTitle: classroom.title
        });
        setScreenStream(stream);
        setIsSharingScreen(true);
        signalingClient.send('SCREEN_SHARE_START', classroom.id, currentUser.uid);

        if (stream.getVideoTracks()[0]) {
          stream.getVideoTracks()[0].onended = () => {
            setIsSharingScreen(false);
            setScreenStream(null);
            signalingClient.send('SCREEN_SHARE_STOP', classroom.id, currentUser.uid);
          };
        }
      } catch (err) {
        console.warn('[Screen Share Notice]:', err);
      }
    }
  };

  // Microphone Audio Toggle
  const handleToggleAudio = async () => {
    if (!isAudioMuted) {
      webrtcManager.stopMicrophone();
      audioService.stopAudioLevelMonitoring();
      setIsAudioMuted(true);
      setAudioLevel(0);
      signalingClient.send('AUDIO_STATE_CHANGE', classroom.id, currentUser.uid, { isMuted: true });
    } else {
      try {
        const stream = await webrtcManager.startMicrophone();
        setIsAudioMuted(false);
        signalingClient.send('AUDIO_STATE_CHANGE', classroom.id, currentUser.uid, { isMuted: false });
        audioService.startAudioLevelMonitoring(stream, (level) => {
          setAudioLevel(level);
        });
      } catch (err) {
        console.warn('[Microphone failed]:', err);
      }
    }
  };

  // Host Controls Actions
  const handleMuteAll = () => {
    signalingClient.send('HOST_MUTE_ALL', classroom.id, currentUser.uid);
  };

  const handleToggleLock = () => {
    signalingClient.send('HOST_TOGGLE_LOCK', classroom.id, currentUser.uid);
  };

  const handleToggleChat = () => {
    signalingClient.send('HOST_TOGGLE_CHAT', classroom.id, currentUser.uid);
  };

  const handleSendAttentionAlert = (title: string, message: string) => {
    signalingClient.send('SEND_ATTENTION_ALERT', classroom.id, currentUser.uid, {
      title,
      message,
      senderName: currentUser.displayName,
      urgency: 'urgent'
    });
  };

  const handleApproveSpeaking = (targetUid: string, approve: boolean) => {
    signalingClient.send('APPROVE_SPEAKING', classroom.id, currentUser.uid, {
      targetUid,
      canSpeak: approve
    });
  };

  // Student Controls Actions
  const handleToggleHandRaise = () => {
    signalingClient.send('RAISE_HAND', classroom.id, currentUser.uid);
  };

  const handleSendChatMessage = (text: string, isAnnouncement?: boolean) => {
    signalingClient.send('SEND_CHAT', classroom.id, currentUser.uid, {
      text,
      senderName: currentUser.displayName,
      senderRole: currentUser.role,
      isAnnouncement
    });
  };

  const handleDeleteChatMessage = (messageId: string) => {
    signalingClient.send('DELETE_CHAT', classroom.id, currentUser.uid, { messageId });
  };

  const handleVotePoll = (pollId: string, optionId: string) => {
    signalingClient.send('VOTE_POLL', classroom.id, currentUser.uid, { pollId, optionId });
  };

  const handleSubmitQuizAnswer = (quizId: string, questionIndex: number, optionIndex: number) => {
    signalingClient.send('SUBMIT_QUIZ_ANSWER', classroom.id, currentUser.uid, {
      quizId,
      questionIndex,
      selectedOptionIndex: optionIndex
    });
  };

  const handleCreatePoll = (question: string, options: string[], durationSeconds: number) => {
    signalingClient.send('CREATE_POLL', classroom.id, currentUser.uid, {
      question,
      options,
      durationSeconds
    });
  };

  const handleCreateQuiz = (title: string, questions: QuizQuestion[]) => {
    signalingClient.send('CREATE_QUIZ', classroom.id, currentUser.uid, {
      title,
      questions
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      
      {/* 1. Top Header */}
      <Header
        classroom={classroom}
        user={currentUser}
        connectionStatus={connectionStatus}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onToggleFocusMode={() => setIsFocusMode(true)}
        onLeaveClassroom={() => setIsAuthOpen(true)}
      />

      {/* 2. Main Stage & Classroom Layout */}
      <main className="flex-1 flex overflow-hidden p-2 sm:p-4 gap-3 relative">
        
        {/* Left: Screen Share & Lecture Viewer Stage */}
        <section className="flex-1 flex flex-col min-w-0 h-full relative">
          <div className="flex-1 min-h-0 relative">
            <ScreenShareViewer
              stream={screenStream}
              isHostSharing={!!classroom.activeScreenShareUid || isSharingScreen}
              hostName={classroom.hostName}
              activeSpeaker={activeSpeaker}
              onStartShare={handleToggleScreenShare}
              isHostUser={isHost}
            />
          </div>

          {/* Student Bottom Floating Controls (Visible if role is Student) */}
          {!isHost && (
            <div className="mt-3 shrink-0">
              <StudentControlsBar
                myParticipant={myParticipant}
                isAudioMuted={isAudioMuted}
                canSpeak={myParticipant?.canSpeak ?? false}
                isHandRaised={myParticipant?.isHandRaised ?? false}
                isFocusMode={isFocusMode}
                isChatOpen={isMobileChatOpen}
                onToggleMic={handleToggleAudio}
                onToggleHandRaise={handleToggleHandRaise}
                onToggleFocusMode={() => setIsFocusMode(true)}
                onToggleChat={() => setIsMobileChatOpen(!isMobileChatOpen)}
                onOpenAI={() => setIsAIOpen(true)}
                onLeaveClassroom={() => setIsAuthOpen(true)}
              />
            </div>
          )}
        </section>

        {/* Right: Interactive Collapsible Sidebar (Chat / Host Dashboard / Polls / Participants) */}
        <aside className={`w-full md:w-80 lg:w-96 flex flex-col shrink-0 h-full transition-all duration-300 ${
          isMobileChatOpen ? 'fixed inset-0 z-40 bg-zinc-950 p-4 md:static md:p-0' : 'hidden md:flex'
        }`}>
          
          {/* Side Tabs Navigation */}
          <div className="flex items-center justify-between p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800 mb-2 shrink-0">
            {isHost && (
              <button
                onClick={() => setActiveSideTab('host')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeSideTab === 'host'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Host</span>
              </button>
            )}

            <button
              onClick={() => setActiveSideTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSideTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setActiveSideTab('polls')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSideTab === 'polls'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Polls</span>
            </button>

            <button
              onClick={() => setActiveSideTab('students')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSideTab === 'students'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>({participants.length})</span>
            </button>
          </div>

          {/* Tab Views */}
          <div className="flex-1 min-h-0">
            {activeSideTab === 'host' && isHost && (
              <HostControlsPanel
                classroom={classroom}
                participants={participants}
                isAudioMuted={isAudioMuted}
                isSharingScreen={isSharingScreen}
                isHostVerified={currentUser.isHostVerified ?? false}
                audioLevel={audioLevel}
                onToggleAudio={handleToggleAudio}
                onToggleScreenShare={handleToggleScreenShare}
                onMuteAll={handleMuteAll}
                onToggleLock={handleToggleLock}
                onToggleChat={handleToggleChat}
                onSendAttentionAlert={handleSendAttentionAlert}
                onApproveSpeaking={handleApproveSpeaking}
                onOpenPollModal={() => setIsCreatePollOpen(true)}
                onOpenQuizModal={() => setIsCreateQuizOpen(true)}
                onOpenAttendanceModal={() => setIsAttendanceOpen(true)}
                onVerifyHostCode={handleVerifyHostCode}
              />
            )}

            {activeSideTab === 'chat' && (
              <ChatPanel
                messages={chatMessages}
                chatEnabled={classroom.settings.chatEnabled}
                currentUserUid={currentUser.uid}
                currentUserRole={currentUser.role}
                onSendMessage={handleSendChatMessage}
                onDeleteMessage={handleDeleteChatMessage}
              />
            )}

            {activeSideTab === 'polls' && (
              <PollsAndQuizPanel
                polls={polls}
                quizzes={quizzes}
                currentUserUid={currentUser.uid}
                currentUserRole={currentUser.role}
                onVotePoll={handleVotePoll}
                onSubmitQuizAnswer={handleSubmitQuizAnswer}
                onCreatePollModal={() => setIsCreatePollOpen(true)}
                onCreateQuizModal={() => setIsCreateQuizOpen(true)}
              />
            )}

            {activeSideTab === 'students' && (
              <div className="flex flex-col h-full bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-3 overflow-y-auto space-y-2 custom-scrollbar">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1 py-1">
                  Active Participants ({participants.length})
                </div>
                {participants.map(p => (
                  <div key={p.uid} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                        {p.displayName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-semibold text-zinc-200 block truncate">
                          {p.displayName} {p.uid === currentUser.uid ? '(You)' : ''}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {p.role} • {p.pingMs}ms
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.isHandRaised && (
                        <Hand className="w-4 h-4 text-amber-400 fill-amber-400/40 animate-bounce" />
                      )}
                      {p.isAudioMuted ? (
                        <MicOff className="w-3.5 h-3.5 text-zinc-600" />
                      ) : (
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Close Button on Mobile Overlay */}
          {isMobileChatOpen && (
            <button
              onClick={() => setIsMobileChatOpen(false)}
              className="mt-3 w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 md:hidden"
            >
              Close Panel
            </button>
          )}
        </aside>
      </main>

      {/* 3. Global Modals & Overlays */}
      {/* Jaagte Raho 🔥 Attention Alert Modal */}
      <AttentionAlertModal
        alert={currentAttentionAlert}
        onDismiss={() => setCurrentAttentionAlert(null)}
      />

      {/* Distraction-Free Focus Mode Overlay */}
      <FocusModeOverlay
        isOpen={isFocusMode}
        onExit={() => setIsFocusMode(false)}
        classroomTitle={classroom.title}
      />

      {/* Attendance Log Modal */}
      <AttendanceModal
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
        records={attendanceRecords}
        classroomTitle={classroom.title}
      />

      {/* Connection & WebRTC Diagnostics Modal */}
      <ConnectionDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        stats={connectionStats}
        isConnected={connectionStatus.isConnected}
        reconnectCount={reconnectCount}
      />

      {/* AI Study Assistant Modal */}
      <AIStudyAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        classroomTitle={classroom.title}
        subject={classroom.subject}
      />

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={isCreatePollOpen}
        onClose={() => setIsCreatePollOpen(false)}
        onCreatePoll={handleCreatePoll}
      />

      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={isCreateQuizOpen}
        onClose={() => setIsCreateQuizOpen(false)}
        classroomTitle={classroom.title}
        onCreateQuiz={handleCreateQuiz}
      />

      {/* Auth & Switch Role Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onLogin={(newUser) => {
          setCurrentUser(newUser);
          setIsAuthOpen(false);
        }}
        onVerifyHostCode={handleVerifyHostCode}
      />

    </div>
  );
}
