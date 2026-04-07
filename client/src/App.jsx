import React, { useState } from 'react';
import { CosmosCanvas } from './components/CosmosCanvas';
import { UIOverlay } from './components/UIOverlay';
import { ChatPanel } from './components/ChatPanel';
import { Sidebar } from './components/Sidebar';
import { Modals } from './components/Modals';
import { useSocket } from './hooks/useSocket';

function App() {
  const [userConfig, setUserConfig] = useState(null);
  const { 
    users, 
    connections, 
    messages, 
    activities,
    recentConversations, 
    isConnected, 
    myId, 
    move, 
    sendMessage 
  } = useSocket(userConfig);

  const [activeModal, setActiveModal] = useState(null);

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-slate-200 gap-px font-sans text-slate-900">
      {/* Left Sidebar */}
      {isConnected && (
        <Sidebar 
          users={users} 
          myId={myId} 
          activities={activities}
          recentConversations={recentConversations}
          onOpenModal={setActiveModal} 
        />
      )}

      {/* Main Cosmos Area (Center) */}
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

        {/* Global Modals (Still Absolute) */}
        <Modals 
          activeModal={activeModal} 
          onClose={() => setActiveModal(null)}
          activities={activities}
          recentConversations={recentConversations}
        />
      </div>

      {/* Proximity Chat Column (Right) */}
      {isConnected && (
        <ChatPanel 
          isVisible={connections.length > 0}
          connections={connections} 
          users={users}
          messages={messages}
          onSendMessage={sendMessage}
        />
      )}
    </div>
  );
}

export default App;
