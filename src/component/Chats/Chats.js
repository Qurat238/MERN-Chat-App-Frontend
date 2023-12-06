import React, { useState }  from 'react';
import "./Chats.css";
import Sidebar from './ChatComponents/Sidebar/Sidebar';
import LeftSide from './ChatComponents/LeftSide/LeftSide';
import RightSide from "./ChatComponents/RightSide/RightSide";
import { ChatState } from "../../Context/ChatProvider.js";

const Chats = () => {

    const { user } = ChatState();
    const [ fetchAgain, setFetchAgain ] = useState(false); 

    return (
        <div className='chatsPage'>
            {user && <Sidebar/>}
            <div className='chatsSection'>
                {user && <LeftSide fetchAgain={fetchAgain}/>}
                {user && <RightSide fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
            </div>
        </div>
    );
}

export default Chats;
