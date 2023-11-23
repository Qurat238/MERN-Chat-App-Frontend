import React, { useEffect, useState } from 'react';
import './RightSide.css';
import { ChatState } from '../../../../Context/ChatProvider';
import UpdateGroupChat from './UpdateGroupChat';
import CloseIcon from "@mui/icons-material/Close";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import Loader from "../../../layout/Loader/Loader.js";
import axios from 'axios';
import Swal from "sweetalert2";
import icon from "../../../../images/icon.png";

import io from "socket.io-client";
const ENDPOINT = "http://localhost:4000";
var socket, selectedChatCompare;

const RightSide = ({fetchAgain, setFetchAgain}) => {

  const [ messages, setMessages ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ newMessage, setNewMessage ] = useState('');
  const [ socketConnected, setSocketConnected ] = useState(false);
  const [ typing, setTyping ] = useState(false);
  const [ isTyping, setIsTyping ] = useState(false);

  const { user, selectedChat, setSelectedChat } = ChatState();

  const getSenderName = (loggedUser, users) => {
      return users[0]._id === loggedUser.user._id ? users[1].name : users[0].name;
  }

  const getSenderAvatar = (loggedUser, users) => {
      return users[0]._id === loggedUser.user._id ? users[1].avatar.url : users[0].avatar.url;
  }

  const getAvatarOfOtherUsers = (m, loggedUser) => {
    return( 
        m.sender._id !== loggedUser.user._id
    );
  }

  const getSenderEmail = (loggedUser, users) => {
      return users[0]._id === loggedUser.user._id ? users[1].email : users[0].email;
  }

  const userProfileHandler = (e) => {
      let userProfile = document.getElementById('userProfile');
      let overlay3 = document.getElementById('overlay3');
      userProfile.style.display = 'block';
      overlay3.style.display = 'block';
  }

  const closeHandler = (e) => {
        let userProfile = document.getElementById('userProfile');
        let overlay3 = document.getElementById('overlay3');
        userProfile.style.display = 'none';
        overlay3.style.display = 'none';
  }

  const fetchMessages = async() => {
    if(!selectedChat) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/messages/${selectedChat._id}`);
      console.log(data)
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      Swal.fire({
        text: 'Failed to load the Messages',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  }
 
  const sendMessage = async(e) => {
    e.preventDefault();
    if(newMessage){
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers:{
            "Content-Type":"application/json"
          },
        }
        const { data } = await axios.post(
          "/api/v1/messages/",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        console.log(data);
        socket.emit("new message", data);
        setNewMessage("");
        setMessages([...messages, data]);
      } catch (error) {
        Swal.fire({
          text: 'Failed to send the Message',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    }
      
  }

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    //Typing Indicator Logic
    if(!socketConnected) return;
    if(!typing){
      setTyping(true);
      socket.emit("typing",selectedChat._id);
    }
    var initialTime = new Date().getTime();
    var timer = 3000;
    setTimeout(() => {
      var finalTime = new Date().getTime();
      var timeDiff = finalTime - initialTime;
      console.log(timeDiff)
      if(timeDiff >= timer && typing){
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    },timer);
  }

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user.user);
    socket.on("connection",() => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  },[])

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  },[selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessage) => {
      if(!selectedChatCompare || selectedChatCompare._id !== newMessage.chat._id){
        // Give notifications
      } else {
        setMessages([...messages, newMessage]);
      }
    });
  },[messages]);

  useEffect(() => {
    let chatContainer = document.getElementById('chatContainer');
    if(chatContainer){
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  },[messages])

  return (
    <div>
    {selectedChat ? (
      <div>
      <div className='rightSide'>
      <div className='userName'>
        {/* <ArrowBackIcon onClick={() => setSelectedChat("")}/> */}
          {!selectedChat.isGroupChat ? (
            <div className='chatHeader'>
              <div className='chatHeaderBox'>
              <img src={getSenderAvatar(user, selectedChat.users)} alt='User Avatar'/>
              <h1>{getSenderName(user, selectedChat.users)}</h1>
              </div>
              
              <div>
                <button onClick={userProfileHandler}><VerifiedUserIcon/></button>
                <div id='overlay3'>
                  <div id='userProfile'>
                    <button id='close' onClick={closeHandler}><CloseIcon/></button>
                    <div>
                      <h1>{getSenderName(user, selectedChat.users)}</h1>
                      <img src={getSenderAvatar(user, selectedChat.users)} alt='User Avatar'/>
                      <p>{getSenderEmail(user, selectedChat.users)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='chatHeader'>
              <div className='chatHeaderBox'>
              <img src={icon} alt='Group Icon'/>
              <h1>{selectedChat.chatName.toUpperCase()}</h1>
              </div>
              <div>
                <UpdateGroupChat
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </div>
            </div>
          )}
      </div>
      <div className='messages'>
        {loading ? (
          <Loader/>
        ) : (
          <div className='logic' id='chatContainer'>
            {messages && messages.map((m,i) => (
            <div>
              {selectedChat.isGroupChat ? (
                 <div className='groupIconsContainer'>
                    {m.sender._id !== user.user._id ? (
                      <div className='groupIcons'>
                        <div className='groupIconsBox'>
                          {(getAvatarOfOtherUsers(m,user)) && (<img src={m.sender.avatar.url} alt='Prfile Pic'/>)}
                          <p className={m.sender._id === user.user._id ? "me" : "you"}>{m.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className='groupIcons'>
                        <p className={m.sender._id === user.user._id ? "me" : "you"}>{m.content}</p>
                      </div>
                    )} 
                 </div>
              ) : (
                <div className='groupIconsContainer'>
                  <p className={m.sender._id === user.user._id ? "me" : "you"}>{m.content}</p>
                </div>
              )}
            </div>
            ))}            
          </div>
        )}
      </div>
      <form className='write'>
        {isTyping ? <div style={{backgroundColor:"aqua", zIndex:"1"}}>...Loading</div> : <></>}
        <input id='messageInput' onChange={typingHandler} required={true} value={newMessage} placeholder='Type a Message...' type='text' style={{fontSize:"2rem", paddingLeft:"1rem"}}/>
        <button onClick={sendMessage}>Send</button>
      </form>
    </div>
    </div>
    ) : (
      <div className='noSelectedChatTextContainer'>
        <p>Click on a User to start Chatting</p>
      </div>
    )}
    </div>
  )
}

export default RightSide
