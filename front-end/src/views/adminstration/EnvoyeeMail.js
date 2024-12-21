import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from "socket.io-client"
import '../../style/viewsStyle/messenger.css';
import { IoMdAddCircle } from "react-icons/io";
import EmojiPicker from 'emoji-picker-react';
import { format, isValid } from 'date-fns';


function EnvoyeeMailEmploye() {
  const { id, email } = useParams();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const refreshToken = localStorage.getItem('refreshToken');
  const [Messages, setMessages] = useState([]);
  const socket = io.connect("http://localhost:8000");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State to manage emoji picker
  const [newMessage, setNewMessage] = useState('');


  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
      'Refresh-Token': `Bearer ${refreshToken}`,
    },
  }), [token, refreshToken]);

  const [formData, setFormData] = useState({
    message: '',
    rolesender: role,
    rolereciever: 'employe',
    receiver_id: id,
    sender_id: userId

  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:4000/api/listMessages', {
        ...config,
        params: {
          sender_id: userId,
          receiver_id: id
        },
      });
      setMessages(response.data.messages);
      const chatElement = document.getElementsByClassName("messenger-body")[0];
      if (chatElement) {
        chatElement.scrollTop = chatElement.scrollHeight;
      } else {
        console.warn('Chat element not found');
      }
    } catch (error) {
      console.error('Error fetching Messages:', error);
    }
  };

  const sendMessage = () => {
    socket.emit("sendMessage", formData);
    setFormData({ ...formData, message: '' });
    setNewMessage('');

  };

  useEffect(() => {
    fetchMessages();
  }, [id, userId]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("client connected");
    });
    socket.on("receiveMessage", () => {
      fetchMessages();
    });
  }, [id, userId]);

  const handleAddFileClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData1 = new FormData();
    formData1.append('file', file);
    formData1.append('upload_preset', 'xlcnkdgy');

    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dik98v16k/image/upload/', formData1);
      const fileUrl = response.data.secure_url;

      // Set the message to the file URL for sending
      setFormData((prevFormData) => ({
        ...prevFormData,
        message: `File ${fileUrl}`,
      }));

      // Set the newMessage state to display in the input field
      setNewMessage(`File ${fileUrl}`);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleEmojiPickerToggle = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiClick = (emoji) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      message: prevFormData.message + emoji.emoji,
    }));
    setShowEmojiPicker(false);
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="messenger-container ">
      <div className="messenger-header">
        <div className="messenger-title">to {email}</div>
      </div>
      <div className="messenger-body ">
        <div className="messenger-chat">
          {Messages && Messages.length > 0 && Messages.map((message, index) => {
            const timestamp = new Date(message.timestamp);
            return (
              <div key={index} className={`message ${message.sender_id === userId ? 'message-right' : 'message-left'}`}>
                {message.message.startsWith("File ") ?
                  <span className="isFile">
                    <a href={message.message.substring(5)} target="_blank" rel="noopener noreferrer" download>
                      {message.message.substring(5)}
                    </a>
                  </span>
                  : <span>{message.message}</span>
                }
                <span className="messenger-timestamp">
                  {isValid(timestamp) ? format(timestamp, 'HH:mm') : 'Invalid date'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="messenger-footer">
        <IoMdAddCircle onClick={handleAddFileClick} />
        <input
          type="file"
          name="file_url"
          id="fileInput"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*,application/pdf,.doc,.docx"
        />
        <button type="button" onClick={handleEmojiPickerToggle}>😀</button>
        {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Type your message here"
          className="messenger-input"
        ></textarea>
        <button type="button" onClick={(event) => { event.preventDefault(); sendMessage(); }} className="messenger-send-button">
          Send
        </button>
      </div>
    </div>
  );
}


function EnvoyeeMailClient() {
  const { id, email } = useParams();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const refreshToken = localStorage.getItem('refreshToken');
  const [Messages, setMessages] = useState([]);
  const socket = io.connect("http://localhost:80000");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
      'Refresh-Token': `Bearer ${refreshToken}`,
    },
  }), [token, refreshToken]);

  const [formData, setFormData] = useState({
    message: '',
    rolesender: role,
    rolereciever: 'client',
    receiver_id: id,
    sender_id: userId

  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:4000/api/listMessages', {
        ...config,
        params: {
          rolesender: role,
          sender_id: userId,
          receiver_id: id
        },
      });
      setMessages(response.data.messages);
      const chatElement = document.getElementsByClassName("messenger-body")[0];
      if (chatElement) {
        chatElement.scrollTop = chatElement.scrollHeight;
      } else {
        console.warn('Chat element not found');
      }
    } catch (error) {
      console.error('Error fetching Messages:', error);
    }
  };

  const sendMessage = () => {
    socket.emit("sendMessage", formData);
    setFormData({ ...formData, message: '' });
    setNewMessage('');

  };

  useEffect(() => {
    fetchMessages();
  }, [id, userId]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("client connected");
    });
    socket.on("receiveMessage", () => {
      fetchMessages();
    });
  }, [id, userId]);

  const handleAddFileClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData1 = new FormData();
    formData1.append('file', file);
    formData1.append('upload_preset', 'xlcnkdgy');

    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dik98v16k/image/upload/', formData1);
      const fileUrl = response.data.secure_url;

      // Set the message to the file URL for sending
      setFormData((prevFormData) => ({
        ...prevFormData,
        message: `File ${fileUrl}`,
      }));

      // Set the newMessage state to display in the input field
      setNewMessage(`File ${fileUrl}`);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };


  const handleEmojiPickerToggle = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiClick = (emoji) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      message: prevFormData.message + emoji.emoji,
    }));
    setShowEmojiPicker(false);
  };

  if (!userId) {
    return <div>Loading...</div>;
  }
  return (
    <div className="messenger-container ">
      <div className="messenger-header">
        <div className="messenger-title">to {email}</div>
      </div>
      <div className="messenger-body">
        <div className="conversation-body">
          {Messages && Messages.length > 0 && Messages.map((message, index) => {
            const timestamp = new Date(message.timestamp);
            return (
              <div key={index} className={`message ${message.sender_id === userId ? 'message-right' : 'message-left'}`}>
                {message.message.startsWith("File ") ?
                  <span className="isFile">
                    <a href={message.message.substring(5)} target="_blank" rel="noopener noreferrer" download>
                      {message.message.substring(5)}
                    </a>
                  </span>
                  : <span>{message.message}</span>
                }
                <span className="messenger-timestamp">
                  {isValid(timestamp) ? format(timestamp, 'HH:mm') : 'Invalid date'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="messenger-footer">
        <IoMdAddCircle onClick={handleAddFileClick} />
        <input
          type="file"
          name="file_url"
          id="fileInput"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*,application/pdf,.doc,.docx"
        />
        <button type="button" onClick={handleEmojiPickerToggle}>😀</button>
        {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Type your message here"
          className="messenger-input"
        ></textarea>
        <button type="button" onClick={(event) => { event.preventDefault(); sendMessage(); }} className="messenger-send-button">
          Send
        </button>
      </div>
    </div>
  );
}


export { EnvoyeeMailEmploye, EnvoyeeMailClient };
