import React, { useState, useEffect, useRef } from 'react';
import { Send, Users } from 'lucide-react';

export function ChatPanel({ connections, messages, onSendMessage, users, isVisible }) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <div className={`${isVisible ? 'w-96' : 'w-86'} h-full bg-surface/95 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col z-20 text-white transition-all duration-500 ease-in-out`}>
      {/* Header */}
      <div className="p-5 border-b border-white/10 bg-black/20 flex flex-col gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users size={22} className="text-primary" />   Chats
        </h2>
        {isVisible ? (
          <>
            <div className="flex -space-x-2">
              {connections.map(id => {
                const u = users[id];
                if (!u) return null;
                return (
                  <div 
                    key={id} 
                    className="w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: u.color }}
                    title={u.name}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-white/50">{connections.length} user(s) nearby</div>
          </>
        ) : (
          <div className="text-xs text-white/30 italic">Find someone to start a conversation</div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!isVisible ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-30">
            <Users size={48} className="mb-4" />
            <p className="text-sm">Move closer to other users to join their conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col group animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-[11px] font-semibold text-white/40 mb-1 ml-1 uppercase tracking-wider">{msg.senderName}</span>
              <div className="bg-white/10 rounded-2xl rounded-tl-none p-3.5 text-[0.95rem] leading-relaxed text-white inline-block max-w-[90%] self-start border border-white/5 shadow-sm group-hover:bg-white/15 transition-colors">
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20">
        <div className="relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isVisible ? "Say something nice..." : "Nobody is nearby..."}
            disabled={!isVisible}
            className="w-full bg-white/5 border border-white/10 rounded-full py-10 pl-4 pr-10 text-lg text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition disabled:opacity-30 disabled:cursor-not-allowed"
          />
          <button 
            type="submit" 
            disabled={!isVisible || !text.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary rounded-full hover:bg-blue-400 transition disabled:opacity-30"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
