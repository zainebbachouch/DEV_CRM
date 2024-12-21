import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Editor } from 'react-draft-wysiwyg'; // Editor import
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'; // Import editor styles
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import '../../style/viewsStyle/home.css';


function HeroSectionModal({ show, handleClose, heroData, fetchHeroSection }) {
    const [formData, setFormData] = useState({
        headline: '',
        description: '',
        image_url: '',
    });
    const [uploading, setUploading] = useState(false); // To track image upload status
    const token = localStorage.getItem('token');

    const config = useMemo(() => ({
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
        },
    }), [token]);

    // Update form when heroData changes
    useEffect(() => {
        if (heroData) {
            setFormData({
                headline: heroData.headline || '',
                description: heroData.description || '',
                image_url: heroData.image_url || '',
            });
        }
    }, [heroData]);

    const handleChange = async (e) => {
        const { name, value, type, files } = e.target;

        // Handle file uploads for image
        if (type === 'file' && files.length > 0) {
            const file = files[0];
            console.log('sectionphoto', file);

            const formData1 = new FormData();
            formData1.append('file', file);
            formData1.append('upload_preset', 'xlcnkdgy'); // Cloudinary preset
            setUploading(true);

            try {
                const uploadRes = await axios.post('https://api.cloudinary.com/v1_1/dik98v16k/image/upload', formData1);
                const imageUrl = uploadRes.data.secure_url;

                console.log('Uploaded image URL:', imageUrl); // Debug the uploaded image URL

                setFormData((prevData) => ({
                    ...prevData,
                    image_url: imageUrl, // Set the image URL from the upload
                }));
            } catch (error) {
                console.error('Error uploading image:', error);
            } finally {
                setUploading(false);
            }
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check the formData to ensure image_url and other fields are present
        console.log('Submitting form data:', formData); 
    
        try {
            // Send the formData object directly as JSON
            await axios.put(`http://127.0.0.1:4000/api/updatehero_section/${heroData.id}`, formData, config);
            
            fetchHeroSection(); // Refetch the hero sections after update
            handleClose(); // Close the modal after submission
        } catch (error) {
            console.error('Error updating hero section:', error);
        }
    };
    

    return (
        <div className={`modal fade  editHeroModal editHeroModalId ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Update Hero Section</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="headline">Headline</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="headline"
                                    name="headline"
                                    value={formData.headline}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    className="form-control"
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="image_url">Image</label>
                                <input
                                    type="file"
                                    className="form-control-file"
                                    id="image_url"
                                    name="image_url"
                                    onChange={handleChange}
                                    accept="image/*"
                                />
                                {uploading && <div>Uploading image...</div>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}


function StorySectionModal({ show, handleClose, storyData, fetchStorySection }) {
    const [formData, setFormData] = useState({
        title: '',
        paragraph: '',
        image_url: ''
    });
    const [editorState, setEditorState] = useState(EditorState.createEmpty()); // For handling the editor's state
    const [uploading, setUploading] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (storyData) {
            // Convert HTML to editor state
            const blocksFromHtml = htmlToDraft(storyData.paragraph || '');
            const contentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks);
            const newEditorState = EditorState.createWithContent(contentState);
            
            setFormData({
                title: storyData.title || '',
                paragraph: storyData.paragraph || '',
                image_url: storyData.image_url || ''
            });
            setEditorState(newEditorState);
        }
    }, [storyData]);

    const handleChange = async (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file' && files.length > 0) {
            const file = files[0];
            const formData1 = new FormData();
            formData1.append('file', file);
            formData1.append('upload_preset', 'xlcnkdgy'); // Cloudinary preset
            setUploading(true);

            try {
                const uploadRes = await axios.post('https://api.cloudinary.com/v1_1/dik98v16k/image/upload', formData1);
                const imageUrl = uploadRes.data.secure_url;

                setFormData((prevData) => ({
                    ...prevData,
                    image_url: imageUrl
                }));
            } catch (error) {
                console.error('Error uploading image:', error);
            } finally {
                setUploading(false);
            }
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    const handleEditorChange = (newState) => {
        setEditorState(newState);
        setFormData((prevData) => ({
            ...prevData,
            paragraph: draftToHtml(convertToRaw(newState.getCurrentContent())) // Convert editor state to HTML
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://127.0.0.1:4000/api/updatestory_section/${storyData.id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchStorySection();
            handleClose();
        } catch (error) {
            console.error('Error updating story section:', error);
        }
    };

    return (
        <div className={`modal editStoryModal  fade ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Update Story Section</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="paragraph">Paragraph</label>
                                <div className="editor-container">
                                    <Editor
                                        editorState={editorState}
                                        toolbarClassName="toolbar-class"
                                        wrapperClassName="wrapper-class"
                                        editorClassName="editor-class"
                                        onEditorStateChange={handleEditorChange} // Handle changes in editor
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="image_url">Image</label>
                                <input
                                    type="file"
                                    className="form-control-file"
                                    id="image_url"
                                    name="image_url"
                                    onChange={handleChange}
                                    accept="image/*"
                                />
                                {uploading && <div>Uploading image...</div>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Modals = {
    HeroSectionModal,
    StorySectionModal,
  };
  
  // Export the variable
  export default Modals;