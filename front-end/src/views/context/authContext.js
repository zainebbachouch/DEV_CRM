import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';


const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    console.log(currentUser);
  }, [currentUser]);

  const handleLogin = async (formData) => {
    try {
      const response = await axios.post("http://localhost:4000/api/login", formData, {
        withCredentials: false,
      });
      console.log('Response:', response);
      console.log('User data:', response.data.user);

      setCurrentUser(response.data.user);
      setCurrentUser(response.data);
      localStorage.setItem('userId', response.data.user.id);
      if (response.data.photo_employe) {
        localStorage.setItem('photo', response.data.photo_employe);
      }
      localStorage.setItem('username', response.data.user.username);
      //console.log('userIduserIduserId', response.data.user.id);

      localStorage.setItem('refreshToken', response.data.refreshToken);
      //console.log('Refresh token:', response.data.refreshToken);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('email', response.data.user.email);
      localStorage.setItem('photo', response.data.user.photo);


      console.log(response.data)

      //document.cookie = "cookie:" + response.data.token;
      document.cookie = `cookie=${response.data.token}; SameSite=None; Secure`;


    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  /*
   const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:4000/api/login", formData);
            navigate("/")
            console.log("Response from server:", response.data);
            // Faites quelque chose avec la réponse, comme rediriger l'utilisateur
        } catch (err) {
            console.error("Error object:", err);
            // Gérez les erreurs en cas de problème avec la requête
        }
    };*/

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('photo');

    // Clear cookies as well
    document.cookie = 'cookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure';
  };

  return (
    <AuthContext.Provider value={{ currentUser, handleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
