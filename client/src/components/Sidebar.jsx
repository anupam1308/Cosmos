import React from 'react';
import { 
  Search, Bell, MessageSquare, Calendar, 
  Map, PhoneCall, Users, ChevronDown 
} from 'lucide-react';

export function Sidebar({ users, myId }) {
  // Convert users object to an array for easy mapping
  const connectedUsers = Object.values(users);

  return (
    <aside className="w-64 h-full bg-slate-50 border-r border-slate-200 flex flex-col shadow-sm">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full pl-9 pr-4 py-2 bg-slate-200/50 rounded-md text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-slate-300 transition-all border border-transparent focus:border-slate-300"
          />
        </div>
      </div>

      {/* Scrollable Menu Area */}
      <div className="flex-1 overflow-y-auto pt-4 pb-4">
        
        {/* Top Menus */}
        <div className="px-3 mb-6 space-y-1">
          <MenuItem icon={<Bell size={18} />} label="Activities" badge={1} />
          <MenuItem icon={<MessageSquare size={18} />} label="Recent Conversations" badge={1} />
          <MenuItem icon={<Calendar size={18} />} label="Today's Calendar" />
        </div>

        {/* Rooms Section */}
        <div className="px-3 mb-6">
          <SectionHeader title="Rooms" />
          <div className="space-y-1 mt-1">
            <MenuItem icon={<Map size={18} />} label="Dev Club" isActive />
            <MenuItem icon={<PhoneCall size={18} />} label="Start New Call" />
          </div>
        </div>

        {/* Team Section (Dynamic Users) */}
        <div className="px-3">
          <SectionHeader title="Team" />
          <div className="space-y-2 mt-2">
            {connectedUsers.map(user => {
              const isMe = user.id === myId;
              return (
                <div key={user.id} className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-100 rounded-md cursor-pointer transition-colors group">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-white uppercase relative"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0)}
                    {/* Tiny green online indicator dot */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {user.name} {isMe && <span className="text-slate-400 font-normal">(me)</span>}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">Guest</span>
                  </div>
                </div>
              );
            })}
            
            {connectedUsers.length === 0 && (
              <div className="text-xs text-slate-400 px-2 py-2 italic flex justify-center">
                No team members online
              </div>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}

// Helper generic components for clean code reading
function MenuItem({ icon, label, badge, isActive }) {
  return (
    <button className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
      isActive ? 'bg-slate-200 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}>
      <div className="flex items-center gap-3">
        <span className={isActive ? 'text-slate-800' : 'text-slate-500'}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </button>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center justify-between px-3 py-1 group cursor-pointer">
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
      <ChevronDown size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
