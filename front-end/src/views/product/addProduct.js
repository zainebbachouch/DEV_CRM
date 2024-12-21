import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from "socket.io-client";
import "../../style/viewsStyle/modalsStyle.css"
import { IoMdAdd } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { CiEdit } from "react-icons/ci";


function AddProduct({ addProduct, selectedProduct, products, setProducts, setSelectedProduct, fetchProducts, categories, setCategories, loading, setLoading }) {
    const [formData, setFormData] = useState({
        nom_produit: '',
        prix_produit: '',
        description_produit: '',
        categorie_idcategorie: '',
        photo_produit: '',
        remise_produit: ''
    });

    const email = localStorage.getItem('email');
    const userid = localStorage.getItem('userId');
    const role = localStorage.getItem('role');


    const [uploaded, setUploaded] = useState("false")
    const [refresh, setRefresh] = useState("no")
    const [errors, setErrors] = useState({
        productNameError: '',
        productPriceError: '',
        productDescriptionError: '',
        productCategoryError: '',
        productImageError: '',
        productRemiseError: '',
        general: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const socket = io.connect("http://localhost:8000");

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const response = await axios.get("http://127.0.0.1:4000/api/getAllCategories", config);

            if (response.data.categories) {
                console.log("Fetched categories:", response.data.categories);
                setCategories(response.data.categories); // Ensure it's set to the array
            } else {
                console.error("Categories not found:", response.data);
                setCategories([]);
            }
        } catch (err) {
            console.error("Error fetching categories:", err.message);
            setErrors({ general: "An error occurred while fetching categories." });
        } finally {
            setLoading(false);
        }
    }, [setCategories, setLoading]);


    useEffect(() => {
        if (!categories.length) {
            fetchCategories(); // Call only if categories are not already loaded
        }

        if (selectedProduct) {
            setFormData({
                nom_produit: selectedProduct.nom_produit,
                prix_produit: selectedProduct.prix_produit || '',
                description_produit: selectedProduct.description_produit,
                categorie_idcategorie: selectedProduct.categorie_idcategorie, // Assurez-vous que cette valeur existe
                remise_produit: selectedProduct.remise_produit,
                photo_produit: selectedProduct.photo_produit
            });
        }
    }, [selectedProduct]); // Depend only on selectedProduct



    const handleChange = async (e) => {
        const { name, type, files } = e.target;

        if (type === 'file' && files.length > 0) {
            const file = files[0];
            console.log('fileproduit', file);

            const formData1 = new FormData();
            formData1.append('file', file);
            formData1.append('upload_preset', 'xlcnkdgy'); // Cloudinary environment name

            try {
                const response = await axios.post(
                    'https://api.cloudinary.com/v1_1/dik98v16k/image/upload/',
                    formData1
                );
                const imageUrl =await   response.data.secure_url;
                console.log('Image uploaded successfully:', imageUrl);
                setUploaded("true")
                // Update formData only after successful upload
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    [name]: imageUrl,
                }));
            } catch (error) {
                console.error('Error uploading file:', error);
                // Optionally, handle error feedback here
            }
        } else {
            const { value } = e.target;
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            };

            let response;

            if (selectedProduct) {
                // Update existing product
                if(uploaded=="true")
                {
                  response = await axios.put(
                    `http://127.0.0.1:4000/api/updateProduct/${selectedProduct.idproduit}`,
                    formData,
                    config
                );  
                }
                

                const updatedProducts = products.map((product) =>
                    product.idproduit === selectedProduct.idproduit ? response.data : product
                );
                setProducts(updatedProducts);
                setRefresh('yes');
            } else {
                // Create a new product
                response = await axios.post(
                    'http://127.0.0.1:4000/api/createProduct',
                    formData,
                    config
                );

                addProduct(response.data);
                socket.emit('newProduct', { ...response.data, email, userid, role });
                setFormData({
                    nom_produit: '',
                    prix_produit: '',
                    description_produit: '',
                    categorie_idcategorie: '',
                    photo_produit: '',
                    remise_produit: ''
                });
                setRefresh('yes');
            }

            document.getElementById('closeButton').click();
            setSuccessMessage(response.data.message);
            fetchProducts();
        } catch (err) {
            console.error('Error:', err);
            if (err.response) {
                setErrors(err.response.data);
            } else {
                setErrors({ general: 'An error occurred. Please try again later.' });
            }
        } finally {
            setLoading(false);
        }
    };





    return (
        <>
            {/* fade */}
            <div className="modal  addProductModal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{selectedProduct ? 'Update Product' : 'Add New Product'}</h5>

                        </div>
                        <div className="modal-body">
                            <div className="container">
                                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                {errors.general && <div className="alert alert-danger">{errors.general}</div>}
                                <form id="productForm" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="nom_produit">Product Name:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="nom_produit"
                                            name="nom_produit"
                                            value={formData.nom_produit}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="prix_produit">Price:</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="prix_produit"
                                            name="prix_produit"
                                            value={formData.prix_produit}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="description_produit">Description:</label>
                                        <textarea
                                            className="form-control"
                                            id="description_produit"
                                            name="description_produit"
                                            value={formData.description_produit}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="categorie_idcategorie">Category:</label>

                                        <select
                                            className="form-control formControlSelect"
                                            id="categorie_idcategorie"
                                            name="categorie_idcategorie"
                                            value={formData.categorie_idcategorie || ''}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((category) => (
                                                <option key={category.idcategorie} value={category.idcategorie}>
                                                    {category.nom_categorie}
                                                </option>
                                            ))}
                                        </select>

                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="remise_produit">Discount:</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="remise_produit"
                                            name="remise_produit"
                                            value={formData.remise_produit}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="photo_produit">Image:</label>
                                        <input
                                            type="file"
                                            className="form-control-file"
                                            id="photo_produit"
                                            name="photo_produit"
                                            onChange={handleChange}
                                            accept="image/*"

                                        />
                                    </div>
                                    <div className="modal-footer d-flex column-gap-2 justify-content-center">
                                        <button type="button" className="btn deleteButton" data-bs-dismiss="modal" id="closeButton"><MdCancel className='fs-4'></MdCancel> Cancel</button>
                                        {uploaded=="true" &&
                                        <button type="submit" className=" doubleFnButton">{selectedProduct ? <CiEdit className='fs-4'></CiEdit> : <IoMdAdd className='fs-4'></IoMdAdd>}{selectedProduct ? 'Update Product' : 'Add Product'}</button>
                                    }
                                        </div>
                                </form>
                                {loading && <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>}

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>


    );
}

export default AddProduct;
