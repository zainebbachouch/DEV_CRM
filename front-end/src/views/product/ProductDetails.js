import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from "../../components/sidenav/TopNav";
import '../../style/productdetails.css'

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await axios.get(`http://127.0.0.1:4000/api/getProductById/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
      }
    }
    fetchProduct();
  }, [id]);

  if (!product) {
    return <p>Loading...</p>;
  }

  const handleAddToBasket = async productId => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      const response = await axios.post(
        'http://127.0.0.1:4000/api/AddtoCart',
        {
          produitId: productId,
          quantite: 1
        },
        config
      )
      console.log(response.data)
      const { currentCommandeId } = response.data
      localStorage.setItem('currentCommandeId', currentCommandeId)
    } catch (error) {
      console.error('Error adding product to basket:', error)
    }
  }

  return (
    <div className="d-flex">
      <SideBar />
      <div className="d-flex container-fluid m-0 p-0 flex-column">
        <TopBar />
        <div className="product-details-container">
          <div className="product-card">
            <img src={product.photo_produit} alt={product.nom_produit} className="product-imagee" />
            <div className="product-info">
              <h1 className="product-title">{product.nom_produit}</h1>
              <p className="product-description">{product.description_produit}</p>
              <p className="product-price">Price: <span>${product.prix_produit}</span></p>
              <p className="product-category">Category: <span>{product.categorie_idcategorie}</span></p>
              <p className="product-discount">Discount: <span>{product.remise_produit}%</span></p>
              <p className="product-dates">
                Added: <span>{product.date_ajout_produit}</span><br />
                Modified: <span>{product.date_modification_produit}</span>
              </p>
              <button className="btn btn-primary add-to-basket"
                onClick={() => handleAddToBasket(product.idproduit)}

              >Add to Basket</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
