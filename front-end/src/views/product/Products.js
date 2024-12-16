import React, { useState } from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from "../../components/sidenav/TopNav";
import DisplayProducts from './DisplayProducts';



function Products() {
    const [products, setProducts] = useState([]);
  

    const addProduct = (newProduct) => {
        setProducts([...products, newProduct]);
    }
/*
 <div className="d-flex">
        <SideBar />
        <div className="d-flex container-fluid m-0 p-0 flex-column">
        <TopBar  /> 
        <div className="container-fluid p-0 m-0">
        ....
        </div>

*/

    return (
        <>     
        <div className="d-flex">
        <SideBar />
        <div className="d-flex container-fluid m-0 p-0 flex-column">
        <TopBar  /> 
        <div className="container-fluid p-0 m-0">
            
                <div className="main-content">
                 
                        <DisplayProducts
                            products={products}
                            setProducts={setProducts}
                            addProduct={addProduct}
                                    />
                    
                </div>
            </div>
        </div>
        
        </div>  
           
        </>
    )
}

export default Products;
