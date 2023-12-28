import React, { Fragment , useRef , useState, useEffect } from "react";
import {Link} from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Loader from "../layout/Loader/Loader";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import FaceIcon from "@mui/icons-material/Face";
import axios from "axios";
import "./LoginSignup.css";
import Swal from 'sweetalert2';

const LoginSignup = () => {
    const loginTab = useRef(null);
    const registerTab = useRef(null);
    const switcherTab = useRef(null);

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [avatar, setAvatar] = useState();
    const [avatarPreview, setAvatarPreview] = useState("/profile.png");

    const [user , setUser] = useState({
        name:"",
        email:"",
        password:""
    })

    const {name, email, password} = user;


    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("Info"));
        if(user){
            navigate("/chats");
        }
    },[navigate]);

    const registerDataChange = (e) => {
        if(e.target.name === "avatar"){
            const reader = new FileReader();
            reader.onload = () => {
                if(reader.readyState === 2){
                    setAvatarPreview(reader.result);
                    setAvatar(reader.result);
                }
            }
            reader.readAsDataURL(e.target.files[0]);
        }
        else{
            setUser({...user,[e.target.name]:e.target.value});
        }
    }


    const switchTabs = (e, tab) => {
        if(tab==="login"){
            switcherTab.current.classList.add("shiftToNeutral");
            switcherTab.current.classList.remove("shiftToRight");

            registerTab.current.classList.remove("shiftToNeutralForm");
            loginTab.current.classList.remove("shiftToLeft")
        }
        if(tab==="register"){
            switcherTab.current.classList.add("shiftToRight");
            switcherTab.current.classList.remove("shiftToNeutral");

            registerTab.current.classList.add("shiftToNeutralForm");
            loginTab.current.classList.add("shiftToLeft")
        }
    } 
    
    const registerSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let config = {
                headers: {
                    "Content-Type":"multipart/form-data",
                },
            };
            const myForm = new FormData();
            myForm.set("name" , name);
            myForm.set("email", email);
            myForm.set("password", password);
            myForm.set("avatar", avatar);
            const { data } = await axios.post(`https://mern-chat-app-backend-three.vercel.app/api/v1/users/`, myForm , config);
            Swal.fire({
                text: "Registration Successful",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: 'swal-wide'
            });
            localStorage.setItem("Info", JSON.stringify(data));
            setLoading(false);
            navigate("/chats");
            window.location.reload();
        } catch (error) {
            Swal.fire({
                text: error.response.data.message,
                icon: 'error',
                confirmButtonText: 'Ok',
                customClass: 'swal-wide'
            });
            setLoading(false);
        }
    }

    const loginSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let config = {
            headers : {
                "Content-Type":"application/json"
            }
        };
            let email = loginEmail;
            let password = loginPassword;
            const { data } = await axios.post(`/api/v1/users/login`, { email, password }, config);
            Swal.fire({
                text: "Login Successful",
                icon: 'success',
                confirmButtonText: 'Ok',
                customClass: 'swal-wide'
            });
            localStorage.setItem("Info", JSON.stringify(data));
            setLoading(false);
            navigate("/chats");
            window.location.reload();
        } catch (error) {
            Swal.fire({
                text: error.response.data.message,
                icon: 'error',
                confirmButtonText: 'Ok',
                customClass: 'swal-wide'
            });
            setLoading(false);
        }
    }

  

    return(
        <Fragment>
            {loading ? <Loader/> : (
                <Fragment>
                <div className="LoginSignupContainer">
                    <div className="LoginSignupBox">
                        <div>
                            <div className="login_signup_toggle">
                                <p onClick={(e) => switchTabs(e,"login")}>LOGIN</p>
                                <p onClick={(e) => switchTabs(e, "register")}>REGISTER</p>
                            </div>
                            <button ref={switcherTab}></button>
                        </div>
                        <form className="loginForm" ref={loginTab} onSubmit={loginSubmit}>
                            <div className="loginEmail">
                                <MailOutlineIcon />
                                <input 
                                    type="email"
                                    placeholder="Email"
                                    required
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                />
                            </div>
                            <div className="loginPassword">
                                <LockOpenIcon />
                                <input 
                                    type="password"
                                    placeholder="Password"
                                    required
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                />
                            </div>
                            {/* <Link to="/password/forgot">Forget Password?</Link> */}
                            <input type="submit" value="Login" className="loginBtn"/>
                        </form>
                        <form className="signupForm" ref={registerTab}  encType="multipart/form-data" onSubmit={registerSubmit}>
                            <div className="signupName">
                                <FaceIcon />
                                <input 
                                    type="text"
                                    placeholder="Name"
                                    required
                                    name="name"
                                    value={name}
                                    onChange={registerDataChange}
                                />
                            </div>
                            <div className="signupEmail">
                                <MailOutlineIcon />
                                <input 
                                    type="email"
                                    placeholder="Email"
                                    required
                                    name="email"
                                    value={email}
                                    onChange={registerDataChange}
                                />
                            </div>
                            <div className="signupPassword">
                                <LockOpenIcon />
                                <input 
                                    type="password"
                                    placeholder="Password"
                                    required
                                    name="password"
                                    value={password}
                                    onChange={registerDataChange}
                                />
                            </div>
                            <div id="registerImage">
                                <img src={avatarPreview} alt="Avatar Preview"/>
                                <input 
                                    type="file"
                                    name="avatar"
                                    accept="image/*"
                                    onChange={registerDataChange}
                                />
                            </div>
                            <input 
                                type="submit"
                                value="Register"
                                className="signupBtn"
                            />
                        </form>
                    </div>
                </div>
            </Fragment>
            )}
        </Fragment>
    );
}

export default LoginSignup;