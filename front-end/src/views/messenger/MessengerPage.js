import React, { useState, useEffect, useMemo } from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from "../../components/sidenav/TopNav";
import '../../style/viewsStyle/MessengerPage.css';
import axios from 'axios';
import io from "socket.io-client";
import { format, isToday, isYesterday, isThisWeek, isValid } from 'date-fns';
import { Link } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdAddCircle } from "react-icons/io";
import EmojiPicker from 'emoji-picker-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { useLocation } from 'react-router-dom'; // Import useLocation
import { IoIosSend } from "react-icons/io";
import conversationImage from "../../images/conversationImage.png"
import userImage from "../../images/avatar.png"



function MessengerPage() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const socket = io.connect("http://localhost:8000");


  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate for navigation
  const location = useLocation(); // Get the state passed from navigation

  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,

      },
    };
  }, [token]);



  const [formData, setFormData] = useState({
    message: '',
    rolesender: role,
    receiver_id: null,
    rolereciever: null,
    sender_id: userId,
  });

  const handleAddFileClick = () => {
    document.getElementById("fileInput").click()
  }
  const handleFileChange = async (e) => {
    console.log(e.target.files[0])
    const { name, type, files } = e.target.files[0];

    const file = e.target.files[0];
    console.log('filemessenger', file);

    const formData1 = new FormData();
    formData1.append('file', file);
    formData1.append('upload_preset', 'xlcnkdgy'); // Nom de l'environnement cloud

    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dik98v16k/image/upload/', formData1);
      const fileUrl = response.data.secure_url;
      setNewMessage("File " + fileUrl)
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: fileUrl,
      }));
    } catch (error) {
      console.error("Error uploading file:", error);
    }

  }


  const val = 8000;


  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    } else {
      fetchConversations();
      fetchAllUsers();
    }
  }, [searchTerm]);

  useEffect(() => {
    // Check if there is a conversationId passed from navigation state
    if (location.state?.conversationId) {
      // Automatically select the conversation using the passed conversationId
      const conversationId = location.state.conversationId;
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        fetchMessages(conversationId);
      }
    }
  }, [location.state, conversations]);




  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      console.log('New message received:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
      var element = document.getElementsByClassName("message")
      element = element[element.length - 1]
      element.parentNode.removeChild(element)
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);


  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:4000/api/allUsers', config);
      setAllUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:4000/api/conversations', {
        ...config,
        params: {
          userId,
        },
      });
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };




  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get('http://127.0.0.1:4000/api/listMessages', {
        ...config,
        params: {
          sender_id: userId,
          receiver_id: conversationId
        },
      });

      const messages = response.data.messages;

      const analyzedMessages = await Promise.all(messages.map(async (message) => {
        const isSpam = await analyseMessage(message.message);
        return { ...message, isSpam: isSpam === 'spam' };

      }));

      setMessages(analyzedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };


  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setFormData({
      ...formData,
      receiver_id: conversation.id,
      rolereciever: conversation.role,
    });
    fetchMessages(conversation.id);
  };
  /*
    const handleConversationClick = (data) => {
      if (data.hasOwnProperty('id')) {
        // Handle conversation click
        setSelectedConversation(data);
        setFormData({
          ...formData,
          receiver_id: data.id,
          rolereciever: data.role,
        });
        fetchMessages(data.id);
      } else {
        // Handle user click - Start a new conversation
        const newConversation = {
          id: data.userId, // You can set a temporary ID for new conversations
          role: data.role,
          name: `${data.name} ${data.prenom}`,
          photo: data.photo,
        };
        console.log(' newConversation  newConversation ', newConversation)
        setSelectedConversation(newConversation);
        setFormData({
          ...formData,
          receiver_id: null,
          rolereciever: data.role,
        });
        // You may choose to fetch initial messages for new conversations here
        setMessages([]); // Clear messages for new conversation
      }
    };*/



  const handleSendMessage = async () => {
    if (!selectedConversation || !selectedConversation.id) {
      // Handle case where there is no selected conversation
      console.error('No conversation selected');
      return;
    }

    if (newMessage.trim() === '') return;
    const isSpam = await analyseMessage(newMessage);

    const message = {
      sender_id: userId,
      rolesender: role,
      receiver_id: selectedConversation.id,
      rolereciever: selectedConversation.role,
      message: newMessage,
    };
    message.isSpam = isSpam === 'spam'; // Mark the message if it is spam


    socket.emit('sendMessage', message);
    setNewMessage('');
  };




  // Filter out duplicate conversations based on their IDs
  const uniqueConversations = conversations.filter((conversation, index) => (
    conversations.findIndex((c) =>
      c.id === conversation.id &&
      c.name === conversation.name &&
      c.prenom === conversation.prenom
    ) === index
  ));


  const formatTimestamp = (timestamp) => {
    if (!isValid(timestamp)) return 'Invalid date';

    if (isToday(timestamp)) {
      return `Today, ${format(timestamp, 'HH:mm')}`;
    } else if (isYesterday(timestamp)) {
      return `Yesterday, ${format(timestamp, 'HH:mm')}`;
    } else if (isThisWeek(timestamp)) {
      return format(timestamp, 'EEEE, HH:mm');
    } else {
      return format(timestamp, 'dd MMM yyyy, HH:mm');
    }
  };


  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await axios.get(`http://127.0.0.1:4000/api/searchUsers/${searchTerm}`, config);
      const searchResults = response.data.users;

      // Update both conversations and allUsers based on search results
      setConversations(searchResults);
      setAllUsers(searchResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEmojiPickerToggle = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiClick = (showEmojiPicker) => {
    if (showEmojiPicker && showEmojiPicker.emoji) {
      setNewMessage(prevMessage => prevMessage + showEmojiPicker.emoji);
    }
    setShowEmojiPicker(false);
  };


  // Function to analyze the message
  const analyseMessage = async (message) => {
    try {
      const response = await axios.post('http://127.0.0.1:5001/api/predictSpam', { message });
      console.log('Spam Prediction Response:', response.data);
      return response.data.prediction;
    } catch (error) {
      console.error('Error analyzing message:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      return null;
    }
  };

  const handleSpamMessageClick = (messageId) => {
    navigate(`/messenger/${messageId}`); // Navigate to a page to view the spam message
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid messengerContainer p-2 ">
          <div className="sidebar conversationBar">
            <div className="srch_bar">
              <div className="stylish-input-group">
                <span className="input-group-addon">
                  <form onSubmit={handleSearchSubmit}>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search for users..."
                    />
                  </form>
                </span>
              </div>
            </div>


            <ul>
              {uniqueConversations.map((conversation, index) => (
                <li key={index} className="conversationItem" onClick={() => handleConversationClick(conversation)}>
                  <div className="conversationContent">
                    <img
                      src={conversation.photo || conversationImage}
                      alt={`${conversation.name} ${conversation.prenom}`}
                      className="conversationPhoto"
                    />
                    <div className="conversationDetails">
                      <span className="conversationRole">{conversation.role}</span>
                      <span className="conversationName">{`${conversation.name} ${conversation.prenom}`}</span>
                      <span className="conversationMessage">
                        {conversation.message
                          ? conversation.message.length > 5
                            ? `${conversation.message.slice(0, 5)}...`
                            : conversation.message
                          : "No message"}
                      </span>
                    </div>
                  </div>
                  <span className="conversationTimestamp">
                    {new Date(conversation.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>



            <div className="all-users">
              <h3>All Users</h3>
              <ul>
                {allUsers
                  .filter((user) => !conversations.find((conversation) => conversation.id === user.userId))
                  .map((user, index) => (
                    <li key={index} onClick={() => handleConversationClick(user)}>
                      <img src={userImage} alt={`${user.name} ${user.prenom}`} />
                      <span>{user.role}</span>
                      <span>{user.name} {user.prenom} </span>

                    </li>
                  ))}

              </ul>
            </div>



          </div>
          {selectedConversation && (

            <div className="conversation conversationsContainer">
              <div className="conversation-header">
                <GiHamburgerMenu />
                <span>{selectedConversation.rolereciever}</span>
              </div>
              <div className="conversation-body">
                {messages.map((message, index) => {
                  const timestamp = new Date(message.timestamp);
                  return (
                    <div
                      key={index}
                      className={`message ${message.sender_id == userId ? 'message-right' : 'message-left'} ${message.isSpam ? 'spam-message' : ''}`}
                    >
                      {message.isSpam ? (
                        <div className="spam-warning" onClick={() => handleSpamMessageClick(message.id)}>
                          This message is flagged as spam. Click to view.
                        </div>
                      ) : (
                        <>
                          {message.message.indexOf("File ") === 0 ? (
                            <span className="isFile">
                              <a href={message.message.substring(5)} target="_blank" download>
                                {message.message.substring(5)}
                              </a>
                            </span>
                          ) : (
                            <span className="">{message.message}</span>
                          )}
                          <span className="messenger-timestamp">
                            {formatTimestamp(timestamp)}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="conversation-footer">
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

                <input
                  type="text"
                  name="message"
                  value={newMessage}
                  onChange={(e) => { e.preventDefault(); setNewMessage(e.target.value) }}
                  placeholder="Type your message here"

                />
                <button className="sendMessageButton" onClick={handleSendMessage}><IoIosSend /> Send </button>
              </div>
            </div>
          )}





        </div>

      </div>

    </div>

  );

}


export default MessengerPage;