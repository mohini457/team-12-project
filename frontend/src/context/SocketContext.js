import React, { createContext, useEffect, useState, useContext } from 'react';
import io from 'socket.io-client';
import AuthContext from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const newSocket = io(API_URL);
      
      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
      };
    }
  }, [user]);

  const subscribeToParkingLot = (lotId) => {
    if (socket) {
      socket.emit('subscribe-parking-lot', lotId);
    }
  };

  const unsubscribeFromParkingLot = (lotId) => {
    if (socket) {
      socket.emit('unsubscribe-parking-lot', lotId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, subscribeToParkingLot, unsubscribeFromParkingLot }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;

