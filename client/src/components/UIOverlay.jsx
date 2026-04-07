import React, { useState } from 'react';
import { Rocket } from 'lucide-react';

export function UIOverlay({ isConnected, onJoin }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (isConnected) {
    return (
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-2xl font-bold flex items-center gap-2 drop-shadow-md">
          <Rocket className="text-primary animate-pulse" />
          Virtual Cosmos
        </h1>
        <p className="text-sm text-white/70 drop-shadow-md">Use WASD or Arrows to move. Find others to chat.</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="bg-surface border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Rocket size={32} className="text-primary" />
          <h1 className="text-2xl font-bold">Virtual Cosmos</h1>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Your Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/20 rounded-lg py-2.5 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-inner"
              placeholder="Enter name..."
              onKeyDown={(e) => {
                 if (e.key === 'Enter' && name.trim()) onJoin({ name, color });
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Avatar Color</label>
            <div className="flex gap-2 justify-between">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition ${color === c ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button 
            onClick={() => {
              if (name.trim()) onJoin({ name, color });
            }}
            disabled={!name.trim()}
            className="w-full bg-primary hover:bg-blue-400 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 mt-4"
          >
            Enter Cosmos
          </button>
        </div>
      </div>
    </div>
  );
}
