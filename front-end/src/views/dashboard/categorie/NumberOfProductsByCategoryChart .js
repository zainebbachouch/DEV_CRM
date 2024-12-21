import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NumberOfProductsByCategoryChart = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [categories, setCategories] = useState([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:4000/api/number-of-products-by-category');
        setTotalProducts(response.data.total_products);
        setTotalCategories(response.data.total_categories);
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="number-of-products-by-category-chart">
      <h2>Number of Products by Category</h2>
      <input type="text" placeholder='search of categorie' />
      <p>Total Products: {totalProducts}</p>
      <p>Total Categories: {totalCategories}</p>
      <button type='button' className='btn btn-primary showListButton'  onClick={() => setShowList(!showList)}>
        {showList ? 'Hide List' : 'Show List'}
      </button>
      {showList && (
        <div className="category-list">
          {categories.map((item, index) => (
            <div key={index} className="category-item">
              <span className="category-name">{item.category}</span>
              <span className="product-count">{item.number_of_products}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NumberOfProductsByCategoryChart;
