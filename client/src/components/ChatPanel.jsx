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

  if (!isVisible) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface/95 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col z-20 chat-enter-active">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/20 flex flex-col gap-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users size={20} className="text-primary" /> Proximity Chat
        </h2>
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
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <span className="text-xs text-white/50 mb-1">{msg.senderName}</span>
            <div className="bg-primary/20 bg-white/10 rounded-lg p-3 text-sm inline-block max-w-[90%] self-start border border-white/5">
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20">
        <div className="relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Say something nice..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary rounded-full hover:bg-blue-400 transition"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
