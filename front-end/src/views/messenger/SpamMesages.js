import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {  IoMdArrowBack } from "react-icons/io"; // Import the back icon
import SideBar from '../../components/sidebar/SideBar';
import TopBar from "../../components/sidenav/TopNav";
import '../../style/viewsStyle/MessengerPage.css';
import axios from 'axios';
import { format, isToday, isYesterday, isThisWeek, isValid } from 'date-fns';

function SpamMessages() {
    const { messageId } = useParams(); // Get the message ID from the URL
    const token = localStorage.getItem('token');
    const navigate = useNavigate(); // Initialize the navigate function to go back

    const [message, setMessage] = useState(null);

    const config = useMemo(() => {
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }, [token]);

    useEffect(() => {
        fetchSpamMessage();
    }, [messageId]);

    const fetchSpamMessage = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:4000/api/listMessages/${messageId}`, config);
            console.log('API Response:', response.data);

            const messageData = response.data;
            if (messageData) {
                setMessage(messageData);
            } else {
                console.log('No message data found in the response.');
            }
        } catch (error) {
            console.error('Error fetching spam message:', error);
        }
    };

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
    // Back to the conversation
    const handleBackToConversation = () => {
        // Navigate back to the MessengerPage and pass the conversation ID
        navigate(`/messenger`, { state: { conversationId: message?.receiver_id } });
    };

    return (
        <div className="d-flex">
            <SideBar />
            <div className="container-fluid flex-column " id="messageContainerCstm">
                <TopBar />
                <div className="container-fluid p-2 d-flex">
                    <div className="conversation">
                        <div className="conversation-header d-flex align-items-center">
                            {/* Back Button Icon */}
                            <IoMdArrowBack
                                size={24}
                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                onClick={handleBackToConversation} // Back to the conversation
                            />
                            <h3>Spam Message</h3>
                        </div>
                        <div className="conversation-body">
                            {message ? (
                                <div className="message spam-message">
                                    <span className="">{message.message}</span>
                                    <span className="messenger-timestamp">
                                        {formatTimestamp(new Date(message.timestamp))}
                                    </span>
                                </div>
                            ) : (
                                <p>No spam message found.</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default SpamMessages;
