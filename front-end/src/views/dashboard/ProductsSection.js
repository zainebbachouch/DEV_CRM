import React, { useState } from 'react';
import TotalSalesByCategoryChart from './categorie/TotalSalesByCategoryChart ';
import AverageSalesPriceByCategoryChart from './categorie/AverageSalesPriceByCategoryChart ';
import SalesDistributionByCategoryChart from './categorie/SalesDistributionByCategoryChart ';
import RevenueContributionByCategoryChart from './categorie/RevenueContributionByCategoryChart ';
import NumberOfProductsByCategoryChart from './categorie/NumberOfProductsByCategoryChart ';
import ProductPredictionForm from '../product/ProductPredictionForm';

const ProductsSection = () => {
    const [frequencyPeriod, setFrequencyPeriod] = useState('daily');
    const [selectedCategoryChart, setSelectedCategoryChart] = useState('totalSalesByCategory');

    const chartsCategories = {
        totalSalesByCategory: { component: <TotalSalesByCategoryChart period={frequencyPeriod} />, title: 'Total Sales by Category' },
        averageSalesPriceByCategory: { component: <AverageSalesPriceByCategoryChart period={frequencyPeriod} />, title: 'Average Sales Price by Category' },
        salesDistributionByCategory: { component: <SalesDistributionByCategoryChart period={frequencyPeriod} />, title: 'Sales Distribution by Category' },
        revenueContributionByCategory: { component: <RevenueContributionByCategoryChart period={frequencyPeriod} />, title: 'Revenue Contribution by Category' },
    };

    return (
        <div className='productForms d-flex flex-column align-content-center ps-5'>
        <div className="performance-overview">
            <div className="row">
                {/* First Column: Frequency Selector and Category Chart */}
                <div className="col-6">
                    <select
                        value={frequencyPeriod}
                        onChange={(e) => setFrequencyPeriod(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                    {Object.keys(chartsCategories).map((chartKey) => (
                        <label key={chartKey}>
                            <input
                                type="radio"
                                value={chartKey}
                                checked={selectedCategoryChart === chartKey}
                                onChange={() => setSelectedCategoryChart(chartKey)}
                            />
                            {chartsCategories[chartKey].title}
                        </label>
                    ))}
                    <h2>{chartsCategories[selectedCategoryChart]?.title}</h2>
                    {chartsCategories[selectedCategoryChart]?.component}
                </div>
    
                {/* Second Column: NumberOfProductsByCategoryChart */}
                <div className="col-6">
                    <NumberOfProductsByCategoryChart />
                </div>
    
                
            </div>
            
        </div>
        <div className="performance-overview">
        <div className="row">
        {/* Third Column: ProductPredictionForm */}
        <div className="col-12">
            <ProductPredictionForm />
        </div></div>
    </div>
    </div>
    );
    
};

export default ProductsSection;
