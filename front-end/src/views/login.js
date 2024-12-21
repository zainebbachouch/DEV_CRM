import React, { useState } from 'react';

import facebook from "../images/facebook.png";
import google from "../images/google.png";
import twitter from "../images/twitter.png";
import crmIcon from "../images/crm.png";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/authContext';

import style from "../style/viewsStyle/loginStyle.module.css";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const { handleLogin } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await handleLogin(formData);
            navigate("/");
        } catch (err) {
            console.error("Error object:", err);
        }
    };

    return (
        <>
            <div className={`${style.loginContainer} d-flex justify-content-center align-items-center`}>
                <div className={`${style.loginForm} d-flex flex-column align-items-center justify-content-center`}>
                    <div className={style.iconContainer}>
                        <img src={crmIcon} alt="CRM Logo" className={style.logo} />
                    </div>
                    <div className={style.signIn}>
                        <h2>Sign In</h2>
                    </div>
                    <div className={style.loginSocialMedia}>
                        <p className='text-muted text-center'>Login into your account using</p>
                        <div className={`${style.socialMediaIcons} d-flex column-gap-3`}>
                            <button className={`${style.icon} p-2`}>
                                <img src={facebook} alt="Facebook logo" className={style.socialMediaIcon} />
                            </button>
                            <button className={`${style.icon} p-2`}>
                                <img src={google} alt="Google logo" className={style.socialMediaIcon} />
                            </button>
                            <button className={`${style.icon} p-2`}>
                                <img src={twitter} alt="Twitter logo" className={style.socialMediaIcon} />
                            </button>
                        </div>
                        <div className={style.loginInput}>
                            <form onSubmit={handleSubmit}>
                                <div className={`${style.formGroup} mt-3`}>
                                    <label htmlFor="emailInput" className='text-muted'>Email address</label>
                                    <input
                                        type="email"
                                        className={`${style.formControl} form-control`}
                                        id="emailInput"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                        required
                                    />
                                </div>
                                <div className={`${style.formGroup} mt-1`}>
                                    <div className='d-flex justify-content-between'>
                                        <label htmlFor="passwordInput" className='text-muted'>Password</label>
                                        <Link to="/password" className={style.forgotMessage}>Forgot Password</Link>
                                    </div>
                                    <input
                                        type="password"
                                        className={`${style.formControl} form-control`}
                                        id="passwordInput"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Password"
                                        required
                                    />
                                </div>
                                <div className={` mt-3`}>
                                    <button type="submit" className={`  w-100`} 
                                    style={{backgroundColor:"#0f87d2",color:"#fff",
                                    border:"none",padding:"5px",borderRadius:"12px"}}>
                                        Login
                                    </button>
                                </div>
                            </form>
                            <span className="text-center mt-2">You don't have an account?</span>
                            <Link to="/register">
                                <button className={``}
                                style={{backgroundColor:"transparent",color:"#000",
                                    border:"none",padding:"5px",borderRadius:"12px",marginTop:"10px"}}
                                >Sign up</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
