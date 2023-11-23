import React, { useState } from 'react';
import './LeftSide.css';
import Profiles from './Profiles';
import { ChatState } from '../../../../Context/ChatProvider';
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import SearchIcon from "@mui/icons-material/Search";
import axios from 'axios';
import SearchedResultLoading from '../Sidebar/SearchedResultLoading';

const LeftSide = ({fetchAgain}) => {

  const { chats, setChats } = ChatState();

  const [groupChatName, setGroupChatName] = useState("");
  const [groupChatSelectedUsers, setGroupChatSelectedUsers] = useState([]);
  const [groupChatSearch, setGroupChatSearch] = useState("");
  const [groupChatSearchedUsers, setGroupChatSearchedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const createGroupChatHandler = (e) => {
        let createGroupChat = document.getElementById('createGroupChat');
        let overlay2 = document.getElementById('overlay2');
        createGroupChat.style.display = 'block';
        overlay2.style.display = 'block';
  }

  const closeChatHandler = (e) => {
        let createGroupChat = document.getElementById('createGroupChat');
        let overlay2 = document.getElementById('overlay2');
        createGroupChat.style.display = 'none';
        overlay2.style.display = 'none';
  }

  const searchedUsersHandler = (user) => {
    setGroupChatSelectedUsers([user, ...groupChatSelectedUsers]);
  }


    const groupChatSearchHandler = async() => {
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
            let userSearchedResult = document.getElementById('userSearchedResult');
            userSearchedResult.style.display = 'block';
            setGroupChatSearchedUsers(data);
        } catch (error) {
            Swal.fire({
            text: 'Failed to load the search result',
            icon: 'error',
            confirmButtonText: 'Ok'
        })
    }}

  //Function to remove a user
  const userRemoved = (delUser) => {
    setGroupChatSelectedUsers(
      groupChatSelectedUsers.filter((user) => user._id !== delUser._id)
    );
  }

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

  const onClickHandler = () => {
    let userSearchedResult = document.getElementById('userSearchedResult');
    userSearchedResult.style.display = 'none';
  }

  const submitHandler = async() => {
    if(!groupChatName || !groupChatSelectedUsers) {
      Swal.fire({
        text: 'Please fill all the fields',
        icon: 'error',
        confirmButtonText: 'Ok'
    });
    return;
  }
  try {
    const config = {
      headers:{
        "Content-Type":"application/json"
      },
    }
    const { data } = await axios.post(
      "/api/v1/chats/group",
      {
        name: groupChatName,
        users: JSON.stringify(groupChatSelectedUsers.map((u) => u._id)),
      },
      config
    );
    setChats([data, ...chats]);
    let createGroupChat = document.getElementById('createGroupChat');
    let overlay2 = document.getElementById('overlay2');
    createGroupChat.style.display = 'none';
    overlay2.style.display = 'none';
    Swal.fire({
        text: 'New Group Chat Created Successfully',
        icon: 'success',
        confirmButtonText: 'Ok'
    });
  } catch (error) {
    Swal.fire({
        text: 'Failed to create the Chat',
        icon: 'error',
        confirmButtonText: 'Ok'
    });
  }
}

  return (
    <div className='leftSide'>
      <div className='createGroup'>
          <button style={{cursor:"pointer"}} onClick={createGroupChatHandler}>Create New Group +</button>
          <div id='overlay2'>
                <div onClick={onClickHandler} id='createGroupChat'>
                <button id='closeChat' onClick={closeChatHandler}><CloseIcon/></button>
                <div>
                    <h1>Create Group</h1>
                    <div className='groupName'>
                      <input type='text' placeholder="Group Name" value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)}/>
                    </div>
                    <div className='userSearchSection'>
                      <input type='search' placeholder='Search Users' value={groupChatSearch} onChange={(e) => setGroupChatSearch(e.target.value)}/>
                      <button onClick={groupChatSearchHandler}><SearchIcon/></button>
                    </div>
                    <div className='userSearchResultContainer'>
                    <div id='userSearchedResult'>
                        {loading ? (
                          <SearchedResultLoading/>
                        ) : (
                          groupChatSearchedUsers?.map((user) => (
                            <div className='userSearched' onClick={() => searchedUsersHandler(user)} style={{cursor:"pointer"}} key={user._id}>
                              <img src={user.avatar.url} alt='user pic'/>
                              <div className='userSearchedInfo'>
                                <h1>{user.name}</h1>
                                <p>{user.email}</p>
                              </div>
                            </div>
                          ))
                        )}
                    </div>
                    <div className='userSelectedResult'>
                      {getUniqueUsers(groupChatSelectedUsers)?.map((u) => (
                        <div key={u._id}>
                            <p>{u.name}<CloseIcon onClick={() => userRemoved(u)}/></p>
                        </div>
                      ))
                      }
                    </div>
                    <button onClick={submitHandler} className='createGroupBtn'>Create Group</button>
                    </div>
                </div>
            </div>
            </div>
      </div>
      <div>
        <Profiles fetchAgain={fetchAgain} />
      </div>
    </div>
  )
}

export default LeftSide;
