import React, { useState } from 'react';
import "./UpdateGroupChat.css";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { ChatState } from '../../../../Context/ChatProvider';
import SearchIcon from "@mui/icons-material/Search";
import axios from 'axios';
import Swal from "sweetalert2";
import SearchedResultLoading from '../Sidebar/SearchedResultLoading';

const UpdateGroupChat = ({fetchMessages, fetchAgain, setFetchAgain}) => {

  const { selectedChat, setSelectedChat, user } = ChatState();

  const [groupChatName, setGroupChatName] = useState("");
  const [groupChatSearch, setGroupChatSearch] = useState("");
  const [groupChatSearchedUsers, setGroupChatSearchedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const updateGroupHandler = () => {
    let editGroup = document.getElementById('editGroup');
    let overlay4 = document.getElementById('overlay4');
    editGroup.style.display = 'block';
    overlay4.style.display = 'block';
  }
  const closeHandler = () => {
    let editGroup = document.getElementById('editGroup');
    let overlay4 = document.getElementById('overlay4');
    editGroup.style.display = 'none';
    overlay4.style.display = 'none';
  }

  //Function to remove a user
  const removeUserHandler = async(userToRemove) => {
    if(selectedChat.groupAdmin._id !== user.user._id && userToRemove._id !== user.user._id){
    Swal.fire({
      text: 'Only Admin Can Remove Someone',
      icon: 'error',
      confirmButtonText: 'Ok'
    });
    return;
    }
    try {
      setLoading(true);
      const config = {
        headers:{
          "Content-Type":"application/json"
        },
      }
      const { data } = await axios.put(
        '/api/v1/chats/remove',
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        config
      );
      userToRemove._id === user.user._id ? setSelectedChat() : setSelectedChat(data);
      fetchMessages();
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      Swal.fire({
        text: error.response.data.message,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      setLoading(false);
    }
  }

  const handleRename = async() => {
    if(!groupChatName) return;
    try {
      setRenameLoading(true);
      const config = {
        headers:{
          "Content-Type":"application/json"
        },
      }
      const { data } = await axios.put(
        '/api/v1/chats/rename',
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      Swal.fire({
        text: error.response.data.message,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  }

  const handleAdd = async() => {
        if(!groupChatSearch){
            Swal.fire({
            text: 'Please enter something',
            icon: 'error',
            confirmButtonText: 'Ok'
            });
            return;
        }
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/v1/users?search=${groupChatSearch}`);
            setLoading(false);
            let newUserSearchedResult = document.getElementById('newUserSearchedResult');
            newUserSearchedResult.style.display = 'block';
            setGroupChatSearchedUsers(data);
        } catch (error) {
            Swal.fire({
            text: 'Failed to load the search result',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
    }}

  const onClickHandler = () => {
    let newUserSearchedResult = document.getElementById('newUserSearchedResult');
    newUserSearchedResult.style.display = 'none';
  }

  const addUserHandler = async(userToAdd) => {
    if(selectedChat.users.find((u) => u._id === userToAdd._id)){
      Swal.fire({
        text: 'User Already In Group',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }
    if(selectedChat.groupAdmin._id !== user.user._id){
      Swal.fire({
        text: 'Only Admin Can Add Someone',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    return;
    }
    try {
      setLoading(true);
      const config = {
        headers:{
          "Content-Type":"application/json"
        },
      }
      const { data } = await axios.put(
        '/api/v1/chats/add',
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      Swal.fire({
        text: error.response.data.message,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      setLoading(false);
    }
  }

  // const searchedUsersHandler = (user) => {
  //   setGroupChatSelectedUsers([user, ...groupChatSelectedUsers]);
  // }

  const getUniqueUsers = (users) => {
    const uniqueUsers = [];
    const uniqueUserIds = new Set();

    users.forEach((user) => {
      if (!uniqueUserIds.has(user._id)) {
        uniqueUserIds.add(user._id);
        uniqueUsers.push(user);
      }
    });

    return uniqueUsers;
  };

  return (
    <div className='groupSetting'>
      <button onClick={updateGroupHandler}><SettingsIcon/></button>
      <div id='overlay4'>
        <div id='editGroup' onClick={onClickHandler}>
          <button id='close' onClick={closeHandler}><CloseIcon/></button>
            <div>
              <h1>{selectedChat.chatName}</h1>
              <div className='oldUsers'>
                {getUniqueUsers(selectedChat.users).map((u) => (
                  <div key={u._id}>
                    <p>{u.name}<CloseIcon onClick={() => removeUserHandler(u)}/></p>
                  </div>
                ))}
              </div>
              <div className='renameGroup'>
                <input type='text' placeholder="Group Name" value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)}/>
                <button onClick={handleRename}><EditIcon/></button>
              </div>
              <div className='userEditSection'>
                <input type='search' placeholder='Add User To Group'  value={groupChatSearch} onChange={(e) => setGroupChatSearch(e.target.value)}/>
                <button onClick={handleAdd}><SearchIcon/></button>
              </div>
              <div className='newUserSearchedResultContainer'>
                <div id='newUserSearchedResult'>
                {loading ? (
                  <SearchedResultLoading/>
                  ) : (
                    groupChatSearchedUsers?.map((user) => (
                      <div className='newUserSearched' onClick={() => addUserHandler(user)} style={{cursor:"pointer"}} key={user._id}>
                        <img src={user.avatar.url} alt='new user pic'/>
                        <div className='newUserSearchedInfo'>
                          <h1>{user.name}</h1>
                          <p>{user.email}</p>
                        </div>
                      </div>
                    ))
                  )}
              </div>
              </div>
              <button className='leaveGroupBtn' onClick={() => removeUserHandler(user.user)}>Exit</button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateGroupChat;
