import React, { useState } from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import "../../style/viewsStyle/categorieStyle.css";
import DisplayCategories from './DisplayCategories';

function Categories() {
    const [categories, setCategories] = useState([]);

    const addCategory = (newCategory) => {
        setCategories([...categories, newCategory]);
    }
    //key={categories.length}

    return (
        <div className="d-flex">
          <SideBar />
          <div className="container-fluid flex-column">
            <TopBar />
            <div className="container-fluid p-2">
                  
                        <DisplayCategories categories={categories} setCategories={setCategories} addCategory={addCategory} />
                   
                </div>
            </div>
        </div>
    );
}

export default Categories;
