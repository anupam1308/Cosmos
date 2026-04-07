import React, { useState } from 'react';
import { CosmosCanvas } from './components/CosmosCanvas';
import { UIOverlay } from './components/UIOverlay';
import { ChatPanel } from './components/ChatPanel';
import { Sidebar } from './components/Sidebar';
import { useSocket } from './hooks/useSocket';

function App() {
  const [userConfig, setUserConfig] = useState(null);
  const { 
    users, 
    connections, 
    messages, 
    isConnected, 
    myId, 
    move, 
    sendMessage 
  } = useSocket(userConfig);

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#f3f4f6] font-sans text-slate-900">
      {/* Left Sidebar */}
      {isConnected && (
        <Sidebar users={users} myId={myId} />
      )}

      {/* Main Cosmos Area */}
      <div className="flex-1 relative overflow-hidden bg-slate-900">
        {isConnected && (
          <CosmosCanvas 
            users={users} 
            myId={myId} 
            onMove={move} 
          />
        )}

        {/* UI Overlay (Login Screen) */}
        <UIOverlay 
          isConnected={isConnected} 
          onJoin={(config) => setUserConfig(config)} 
        />

        {/* Proximity Chat Layer */}
        <ChatPanel 
          isVisible={connections.length > 0}
          connections={connections} 
          users={users}
          messages={messages}
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  );
}

export default App;
