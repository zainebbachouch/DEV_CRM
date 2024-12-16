import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaRegPlusSquare, FaRegMinusSquare } from 'react-icons/fa';
import TopBar from "./TopNav"
import SideBar from "../sidebar/SideBar.js"
import "./TopNav.css"
import "../../style/viewsStyle/cartStyle.css"
function GetCartProducts() {
    const [cartProducts, setCartProducts] = useState([]);
    const [loading, setLoading] = useState(true);


    const fetchCartProducts = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.get('http://127.0.0.1:4000/api/getProductsInCart', config);
            setCartProducts(response.data.cartProductsResult);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching cart products:', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCartProducts();
    }, [fetchCartProducts]);
    /*
    const handleCompleteCommand = () => {
        const currentCommandeId = localStorage.getItem('currentCommandeId');
        if (currentCommandeId) {
          // Set the currentCommandeId in the localStorage
          localStorage.setItem('currentCommandeId', currentCommandeId);
      
          // Navigate to the CompleteCommand page
          window.location.href = "/completeCommand";
        } else {
          console.error('Current Commande ID not found in localStorage');
        }
      };*/
    const handleCompleteCommand = () => {

        const currentCommandeId = localStorage.getItem('currentCommandeId');


        if (currentCommandeId) {

            window.location.href = `/completeCommand?idcommand=${currentCommandeId}`;

        } else {
            console.error('Current Commande ID not found in localStorage');
        }
    };



    const handlePlusClick = async (product) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.post('http://127.0.0.1:4000/api/increaseProductQuantity', { produitId: product.idproduit }, config);


            await fetchCartProducts();
        } catch (error) {
            console.error('Error increasing product quantity:', error);
            alert('An error occurred while updating the product quantity. Please try again later.');
        }
    };

    const handleMinusClick = async (product) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.post('http://127.0.0.1:4000/api/decreaseProductQuantity', { produitId: product.idproduit }, config);


            await fetchCartProducts();
        } catch (error) {
            console.error('Error decreasing product quantity:', error);
            alert('An error occurred while updating the product quantity. Please try again later.');
        }
    };

    return (
        <>

            <div className="d-flex">
                <SideBar />
                <div className="d-flex container-fluid m-0 p-0 flex-column">
                    <TopBar />
                    <div className="container-fluid productsCartContainer p-2 m-0 ">
                        <div >
                            {loading ? (
                                <div className="cart-count">Loading...</div>
                            ) : cartProducts && cartProducts.length > 0 ? (
                                <>
                                    <div className="cart-count h3">Cart Count: {cartProducts.length}</div>
                                    <div className="card-container d-flex flex-wrap">
                                        {cartProducts.map((product, index) => (
                                            <div className="card" style={{ width: '18rem' }} key={index}>
                                                <img className="card-img-top" src={product.photo_produit} alt={product.nom_produit} />

                                                <div className="card-body">
                                                    <h5 className="card-title"><span className='label h5'> Nom Produit : </span>{product.nom_produit}</h5>
                                                    <p className="card-text"><span className='label h5'> Categorie Produit : </span>{product.description_produit}</p>
                                                    <p className="card-price"><span className='label h5'> Prix Produit : </span>{product.prix_produit}</p>
                                                    <p><span className='label h5'> Discount : </span>{product.remise_produit}%</p>
                                                    <div className="quantity-control d-flex justify-content-between align-items-baseline">
                                                        <button className="btn btn-primary d-flex align-items-center justify-content-center p-2">
                                                            <FaRegMinusSquare onClick={() => handleMinusClick(product)} />
                                                        </button>
                                                        <p> <span className="label ">Quantity :</span> {product.quantite_produit}</p>
                                                        <button className="btn btn-primary d-flex  justify-content-center align-items-center h5 p-2"><FaRegPlusSquare onClick={() => handlePlusClick(product)} /></button>


                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleCompleteCommand} className=" text-center mt-2 btn btn-success">Complete Command</button>
                                </>
                            ) : (
                                <div className="cart-count">Your cart is empty</div>
                            )}
                        </div>

                    </div>
                </div>

            </div>

        </>

    );
}

export default GetCartProducts;
