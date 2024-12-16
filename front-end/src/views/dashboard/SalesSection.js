import React from 'react';
import SalesChart from './product/SalesChart ';

const SalesSection = () => {
    return (
        <div className="row containerCards">
            <div className="salesChart">
                <SalesChart />
            </div>
        </div>
    );
};

export default SalesSection;
