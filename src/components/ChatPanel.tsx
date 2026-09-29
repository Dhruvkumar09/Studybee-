import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  Megaphone, 
  MessageSquareOff, 
  Sparkles, 
  ShieldAlert,
  Pin
} from 'lucide-react';
import type { ChatMessage, UserRole } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  chatEnabled: boolean;
  currentUserUid: string;
  currentUserRole: UserRole;
  onSendMessage: (text: string, isAnnouncement?: boolean) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  chatEnabled,
  currentUserUid,
  currentUserRole,
  onSendMessage,
  onDeleteMessage
}) => {
  const [inputText, setInputText] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHost = currentUserRole === 'HOST' || currentUserRole === 'CO_HOST';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), isHost && isAnnouncement);
    setInputText('');
    setIsAnnouncement(false);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden select-none">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/40">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-zinc-200 uppercase tracking-wider">
            Classroom Chat
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
            {messages.length}
          </span>
        </div>

        {!chatEnabled && (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
            <MessageSquareOff className="w-3 h-3" />
            Disabled by Host
          </span>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <p className="text-xs">No chat messages yet.</p>
            <p className="text-[11px] text-zinc-600 mt-1">Ask questions or discuss problems here.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderUid === currentUserUid;
            const isMsgHost = msg.senderRole === 'HOST' || msg.senderRole === 'CO_HOST';

            if (msg.isSystem) {
              return (
                <div key={msg.id} className="text-center my-1.5">
                  <span className="text-[10px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-800/60">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div 
                key={msg.id}
                className={`relative group rounded-xl p-2.5 transition-all ${
                  msg.isAnnouncement
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : isMe
                    ? 'bg-indigo-950/40 border border-indigo-700/30 ml-4'
                    : 'bg-zinc-950/60 border border-zinc-800/80 mr-4'
                }`}
              >
                {/* Header: Sender Name, Role & Timestamp */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-xs font-semibold text-zinc-200 truncate">
                      {msg.senderName}
                    </span>
                    {isMsgHost && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        TEACHER
                      </span>
                    )}
                    {msg.isAnnouncement && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">
                        <Pin className="w-2.5 h-2.5" /> PINNED
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {/* Message Body */}
                <p className="text-xs text-zinc-300 break-words leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* Host Delete Button on Hover */}
                {isHost && onDeleteMessage && (
                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="absolute top-2 right-2 p-1 rounded bg-zinc-900 hover:bg-rose-600/30 text-zinc-500 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-2.5 bg-zinc-950/80 border-t border-zinc-800/80">
        {!chatEnabled && !isHost ? (
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-500">
            Chat is muted by the host.
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-1.5">
            {isHost && (
              <div className="flex items-center gap-2 px-1">
                <label className="flex items-center gap-1.5 text-[11px] text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnnouncement}
                    onChange={(e) => setIsAnnouncement(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
                  />
                  <span>Post as Official Announcement</span>
                </label>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={isAnnouncement ? "Type pinned announcement..." : "Ask teacher or participate..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={500}
                className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all cursor-pointer shadow-md shadow-indigo-950"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
};
