import React, { useState, useEffect } from 'react';
import icon from "../../../../images/icon.png";
import "./Profiles.css";
import { ChatState } from '../../../../Context/ChatProvider';
import Swal from "sweetalert2";
import axios from 'axios';
import SearchedResultLoading from '../Sidebar/SearchedResultLoading.js';
import { IconButton } from '@mui/material';
import { LeftSideVanish }  from "../LeftSide/LeftSide.js";
import { RightSideAppear } from "../RightSide/RightSide.js";

const Profiles = ({fetchAgain}) => {

   const [loggedUser, setLoggedUser] = useState();
   const { selectedChat, setSelectedChat, chats, setChats } = ChatState();

   const fetchChats = async() => {
      try {
         const { data } = await axios.get(`https://mern-chat-app-backend-three.vercel.app/api/v1/chats/`);
         setChats(data);
      } catch (error) {
         Swal.fire({
         text: 'Error fetching the chat',
         icon: 'error',
         confirmButtonText: 'Ok',
         customClass: 'swal-wide'
      });
      }
   }

   const getSenderName = (loggedUser, users) => {
      return users[0]._id === loggedUser.user._id ? users[1].name : users[0].name;
   }

   const getSenderImage = (loggedUser, users) => {
      return users[0]._id === loggedUser.user._id ? users[1].avatar.url : users[0].avatar.url;
   }

   const SmallScreenHandler = () => {
         if(window.innerWidth < 441){
            LeftSideVanish();
            RightSideAppear();
         }
   }

   useEffect(() => {
      setLoggedUser(JSON.parse(localStorage.getItem("Info")));
      fetchChats();
      console.log(chats);
   },[fetchAgain])

  return (
    <div>
      {chats ? (
         <div className='profilesSection'>
            {chats.map((chat) => (
               <div className={selectedChat === chat ? 'profileSelected' : 'profile'} key={chat._id} onClick={() => {setSelectedChat(chat); SmallScreenHandler()}}>
                  {loggedUser && (
                     <div className='info'>
                        <div className='profilePic'>
                           <img style={{backgroundColor:"white"}} src={!chat.isGroupChat ? getSenderImage(loggedUser, chat.users) : `${icon}`}/>
                           {/* <div className={chat.isGroupChat ? "not" : "dot"}></div> */}
                        </div>
                        <div key={chat._id} className='profileInfo'>
                           <h1>{!chat.isGroupChat ? getSenderName(loggedUser, chat.users) : chat.chatName}</h1>
                           {/* <div>
                              <p>This is a test message</p>
                              <div className='tick'><CheckIcon/><CheckIcon/></div>
                           </div> */}
                        </div>
                     </div>
                  )}        
               </div>
            ))};
         </div>
      ) : (
         <SearchedResultLoading/>
      )}
    </div>
  )
}

export default Profiles
