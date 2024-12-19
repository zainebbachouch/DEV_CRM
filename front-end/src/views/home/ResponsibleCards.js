import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import  { FaCheck } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";

import '../../style/viewsStyle/home.css';

function ResponsibleCards() {
    const [responsibleCards, setResponsibleCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        responsible_departemnt: '',
        responsible_name: '',
        description: '',
        image_url: ''
    });
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [uploading, setUploading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0); // For slider control
    const slidesPerPage = 2; // Number of cards displayed per view

    const token = localStorage.getItem('token');
    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    // Fetch responsible cards from the database
    const fetchResponsibleCards = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:4000/api/responsible_cards', config);
            setResponsibleCards(response.data.responsibleCards);
        } catch (error) {
            console.error("Error fetching responsible cards:", error);
        }
    };

    useEffect(() => {
        fetchResponsibleCards();
    }, []);

    // Handle editor changes
    const handleEditorChange = (newState) => {
        setEditorState(newState);
        setFormData((prevData) => ({
            ...prevData,
            description: draftToHtml(convertToRaw(newState.getCurrentContent())) // Convert editor state to HTML
        }));
    };

    // Handle form submission for Add/Edit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const cardData = {
                ...formData,
                description: draftToHtml(convertToRaw(editorState.getCurrentContent())) // Save as HTML
            };
            if (selectedCard) {
                await axios.put(`http://127.0.0.1:4000/api/responsible_card/${selectedCard.id}`, cardData, config);
            } else {
                await axios.post('http://127.0.0.1:4000/api/responsible_card', cardData, config);
            }
            fetchResponsibleCards(); // Refresh the cards after submission
            setShowModal(false); // Close the modal
            setSelectedCard(null); // Reset the selected card
        } catch (error) {
            console.error("Error saving card:", error);
        }
    };

    // Handle image upload to Cloudinary
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'xlcnkdgy'); // Your Cloudinary preset

        setUploading(true);

        try {
            const response = await axios.post('https://api.cloudinary.com/v1_1/dik98v16k/image/upload', formData);
            setFormData((prev) => ({ ...prev, image_url: response.data.secure_url }));
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setUploading(false);
        }
    };

    // Handle Delete Functionality
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:4000/api/responsible_card/${id}`, config);
            fetchResponsibleCards(); // Refresh the cards after deletion
        } catch (error) {
            console.error("Error deleting card:", error);
        }
    };

    // Handle Add New Card
    const handleAdd = () => {
        setSelectedCard(null); // Reset selected card to null for adding new card
        setFormData({
            responsible_departemnt: '',
            responsible_name: '',
            description: '',
            image_url: ''
        });
        setEditorState(EditorState.createEmpty());
        setShowModal(true); // Show the modal
    };

    // Handle Edit Card
    const handleUpdate = (card) => {
        setSelectedCard(card); // Set the selected card to edit
        const blocksFromHtml = htmlToDraft(card.description);
        const contentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks);
        const newEditorState = EditorState.createWithContent(contentState);
        setEditorState(newEditorState); // Load description into editor
        setFormData(card); // Pre-fill form data with selected card's info
        setShowModal(true); // Show the modal
    };

    // Go to the next slide
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === responsibleCards.length - slidesPerPage ? 0 : prevIndex + 1));
    };

    // Go to the previous slide
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? responsibleCards.length - slidesPerPage : prevIndex - 1));
    };
       // Handle Autocomplete Select for employees
       const handleSelect = (value) => {
        const selectedEmp = employees.find(emp => emp.idemploye.toString() === value);
        if (selectedEmp) {
            setFormData({ ...formData, responsible_name: `${selectedEmp.nom_employe} ${selectedEmp.prenom_employe}` });
        }
    };


    return (
        <div className="responsible-section responsibleSectionEdit">
            <div>
                <h2>Responsible Departments</h2>
                <button className="add-btn" onClick={handleAdd}>
                    <FaPlus /> Add New Responsible Card
                </button>
                {/* Slider Controls */}
                {responsibleCards.length > slidesPerPage && (
                    <>
                        <button className="prev-btn" onClick={prevSlide}><FaArrowLeft /></button>
                        <button className="next-btn" onClick={nextSlide}><FaArrowRight /></button>
                    </>
                )}

                {/* Display Cards */}
                <div className="card-slider">
                    {responsibleCards.slice(currentIndex, currentIndex + slidesPerPage).map((card, index) => (
                        <div className="card" key={index}>
                            <img
                                src={card.image_url}
                                alt={card.responsible_name || 'Responsible Person'}
                                style={{ borderRadius: '50%', width: '150px', height: '150px' }}
                            />
                            <div className="card-content d-flex flex-column justify-content-center">
                                <h3>{card.responsible_name || 'No Name Provided'}</h3>
                                <div className="buttonsContainer d-flex column-gap-2 justify-content-center">
                                <button type='button' className='btn editButtonResp'   onClick={() => handleUpdate(card)}><FaEdit /> Edit </button>
                                <button  type='button' className='btn deleteButtonResp'  onClick={() => handleDelete(card.id)}><FaTrash /> Delete</button>

                                </div>
            
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal for Adding/Editing Cards */}
            {showModal && (
                <div className="modal-backdrop modalEditor d-flex justify-content-center align-items-center" id="modalEditor">
                    <div className="modal-content modalContent ">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Department </label>
                                <select
                                    value={formData.responsible_departemnt}
                                    onChange={(e) => setFormData({ ...formData, responsible_departemnt: e.target.value })}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="help desk">Help Desk</option>
                                    <option value="development">Development</option>
                                    <option value="research">Research</option>
                                    <option value="audit">Audit</option>
                                    <option value="MOA">MOA</option>
                                    <option value="monetique">Monetique</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Name (Autocomplete)</label>
                             
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <Editor
                                    editorState={editorState}
                                    toolbarClassName="toolbar-class"
                                    wrapperClassName="wrapper-class"
                                    editorClassName="editor-class"
                                    onEditorStateChange={handleEditorChange} // Handle changes in editor
                                />
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="file"
                                    className="form-control-file"
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                />
                                {uploading && <div>Uploading image...</div>}
                                {formData.image_url && <img src={formData.image_url} alt="Uploaded" width="100" />}
                            </div>
                            <div className="modal-footer">
                                <button  class=" saveChangesButton" type="submit"><FaCheck></FaCheck> Save Changes</button>
                                <button type="button" onClick={() => setShowModal(false)}><MdCancel className="mx-1"> </MdCancel>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResponsibleCards;
