import React from 'react'
import {v4 as uuid} from 'uuid'
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id);

    //toast
    toast.success('Room Created Successfully');
  }

  const joinRoom = (e) => {
    e.preventDefault();
    if(!roomId || !userName){
      toast.error('Please Fill All The Fields');
      return;
    }

    navigate(`/editor/${roomId}`, {
      state:{
        userName,
      }
    })
    toast.success('Room Joined Successfully');
  }
  
  const handleInputEnter = (e) => {
    if(e.key === 'Enter'){
      joinRoom(e);
    }
  }
  return (
    <div className='homePageWrapper'>
        <div className='formWrapper'>
          <img src='/code-sync.png' alt='code-sync' className='homePageLogo' />
          <h4 className='mainLabel'>Paste Invitation ROOM ID</h4>
          <div className='inputGroup'>
               <input type='text' className="inputBox" placeholder='ROOM ID' 
                 onChange={(e) => setRoomId(e.target.value)}
                 value={roomId}
                 onKeyUp={handleInputEnter}
                />
               <input type='text' className="inputBox" placeholder='USERNAME' 
                 onChange={(e) => setUserName(e.target.value)}
                 value={userName}
                 onKeyUp={handleInputEnter}
               />

               
               <button className='btn joinBtn' onClick={joinRoom}>JOIN</button>

               <span className='createInfo' >
                    If you don't have an invite the create &nbsp;
                    <a onClick={createNewRoom} href='' className='createNewBtn'>new room</a>
               </span>
          </div>
        </div>

        <footer>
               <h4>
                    Built with 💛 &nbsp;by &nbsp;
                    <a href=''>siamjotry</a>
               </h4>
        </footer>
    </div>
  )
}

export default Home