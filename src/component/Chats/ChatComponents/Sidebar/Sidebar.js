import React, { useState } from 'react';
import "./Sidebar.css";
import SearchIcon from "@mui/icons-material/Search";
// import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../../../layout/Loader/Loader.js";
import icon from "../../../../images/icon.png";
import { ChatState } from '../../../../Context/ChatProvider';
import axios from "axios";
import SearchResultList from './SearchResultList';
import SearchedResultLoading from './SearchedResultLoading';

const Sidebar = () => {

    const navigate = useNavigate();

    const { user, chats, setChats, setSelectedChat } = ChatState();

    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();

    // const NotificationHandler = (e) => {
    //     navigate("/notifications");
    // }

    const ProfileHandler = (e) => {
        let profile = document.getElementById('profile');
        let overlay1 = document.getElementById('overlay1');
        profile.style.display = 'block';
        overlay1.style.display = 'block';
    }

    const LogoutHandler = (e) => {
        localStorage.removeItem("Info");
        navigate("/");
        Swal.fire({
            text: 'Logged Out Successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: 'swal-wide'
        });
    }

    const SearchHandler = (e) => {
        let sidePanel = document.getElementById('sidePanel');
        let overlay = document.getElementById('overlay');
        sidePanel.style.left='0';
        overlay.style.display = 'block';
    }

    const handleSearch = async() => {
        if(!search){
            Swal.fire({
            text: 'Please enter something',
            icon: 'error',
            confirmButtonText: 'Ok',
            customClass: 'swal-wide'
            });
            return;
        }
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/v1/users?search=${search}`);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            Swal.fire({
            text: 'Failed to load the search result',
            icon: 'error',
            confirmButtonText: 'Ok',
            customClass: 'swal-wide'
        })
    }}
    
    const accessChat = async(userId) => {
        try {
            setLoadingChat(true);
            const config = {
                headers:{
                    "Content-Type":"application/json"
                },
            }
            const { data } = await axios.post(`https://mern-chat-app-backend-three.vercel.app/api/v1/chats/`, { userId }, config);
            if(!chats.find((e) => (e._id === data._id))){
                setChats([data, ...chats]);        
            }
            setSelectedChat(data);
            setLoadingChat(false);
            let sidePanel = document.getElementById('sidePanel');
            let overlay = document.getElementById('overlay');
            if(window.innerWidth < 360){
                sidePanel.style.left='-100vw'
            } else if(window.innerWidth < 768) {
                sidePanel.style.left='-40vw';
            } else{
                sidePanel.style.left='-25vw'
            }
            overlay.style.display = 'none';
        } catch (error) {
            Swal.fire({
            text: 'Error fetching the chat',
            icon: 'error',
            confirmButtonText: 'Ok',
            customClass: 'swal-wide'
            })
        }
    }

    const closeHandler = (e) => {
        let sidePanel = document.getElementById('sidePanel');
        let profile = document.getElementById('profile');
        let overlay = document.getElementById('overlay');
        let overlay1 = document.getElementById('overlay1');
        if(window.innerWidth < 360){
            sidePanel.style.left='-100vw';
        } else if(window.innerWidth < 768){
            sidePanel.style.left='-40vw';
        } else {
            sidePanel.style.left='-25vw';
        }
        profile.style.display = 'none';
        overlay.style.display = 'none';
        overlay1.style.display = 'none';
    }

  return (
    <div className='sidebarContainer'>
        <div className='search'>
            <button onClick={SearchHandler}><SearchIcon/></button>
            <div id='sidePanel'>
                <button id='close' onClick={closeHandler}><CloseIcon/></button>
                <div className='searchSection'>
                    <input type='search' placeholder='Search by name or email' value={search}  onChange={(e) => setSearch(e.target.value)} />
                    <button onClick={handleSearch}><SearchIcon/></button>
                </div>
                {loading ? (
                    <SearchedResultLoading/>
                ) : (
                    searchResult?.map((user) => (
                        <SearchResultList 
                            user={user}
                            key={user._id}
                            handleFunction={() => accessChat(user._id)}
                        />
                    ))
                )}
                {loadingChat && <Loader/>}
            </div>
            <div id='overlay'></div>
        </div>
        <div className='options'>
            {/* <button onClick={NotificationHandler}><NotificationsIcon/></button> */}
            <button onClick={ProfileHandler}><PersonIcon/></button>
            <div id='overlay1'>
                <div id='profile'>
                <button id='close' onClick={closeHandler}><CloseIcon/></button>
                <div>
                    <h1>{user && user.user.name}</h1>
                    <img src={user.user.avatar ? user.user.avatar.url : icon} alt='profile'/>
                    <p>{user && user.user.email}</p>
                </div>
            </div>
            </div>
            <button className='logoutBtn' onClick={LogoutHandler}><ExitToAppIcon/></button>
        </div>
    </div>
  )
}

export default Sidebar;
