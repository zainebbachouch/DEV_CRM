import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../style/addCategoryStyle.css"
function AddCategorie({ addCategory, selectedCategory, setSelectedCategory, fetchCategories }) {
    const [formData, setFormData] = useState({
        nom_categorie: "",
        description: ""
    });
    const [errors, setErrors] = useState({
        nomCategorieError: "",
        descriptionError: ""
    });
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');
        try {
            const token = localStorage.getItem("token");
            const config = {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            if (selectedCategory) {
                const response = await axios.put(`http://127.0.0.1:4000/api/updateCategorie/${selectedCategory.idcategorie}`, formData, config);
                setSelectedCategory(response);
                setSuccessMessage('');
                document.getElementById("closeButton").click();
                fetchCategories();
            } else {
                const response = await axios.post("http://127.0.0.1:4000/api/createCategorie", formData, config);
                addCategory(response.data);
                setSuccessMessage(response.data.message);
                fetchCategories();
            }
            setFormData({
                nom_categorie: "",
                description: ""
            });
            setSuccessMessage("");
            document.getElementById("closeButton").click();
        } catch (err) {
            console.error("Error object:", err);
            if (err.response) {
                if (err.response.status === 403) {
                    setErrors({ ...errors, nomCategorieError: "Insufficient permissions to create/update a category." });
                } else {
                    setErrors({ ...errors, nomCategorieError: err.response.data });
                }
            } else {
                setErrors({ ...errors, nomCategorieError: "An error occurred. Please try again later." });
            }
        }
    };

    useEffect(() => {
        if (selectedCategory) {
            setFormData({
                nom_categorie: selectedCategory.nom_categorie,
                description: selectedCategory.description
            });
        } else {
            setFormData({
                nom_categorie: "",
                description: ""
            });
        }
    }, [selectedCategory]);

    const role = localStorage.getItem('role');

    return (
        role !== 'client' && (
            <div className="modal fade addCategoryForm" id="categoryModal" tabIndex="-1" role="dialog" aria-labelledby="categoryModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="categoryModalLabel">{selectedCategory ? 'Update Category' : 'Add New Category'}</h5>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="nom_categorie">Category Name:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nom_categorie"
                                        name="nom_categorie"
                                        value={formData.nom_categorie}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.nomCategorieError && <p className="error-message">{errors.nomCategorieError}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Description:</label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.descriptionError && <p className="error-message">{errors.descriptionError}</p>}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-danger" data-bs-dismiss="modal" id="closeButton">Cancel</button>
                                    <button type="submit" className="btn btn-primary">{selectedCategory ? 'Update Category' : 'Add Category'}</button>
                                </div>
                            </form>
                            {successMessage && <div className="alert alert-success mt-2">{successMessage}</div>}
                        </div>
                    </div>
                </div>
            </div>
        )
    );
}

export default AddCategorie;
