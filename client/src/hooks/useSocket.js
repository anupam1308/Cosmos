import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

//const SOCKET_URL = 'http://localhost:3001';
const SOCKET_URL = 'https://cosmos-oizl.onrender.com';

export function useSocket(userConfig) {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState({});
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [myId, setMyId] = useState(null);
  const [myName, setMyName] = useState(null);

  useEffect(() => {
    if (!userConfig) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setMyId(newSocket.id);
      setMyName(userConfig.name);
      newSocket.emit('join', userConfig);
      newSocket.emit('get_recent_conversations', userConfig.name);
      newSocket.emit('get_activities');
    });

    newSocket.on('init_state', (initialUsers) => {
      const usersMap = {};
      initialUsers.forEach(u => {
        usersMap[u.id] = u;
      });
      setUsers(usersMap);
      
      // setup initial connections for myself
      const me = usersMap[newSocket.id];
      if (me && me.connectedWith) {
        setConnections(me.connectedWith);
      }
    });

    newSocket.on('user_joined', (user) => {
      setUsers(prev => ({ ...prev, [user.id]: user }));
      // Generate activity
      if (user.id !== newSocket.id) {
        setActivities(prev => [{
          id: Date.now(),
          text: `${user.name} joined the Cosmos`,
          timestamp: new Date().toISOString()
        }, ...prev]);
      }
    });

    newSocket.on('user_moved', ({ id, x, y }) => {
      setUsers(prev => ({
        ...prev,
        [id]: { ...prev[id], x, y }
      }));
    });

    newSocket.on('proximity_change', ({ action, users: involvedUsers }) => {
      if (involvedUsers.includes(newSocket.id)) {
        const otherId = involvedUsers.find(id => id !== newSocket.id);
        if (action === 'connected') {
          setConnections(prev => {
             if (!prev.includes(otherId)) return [...prev, otherId];
             return prev;
          });
        } else if (action === 'disconnected') {
          setConnections(prev => prev.filter(id => id !== otherId));
        }
      }
    });

    newSocket.on('chat_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      // Also update history in real-time so the modal is always fresh
      setRecentConversations(prev => [msg, ...prev]);
    });

    newSocket.on('user_left', (id) => {
      setUsers(prev => {
        const newUsers = { ...prev };
        const leftUser = newUsers[id];
        if (leftUser) {
           setActivities(act => [{
             id: Date.now(),
             text: `${leftUser.name} left the Cosmos`,
             timestamp: new Date().toISOString()
           }, ...act]);
        }
        delete newUsers[id];
        return newUsers;
      });
      setConnections(prev => prev.filter(connId => connId !== id));
    });

    newSocket.on('recent_conversations', (history) => {
      // Keep server's "newest first" order
      setRecentConversations(history);
    });

    newSocket.on('activities_history', (history) => {
      // Format activities for the UI (server sends DB objects)
      const formatted = history.map(h => ({
        id: h._id,
        text: h.text,
        timestamp: h.timestamp
      }));
      setActivities(formatted);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userConfig]);

  const move = useCallback((x, y) => {
    if (socket) {
      socket.emit('move', { x, y });
      setUsers(prev => ({
         ...prev,
         [socket.id]: { ...prev[socket.id], x, y }
      }));
    }
  }, [socket]);

  const sendMessage = useCallback((text) => {
    if (socket) {
      socket.emit('chat_message', text);
    }
  }, [socket]);

  return { socket, users, connections, messages, activities, recentConversations, isConnected, myId, myName, move, sendMessage };
}
