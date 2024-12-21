import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import "../../style/viewsStyle/Chatbot.css";
import io from "socket.io-client";
import EmojiPicker from 'emoji-picker-react';

const Chatbot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const socket = useRef(null);
    const isMounted = useRef(false);  // Track component mount status
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    const config = useMemo(() => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }), [token]);

    const fetchChatHistory = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/chat-history', {
                ...config,
                params: {
                    sender_id: userId,
                    rolesender: role
                }
            });
            if (isMounted.current) {  // Only update state if component is still mounted
                setMessages(response.data);
                const chatElement = document.querySelector(".chatbot-messages");
                if (chatElement) {
                    chatElement.scrollTop = chatElement.scrollHeight;
                }
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    useEffect(() => {
        isMounted.current = true;  // Mark as mounted
        socket.current = io.connect("http://localhost:8000");

        socket.current.on('receive', (message) => {
            if (isMounted.current) {  // Only update state if mounted
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        });

        fetchChatHistory();

        return () => {
            isMounted.current = false;  // Mark as unmounted
            socket.current.off('receive');
            socket.current.disconnect();
        };
    }, []);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const messageData = {
            sender_id: userId,
            rolesender: role,
            message: newMessage,
            receiver_id: -1,
            rolereciever: 'bot',
            is_sender_bot: false,
            is_receiver_bot: true
        };

        socket.current.emit('send', messageData);

        if (isMounted.current) {  // Only update state if component is still mounted
            setMessages((prevMessages) => [...prevMessages, messageData]);
            setNewMessage('');
        }
    };

    const handleEmojiPickerToggle = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className={`chatbot ${open ? "open" : ""}`}>
            {!open && (
                <div className="chatbot-icon" onClick={() => setOpen(true)}>
                    🤖
                </div>
            )}

            {open && (
                <div className="chatbot-window">
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender_id == userId ? "user" : "bot"}`}>
                                {msg.message}
                            </div>
                        ))}
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message here"
                        />
                        <button type="button" onClick={handleEmojiPickerToggle}>😀</button>
                        {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
                        <button onClick={handleSendMessage}>Send</button>
                    </div>

                    <button onClick={() => setOpen(false)} className="chatbot-close-button">
                        ✖
                    </button>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
