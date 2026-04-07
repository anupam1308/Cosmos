import React from 'react';
import { X, Clock, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

export function Modals({ activeModal, onClose, activities, recentConversations }) {
  if (!activeModal) return null;

  const handleClose = (e) => {
    if (e.target.id === 'modal-overlay') onClose();
  };

  return (
    <div 
      id="modal-overlay"
      className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
      onClick={handleClose}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
            {activeModal === 'activities' && <Clock size={20} className="text-blue-500" />}
            {activeModal === 'conversations' && <MessageSquare size={20} className="text-indigo-500" />}
            {activeModal === 'calendar' && <CalendarIcon size={20} className="text-purple-500" />}
            {activeModal === 'activities' ? 'Recent Activities' : 
             activeModal === 'conversations' ? 'Recent Conversations' : 'Today\'s Calendar'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-0 max-h-[60vh] overflow-y-auto">
          
          {/* ACTIVITIES */}
          {activeModal === 'activities' && (
            <div className="divide-y divide-slate-100">
              {activities.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No recent activities</div>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700 font-medium">{act.text}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* CONVERSATIONS */}
          {activeModal === 'conversations' && (
            <div className="divide-y divide-slate-100">
              {recentConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No recent conversations</div>
              ) : (
                recentConversations.map((msg) => (
                  <div key={msg._id || msg.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-slate-800">{msg.senderName}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 bg-slate-100/50 p-2 rounded inline-block mt-1">
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* CALENDAR */}
          {activeModal === 'calendar' && (
            <div className="p-4 space-y-3">
              <div className="border border-slate-200 rounded-lg p-3 border-l-4 border-l-blue-500 bg-white">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-slate-800">Daily Standup</h4>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">10:00 AM</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Dev Club Room</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-3 border-l-4 border-l-purple-500 bg-white opacity-50">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-slate-800">Product Sync</h4>
                  <span className="text-xs font-medium text-slate-500">1:00 PM</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Main Lobby</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-3 border-l-4 border-l-emerald-500 bg-white opacity-50">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-slate-800">Design Review</h4>
                  <span className="text-xs font-medium text-slate-500">3:30 PM</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">UI/UX Room</p>
              </div>
            </div>
          )}

        </div>
        
        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
