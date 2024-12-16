import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import "../../../style/viewsStyle/SalesChart.css"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register necessary elements with ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesChart = () => {
    const [averageSalesData, setAverageSalesData] = useState([]);
    const [topSellingData, setTopSellingData] = useState([]);
    const [salesTrendData, setSalesTrendData] = useState([]);
    const [unpaidProductsData, setUnpaidProductsData] = useState([]);
    const [period, setPeriod] = useState('monthly');
    const [showAverage, setShowAverage] = useState(true);
    const [showTopSelling, setShowTopSelling] = useState(true);
    const [showTrends, setShowTrends] = useState(true);
    const [showUnpaid, setShowUnpaid] = useState(true);

    const fetchData = async () => {
        try {
            const averageResponse = await axios.get(`http://127.0.0.1:4000/api/average-sales-price?period=${period}`);
            const topSellingResponse = await axios.get(`http://127.0.0.1:4000/api/top-selling-products?period=${period}`);
            const trendsResponse = await axios.get(`http://127.0.0.1:4000/api/sales-trends?period=${period}`);
            const unpaidResponse = await axios.get(`http://127.0.0.1:4000/api/unpaid-products?period=${period}`);



            setAverageSalesData(averageResponse.data.averageSalesPrice || []);
            setTopSellingData(topSellingResponse.data.topSellingProducts || []);
            setSalesTrendData(trendsResponse.data.salesTrends || []);
            setUnpaidProductsData(unpaidResponse.data.unpaidProducts || []);
        } catch (error) {
            console.error("Error fetching sales data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    // Combine labels from all datasets
    const labels = [...new Set([
        ...averageSalesData.map(item => item.period),
        ...topSellingData.map(item => item.period),
        ...salesTrendData.map(item => item.period),
        ...unpaidProductsData.map(item => item.period),
    ])];

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Average Sales Price',
                data: labels.map(label => {
                    const found = averageSalesData.find(item => item.period === label);
                    return found ? found.averagePrice : 0;
                }),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                hidden: !showAverage,
            },
            {
                label: 'Top Selling Products',
                data: labels.map(label => {
                    const found = topSellingData.find(item => item.period === label);
                    return found ? found.totalSold : 0;
                }),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                hidden: !showTopSelling,
            },
            {
                label: 'Sales Trends',
                data: labels.map(label => {
                    const found = salesTrendData.find(item => item.period === label);
                    return found ? found.totalSales : 0;
                }),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                hidden: !showTrends,
            },
            {
                label: 'Unpaid Products',
                data: labels.map(label => {
                    const found = unpaidProductsData.find(item => item.period === label);
                    return found ? found.unpaidProductsCount : 0;
                }),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                hidden: !showUnpaid,
            },
        ],
    };

    const getXAxisTitle = () => {
        switch (period) {
            case 'daily':
                return 'Days';
            case 'monthly':
                return 'Months';
            case 'yearly':
                return 'Years';
            default:
                return '';
        }
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    text: getXAxisTitle(),
                },
                ticks: {
                    color: 'red',
                },
            },
        },
    };

    return (
        <div className='salesChart'>
            <h2>Sales Chart</h2>
            {(salesTrendData.length > 0 || averageSalesData.length > 0 || topSellingData.length > 0 || unpaidProductsData.length > 0) ? (
                <Bar data={chartData} options={chartOptions} />
            ) : (
                <p>No data available for the selected period.</p>
            )}
            <div>
                <label>
                    <input
                        type="radio"
                        value="daily"
                        checked={period === 'daily'}
                        onChange={() => setPeriod('daily')}
                    />
                    Daily
                </label>
                <label>
                    <input
                        type="radio"
                        value="monthly"
                        checked={period === 'monthly'}
                        onChange={() => setPeriod('monthly')}
                    />
                    Monthly
                </label>
                <label>
                    <input
                        type="radio"
                        value="yearly"
                        checked={period === 'yearly'}
                        onChange={() => setPeriod('yearly')}
                    />
                    Yearly
                </label>
            </div>

        </div>
    );
};

export default SalesChart;
