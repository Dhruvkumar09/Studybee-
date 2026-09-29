import React from 'react';
import { ClipboardList, X, Download, UserCheck, Clock, RefreshCw } from 'lucide-react';
import type { AttendanceRecord } from '../types';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AttendanceRecord[];
  classroomTitle: string;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  records,
  classroomTitle
}) => {
  if (!isOpen) return null;

  const exportCSV = () => {
    const headers = ['UID', 'Student Name', 'Join Time', 'Leave Time', 'Duration (Minutes)', 'Reconnects', 'Status'];
    const rows = records.map(r => [
      r.uid,
      `"${r.displayName}"`,
      new Date(r.joinTime).toISOString(),
      r.leaveTime ? new Date(r.leaveTime).toISOString() : 'Still Active',
      (r.totalDurationSeconds / 60).toFixed(1),
      r.reconnects,
      r.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StudyLive_Attendance_${classroomTitle.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Lecture Attendance Log</h3>
              <p className="text-xs text-zinc-400">{records.length} Total Attendees Recorded</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {records.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No participants recorded in this session yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="pb-2.5 pl-2">Participant</th>
                  <th className="pb-2.5">Join Time</th>
                  <th className="pb-2.5">Duration</th>
                  <th className="pb-2.5">Reconnects</th>
                  <th className="pb-2.5 pr-2">Presence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {records.map(record => (
                  <tr key={record.uid} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 pl-2 font-medium text-zinc-200">
                      {record.displayName}
                    </td>
                    <td className="py-3 text-zinc-400 font-mono">
                      {new Date(record.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 text-zinc-300 font-mono">
                      {formatDuration(record.totalDurationSeconds)}
                    </td>
                    <td className="py-3 text-zinc-400 font-mono">
                      {record.reconnects}
                    </td>
                    <td className="py-3 pr-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        record.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                        {record.status === 'active' ? 'Online' : 'Disconnected'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};
