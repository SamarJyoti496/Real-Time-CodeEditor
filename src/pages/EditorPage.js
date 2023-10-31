import React, { useEffect } from 'react'
import { useState, useRef } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import toast from 'react-hot-toast';

const EditorPage = () => {
  const location =  useLocation();
  const codeRef = useRef(null);
  const socketRef = useRef(null);
  const reactNavigator = useNavigate();
  const {roomId} = useParams();
  const [clients, setClients] = useState([]);

   
  
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
          console.log('socket error', e);
          toast.error('Socket connection failed, try again later.');
          reactNavigator('/');
      }

      socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          userName: location.state?.userName,
      });

      // Listening for joined event
      socketRef.current.on(
          ACTIONS.JOINED,
          ({ clients, userName, socketId }) => {
              if (userName !== location.state?.userName) {
                  toast.success(`${userName} joined the room.`);
                  console.log(`${userName} joined`);
              }
              
              socketRef.current.emit(ACTIONS.SYNC_CODE, {
                code :codeRef.current,
                socketId,});
                setClients(clients);
          }
      );

        // Listening for disconnected event
        socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, userName }) => {
            toast.success(`${userName} left the room.`);

            setClients((prevClients) =>
                prevClients.filter((client) => client.socketId !== socketId)
            );
        })
    }

    init();

    return () =>{
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
    }
  }, []); 

  async function copyRoomId(){
    try{
        await navigator.clipboard.writeText(roomId);
        toast.success('Room ID copied to clipboard');
    }catch(err){
        toast.error('Failed to copy room ID');
        console.error(err); 
    }
  }
  
   function leaveRoom(){
        reactNavigator('/');
    }
  if(!location.state){
    <Navigate to="/" />
  }
  


  return (
    <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/code-sync.png"
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                userName={client.userName}
                            />
                        ))}
                    </div>
                </div>

                <button className="btn copyBtn" 
                onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn"
                onClick={leaveRoom}>
                    Leave
                </button>
            </div>
            <div className="editorWrap">
              <Editor 
                socketRef = {socketRef}  
                roomId={roomId} 
                onCodeChange= {(code) =>{
                    codeRef.current = code;
                }}
              />
            </div>
        </div>
  )
}

export default EditorPage