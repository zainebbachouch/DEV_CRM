import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';

const ProductPredictionForm = () => {
    const [formData, setFormData] = useState({
        nom_produit: '',
        date: '',
    });
    const [existingData, setExistingData] = useState(null);  // For existing sales/quantities
    const [prediction, setPrediction] = useState(null);  // For predicted sales/quantities
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const config = useMemo(() => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }), [token]);

    // Handle form input change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submit to fetch existing and predicted data
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Fetch existing sales and quantities for the product
            const existingDataResponse = await axios.post('http://127.0.0.1:4000/api/get-existing-data', {
                nom_produit: formData.nom_produit
            }, config);

            setExistingData(existingDataResponse.data);

            // Fetch predicted sales and quantities
            const predictionResponse = await axios.post('http://127.0.0.1:5000/api/predict_sales', {
                product_name: formData.nom_produit,
                date: formData.date,
            }, config);

            if (predictionResponse.data.error) {
                setError(predictionResponse.data.error);
            } else {
                setPrediction(predictionResponse.data);
            }
        } catch (err) {
            setError('Error fetching data or prediction');
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data for existing and predicted sales/quantities
    const chartData = (existingData && prediction) ? {
        labels: [formData.date],  // Single date for comparison
        datasets: [
           
            {
                label: 'Predicted Sales',
                data: [prediction.predicted_sales],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
            },
            {
                label: 'Predicted Quantities',
                data: [prediction.predicted_quantities],
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
                borderColor: 'rgba(255, 206, 86, 1)',
            },
        ],
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1000, // Adjust based on your data
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Prediction Date',
                },
            },
        },
    };
    const chartData1 = (existingData && prediction) ? {
        labels: [formData.date],  // Single date for comparison
        datasets: [
            {
                label: 'Existing Sales',
                data: [existingData.total_revenue],  // Fix the existing sales data to show revenue
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
            },
            
            {
                label: 'Existing Quantities',
                data: [existingData.total_quantity],  // Fix the existing quantities data
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
            },
           
        ],
    } : null;

    const chartOptions1 = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1000, // Adjust based on your data
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Prediction Date',
                },
            },
        },
    };
    return (
        <div>
            <h2>Product Sales Prediction</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Product Name:</label>
                    <input
                        type="text"
                        name="nom_produit"
                        value={formData.nom_produit}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Date:</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="buttonContainer d-flex mt-2 justify-content-center">
                    <button type="submit" className='btn btn-primary' id='predictSalesBtn' disabled={loading}>
                        {loading ? 'Loading...' : 'Predict Sales'}
                    </button>
                </div>

            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {prediction && existingData && (
                <div>
                    <h3>Prediction Results:</h3>
                    <div className="d-flex justify-content-center">
                        <p><strong>Product Name : </strong>{prediction.product_name}</p>
                    </div>
                    <div className="d-flex column-gap-5"> 
                        <p><strong>Date: </strong>{prediction.date}</p>
                        <p><strong>Existing Sales: </strong>{existingData.total_revenue}</p>
                        <p><strong>Existing Quantities:</strong> {existingData.total_quantity}</p>
                    </div>
                    <div className="d-flex column-gap-5">
                    <p><strong>Predicted Sales: </strong>{prediction.predicted_sales}</p>
                    <p><strong>Predicted Quantities: </strong>{prediction.predicted_quantities}</p>
                    </div>
 
                </div >
    )
}

{/* Render the chart below the prediction result */ }
<div className="row justify-content-between">
<div className="col-6">
{
    chartData && (
        <div style={{ height: '300px', width: '100%' }}>
            <Bar data={chartData1} options={chartOptions1} />
        </div>
    )
}
</div>
<div className="col-6">
{
    chartData && (
        <div style={{ height: '300px', width: '100%' }}>
            <Bar data={chartData} options={chartOptions} />
        </div>
    )
}
</div>

</div>

        </div >
    );
};

export default ProductPredictionForm;
