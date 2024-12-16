import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaStar, FaThumbsUp, FaThumbsDown, FaReply, FaTrash, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import '../../style/viewsStyle/feedback.css';
import EmojiPicker from 'emoji-picker-react';
import { Pie } from 'react-chartjs-2';



const colors = {
    orange: "#F2C265",
    grey: "#a9a9a9"
};

const StarRating = ({ onRatingChange, initialRating }) => {
    const [rating, setRating] = useState(initialRating || 0);
    const [hoverValue, setHoverValue] = useState(undefined);
    const stars = Array(5).fill(0);

    const handleClickStar = value => {
        setRating(value);
        if (onRatingChange) {
            onRatingChange(value);
        }
    };

    return (
        <div className="star-rating">
            {stars.map((_, index) => (
                <FaStar
                    key={index}
                    size={24}
                    color={(hoverValue || rating) > index ? colors.orange : colors.grey}
                    onClick={() => handleClickStar(index + 1)}
                    onMouseOver={() => setHoverValue(index + 1)}
                    onMouseLeave={() => setHoverValue(undefined)}
                    style={{ cursor: "pointer" }}
                />
            ))}
            <p>({rating} Stars)</p>
        </div>
    );
};

const FeedbackForm = () => {
    const [formData, setFormData] = useState({
        feedback_message: '',
        rating: 0,
        feedback_category: 'Service Quality',
    });

    const [editingFeedback, setEditingFeedback] = useState(null);
    const [editingReply, setEditingReply] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleReplies, setVisibleReplies] = useState({});
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeTextArea, setActiveTextArea] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sentimentData, setSentimentData] = useState({
        positive: 0,
        negative: 0,
        neutral: 0,
        irrelevant: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);


    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const config = useMemo(() => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }), [token]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };
    const calculateSentimentPercentages = (feedbacks) => {
        const sentimentCounts = feedbacks.reduce((acc, feedback) => {
            acc[feedback.sentiment.toLowerCase()] += 1;
            return acc;
        }, { positive: 0, negative: 0, neutral: 0, irrelevant: 0 });

        const totalFeedbacks = feedbacks.length;
        setSentimentData({
            positive: ((sentimentCounts.positive / totalFeedbacks) * 100).toFixed(2),
            negative: ((sentimentCounts.negative / totalFeedbacks) * 100).toFixed(2),
            neutral: ((sentimentCounts.neutral / totalFeedbacks) * 100).toFixed(2),
            irrelevant: ((sentimentCounts.irrelevant / totalFeedbacks) * 100).toFixed(2),
        });
    };
    // Function to analyze sentiment
    const message = "very goood"
    const analyzeSentiment = async (feedback_message) => {
        try {
            const response = await axios.post('http://192.168.1.9:5001/predict_sentiment', { feedback_message });
            console.log('Sentiment Response:', response);  // Log the response for debugging*/
            return response.data.sentiment;  // Sentiment is returned from Flask
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            return 'Unknown';  // Handle errors by assigning a default value
        }
    };

    // Fetch feedbacks and analyze sentiment
    const fetchFeedbacks = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://127.0.0.1:4000/api/feedback?page=${page}&limit=10`, config); // Added page and limit to API call
            const Resultfeedbacks = response.data.feedbacks; // Ensure you access the correct data structure
            const analyzedFeedbacks = await Promise.all(Resultfeedbacks.map(async (Resultfeedback) => {
                const sentiment = await analyzeSentiment(Resultfeedback.feedback_message);
                return { ...Resultfeedback, sentiment };  // Add the sentiment to each feedback
            }));
            setFeedbacks(analyzedFeedbacks);  // Set state with feedbacks including sentiment
            calculateSentimentPercentages(analyzedFeedbacks);
            setTotalPages(response.data.totalPages); // Update totalPages from response
            setCurrentPage(page);

        } catch (err) {
            console.error('Error fetching feedbacks:', err);
        } finally {
            setLoading(false);
        }
    }, [config]); // Ensure you pass config in the dependencies array


    useEffect(() => {
        fetchFeedbacks(currentPage);
    }, [currentPage, fetchFeedbacks]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'feedback_message') {
            setFormData({
                ...formData,
                [name]: value,
            });
        } else if (name === 'replyMessage') {
            setReplyMessage(value);
        }
    };

    const handleRatingChange = (newRating) => {
        setFormData({
            ...formData,
            rating: newRating,
        });
    };

    const handleEmojiPickerToggle = (textArea) => {
        setActiveTextArea(textArea);
        setShowEmojiPicker(!showEmojiPicker);
    };

    const onEmojiClick = (emojiObject) => {
        if (activeTextArea === 'feedback_message') {
            setFormData({
                ...formData,
                feedback_message: formData.feedback_message + emojiObject.emoji,
            });
        } else if (activeTextArea === 'replyMessage') {
            setReplyMessage(replyMessage + emojiObject.emoji);
        }
        setShowEmojiPicker(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingFeedback
                ? `http://127.0.0.1:4000/api/updatefeedback/${editingFeedback}`
                : 'http://127.0.0.1:4000/api/createfeedback';

            const method = editingFeedback ? 'put' : 'post';

            await axios[method](url, formData, config);

            setEditingFeedback(null);
            setFormData({ feedback_message: '', rating: 0, feedback_category: 'Service Quality' });
            fetchFeedbacks();
        } catch (error) {
            console.error(`Error ${editingFeedback ? 'updating' : 'submitting'} feedback:`, error);
        }
    };

    const handleReplySubmit = async () => {
        try {
            const replyFormData = {
                feedback_message: replyMessage,
                rating: 0,
                feedback_category: 'Reply',
                parent_id: replyingTo,
            };

            const url = editingReply
                ? `http://127.0.0.1:4000/api/updatefeedback/${editingReply}`
                : 'http://127.0.0.1:4000/api/createfeedback';

            await axios.post(url, replyFormData, config);

            setEditingReply(null);
            setReplyingTo(null);
            setReplyMessage('');
            fetchFeedbacks();
        } catch (error) {
            console.error(`Error ${editingReply ? 'updating' : 'submitting'} reply:`, error);
        }
    };

    const handleDelete = async (feedbackId) => {
        try {
            await axios.delete(`http://127.0.0.1:4000/api/feedback/${feedbackId}`, config);
            fetchFeedbacks();
        } catch (error) {
            console.error('Error deleting feedback:', error);
        }
    };

    const toggleReplies = (feedbackId) => {
        setVisibleReplies(prevState => ({
            ...prevState,
            [feedbackId]: !prevState[feedbackId]
        }));
    };

    const handleEditClick = (feedbackId) => {
        const feedback = feedbacks.find(fb => fb.idfeedback === feedbackId);
        if (!feedback) return;

        if (feedback.parent_id) {
            setReplyingTo(feedback.parent_id);
            setEditingReply(feedbackId);
            setReplyMessage(feedback.feedback_message);
        } else {
            setEditingFeedback(feedbackId);
            setFormData({
                feedback_message: feedback.feedback_message,
                rating: feedback.rating,
                feedback_category: feedback.feedback_category,
            });
        }
        window.scrollTo(0, 0);
    };

    const isOwner = (feedback) => {
        return [feedback.client_id, feedback.employe_id, feedback.admin_id].includes(userId);
    };

    const filteredFeedbacks = feedbacks.filter(feedback =>
        selectedCategory === 'all' || feedback.feedback_category === selectedCategory
    );
    // Chart data for Pie chart visualization
    const chartData = {
        labels: ['Positive', 'Negative', 'Neutral', 'Irrelevant'],
        datasets: [
            {
                label: 'Sentiment Distribution',
                data: [sentimentData.positive, sentimentData.negative, sentimentData.neutral, sentimentData.irrelevant],
                backgroundColor: ['#4caf50', '#f44336', '#ffc107', '#9e9e9e'],
                hoverOffset: 4,
            },
        ],
    };

    const handleLikeDislike = async (feedbackId, isLike) => {
        const feedback = feedbacks.find(fb => fb.idfeedback === feedbackId);
        let userReaction = feedback.user_reaction; // current user reaction (1 for like, 0 for dislike, null for no reaction)

        let newIsLike = null;
        if (isLike === true && userReaction !== 1) {
            // User clicked "like" and hasn't liked yet, so like it
            newIsLike = true;
        } else if (isLike === false && userReaction !== 0) {
            // User clicked "dislike" and hasn't disliked yet, so dislike it
            newIsLike = false;
        } else {
            // User clicked the same button they already clicked (remove reaction)
            newIsLike = null;
        }

        try {
            const response = await axios.post('http://127.0.0.1:4000/api/likedislike', {
                feedback_id: feedbackId,
                is_like: newIsLike,
            }, config);

            const updatedLikes = response.data.likes;
            const updatedDislikes = response.data.dislikes;

            // Update the feedback state with the new counts and user reaction
            setFeedbacks(prevFeedbacks => prevFeedbacks.map(feedback => {
                if (feedback.idfeedback === feedbackId) {
                    return {
                        ...feedback,
                        likes_count: updatedLikes,
                        dislikes_count: updatedDislikes,
                        user_reaction: newIsLike === true ? 1 : newIsLike === false ? 0 : null, // Update the user reaction (null if removed)
                    };
                }
                return feedback;
            }));
        } catch (error) {
            console.error('Error updating like/dislike:', error);
        }
    };


    return (
        <div className="feedback-container">
            <div className="feedback-form-container">
                <form onSubmit={handleSubmit}>
                    <h3>{editingFeedback ? 'Update your comment' : 'Leave a comment'}</h3>
                    <div>
                        <label>Message:</label>
                        <textarea
                            name="feedback_message"
                            value={formData.feedback_message}
                            onChange={handleChange}
                            placeholder="Enter your feedback"
                        />
                        <button type="button" onClick={() => handleEmojiPickerToggle('feedback_message')}>😀</button>
                        {showEmojiPicker && activeTextArea === 'feedback_message' && (
                            <EmojiPicker onEmojiClick={onEmojiClick} />
                        )}
                    </div>
                    <div>
                        <label>Rating:</label>
                        <StarRating onRatingChange={handleRatingChange} initialRating={formData.rating} />
                    </div>
                    <div>
                        <label>About:</label>
                        <select
                            name="feedback_category"
                            value={formData.feedback_category}
                            onChange={handleChange}
                        >
                            <option value="Service Quality">Service Quality</option>
                            <option value="Product">Product</option>
                            <option value="Support">Support</option>
                        </select>
                    </div>
                    <button type="submit">{editingFeedback ? 'Update Comment' : 'Post Comment'}</button>
                </form>
                <div className="sentiment-dashboard">
                    <h3>Sentiment Analysis</h3>
                    <div className="sentiment-summary">
                        <div className="sentiment-item">
                            😀 Positive: {sentimentData.positive}%
                        </div>
                        <div className="sentiment-item">
                            😡 Negative: {sentimentData.negative}%
                        </div>
                        <div className="sentiment-item">
                            😐 Neutral: {sentimentData.neutral}%
                        </div>
                        <div className="sentiment-item">
                            🚫 Irrelevant: {sentimentData.irrelevant}%
                        </div>
                    </div>

                    {/* Pie chart for sentiment visualization */}
                    <div style={{ width: '50%', margin: '0 auto' }}>
                        <Pie data={chartData} />
                    </div>
                </div>

            </div>

            <div className="feedback-list ">
                <h3>Comments</h3>
                <div className="category-filter">
                    <button onClick={() => handleCategoryChange('all')}>All</button>
                    <button onClick={() => handleCategoryChange('Service Quality')}>Service Quality</button>
                    <button onClick={() => handleCategoryChange('Product')}>Product</button>
                    <button onClick={() => handleCategoryChange('Support')}>Support</button>
                </div>

                {loading ? (
                    <p>Loading feedbacks...</p>
                ) : (
                    filteredFeedbacks.map(feedback => (
                        <div className={`feedback-item ${feedback.sentiment ? feedback.sentiment.toLowerCase() : ''}`} key={feedback.idfeedback}>
                            <div className="feedback-header">
                                <strong>{feedback.username}</strong> - {new Date(feedback.date_created).toLocaleDateString()}
                                <div className="feedback-actions">
                                    {isOwner(feedback) && (
                                        <>
                                            <FaEdit className="edit-button" onClick={() => handleEditClick(feedback.idfeedback)} />
                                            <FaTrash className="delete-button" onClick={() => handleDelete(feedback.idfeedback)} />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="feedback-body">
                                <p>{feedback.feedback_message}</p>
                                <p><strong>Rating:</strong> {feedback.rating} stars</p>
                                <p><strong>Sentiment:</strong> {feedback.sentiment}</p> {/* Display the sentiment */}
                                <StarRating initialRating={feedback.rating} readOnly={true} />
                                <p><strong>Category:</strong> {feedback.feedback_category}</p>
                            </div>

                            <div className="feedback-actions">
                                <button
                                    className={`like-button ${feedback.user_reaction == 1 ? 'liked mx-1' : ' mx-1'}`}
                                    onClick={() => handleLikeDislike(feedback.idfeedback, true)}
                                    style={{
                                        border: feedback.user_reaction == 1 ? '2px solid #007BFF' : '2px solid #9E9E9E',
                                        padding: '10px',
                                        borderRadius: '5px',
                                    }}
                                >
                                    <FaThumbsUp className={`${feedback.user_reaction == 1 ? 'liked-icon mx-1' : ' mx-1'}`} />
                                    {feedback.likes_count} Like
                                </button>

                                <button
                                    className={`dislike-button ${feedback.user_reaction == 0 ? 'disliked mx-1' : ' mx-1'}`}
                                    onClick={() => handleLikeDislike(feedback.idfeedback, false)}
                                    style={{
                                        border: feedback.user_reaction == 0 ? '2px solid #007BFF' : '2px solid #9E9E9E',
                                        padding: '10px',
                                        borderRadius: '5px',
                                    }}
                                >
                                    <FaThumbsDown className={`${feedback.user_reaction == 0 ? 'disliked-icon mx-1' : ' mx-1'}`} />
                                    {feedback.dislikes_count} Dislike
                                </button>


                                <button
                                    className="reply-button"
                                    onClick={() => setReplyingTo(feedback.idfeedback)}
                                >
                                    <FaReply /> Reply
                                </button>
                                <button
                                    className="toggle-replies-button"
                                    onClick={() => toggleReplies(feedback.idfeedback)}
                                >
                                    {visibleReplies[feedback.idfeedback] ? "Hide Replies" : "Show Replies"}
                                </button>
                            </div>


                            {visibleReplies[feedback.idfeedback] && (
                                <div className="replies-list">
                                    {feedbacks
                                        .filter(reply => reply.parent_id === feedback.idfeedback)
                                        .map(reply => (
                                            <div key={reply.idfeedback} className="reply-item">
                                                <div className="feedback-header">
                                                    <strong>{reply.username}</strong> - {new Date(reply.date_created).toLocaleDateString()}
                                                    <div className="feedback-actions">
                                                        {isOwner(reply) && (
                                                            <>
                                                                <FaEdit className="edit-button" onClick={() => handleEditClick(reply.idfeedback)} />
                                                                <FaTrash className="delete-button" onClick={() => handleDelete(reply.idfeedback)} />
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="feedback-body">
                                                    <p>{reply.feedback_message}</p>
                                                    <StarRating initialRating={reply.rating} readOnly={true} />
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                            {replyingTo === feedback.idfeedback && !editingReply && (
                                <div className="reply-form">
                                    <textarea
                                        placeholder="Write your reply..."
                                        name="replyMessage"
                                        value={replyMessage}
                                        onChange={handleChange}
                                    />
                                    <button type="button" onClick={() => handleEmojiPickerToggle('replyMessage')}>😀</button>
                                    {showEmojiPicker && activeTextArea === 'replyMessage' && (
                                        <EmojiPicker onEmojiClick={onEmojiClick} />
                                    )}
                                    <button onClick={handleReplySubmit}>Submit Reply</button>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <nav aria-label="Page navigation">
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                        </li>
                        {[...Array(totalPages).keys()].map(page => (
                            <li key={page + 1} className={`page-item ${page + 1 === currentPage ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(page + 1)}>{page + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default FeedbackForm;
