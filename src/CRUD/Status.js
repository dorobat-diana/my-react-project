
import React, { useState, useEffect } from 'react';
import {socket} from '../Service/Service';
import { Offline, Online } from 'react-detect-offline';

function Status() {
  const [serverStatus, setServerStatus] = useState('Checking...');

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Adjust the URL to match your WebSocket server's endpoint
        socket.onopen = () => {
          console.log('WebSocket Client Connected');
          setServerStatus('Server is up and running.');
        };
        socket.onerror = () => {
          setServerStatus('Error connecting to server.');
        };

        socket.onclose = () => {
          setServerStatus('WebSocket connection closed.');
        };
      } catch (error) {
        setServerStatus('Error connecting to server.');
      }
    };

    checkServerStatus();

    // Clean up socket event listeners
    return () => {
      socket.onopen = null;
      socket.onerror = null;
      socket.onclose = null;
    };
  }, []);


  return (
    <div>
      <h1>Server Status</h1>
      <p>{serverStatus}</p>
      
      <h1>Internet Connection</h1>
      <Online>
        <p>Online</p>
      </Online>
      <Offline>
        <p>Offline</p>
      </Offline>
      
      {/* Your other component content */}
    </div>
  );
}

export default Status;
