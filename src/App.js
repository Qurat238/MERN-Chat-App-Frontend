import './App.css';
import { Routes, Route} from "react-router-dom";
import LoginSignup from './component/User/LoginSignup';
import Chats from "./component/Chats/Chats";

function App() {

  return (
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/chats" element={<Chats />} />
      </Routes>
  );
}

export default App;
