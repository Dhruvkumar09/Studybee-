export type UserRole = 'OWNER' | 'HOST' | 'CO_HOST' | 'MODERATOR' | 'STUDENT';

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  role: UserRole;
  isHostVerified?: boolean;
}

export interface Participant {
  uid: string;
  displayName: string;
  role: UserRole;
  joinedAt: number;
  lastSeenAt: number;
  isAudioMuted: boolean;
  isHandRaised: boolean;
  canSpeak: boolean;
  isSharingScreen: boolean;
  connectionQuality: 'excellent' | 'good' | 'unstable' | 'poor';
  pingMs: number;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: number;
  isAnnouncement?: boolean;
  isSystem?: boolean;
}

export interface AttentionAlert {
  id: string;
  title: string;
  message: string;
  sentBy: string;
  timestamp: number;
  urgency: 'high' | 'urgent';
}

export interface PollOption {
  id: string;
  text: string;
  votesCount: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: number;
  durationSeconds: number;
  endsAt: number;
  isActive: boolean;
  userVotes: Record<string, string>; // uid -> optionId
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  timePerQuestionSeconds: number;
  isActive: boolean;
  currentQuestionIndex: number;
  userAnswers: Record<string, number[]>; // uid -> array of answered indices
  scores?: Record<string, number>; // uid -> score
}

export interface AttendanceRecord {
  uid: string;
  displayName: string;
  joinTime: number;
  leaveTime?: number;
  totalDurationSeconds: number;
  reconnects: number;
  status: 'active' | 'disconnected' | 'left';
}

export interface ClassroomSettings {
  isLocked: boolean;
  chatEnabled: boolean;
  studentMicAllowed: boolean;
  maxParticipants: number;
  requireApprovalToSpeak: boolean;
}

export interface Classroom {
  id: string;
  title: string;
  subject: string;
  hostUid: string;
  hostName: string;
  hostCodeRequired: boolean;
  createdAt: number;
  isActive: boolean;
  settings: ClassroomSettings;
  activeScreenShareUid?: string | null;
  activeSpeakerUid?: string | null;
}
