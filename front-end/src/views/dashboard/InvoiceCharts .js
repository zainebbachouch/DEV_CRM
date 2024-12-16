import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const InvoiceCharts = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageInvoiceValue, setAverageInvoiceValue] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:4000/api/total-revenue');
        setTotalRevenue(response.data.totalResult[0].totalRevenue);
      } catch (error) {
        console.error('Error fetching total revenue:', error);
      }
    };

    const fetchAverageInvoiceValue = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:4000/api/average-invoice-value');
        setAverageInvoiceValue(response.data.averageInvoiceValue);
      } catch (error) {
        console.error('Error fetching average invoice value:', error);
      }
    };

    const fetchInvoiceCount = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:4000/api/invoice-count');
        setInvoiceCount(response.data.invoiceCount);
      } catch (error) {
        console.error('Error fetching invoice count:', error);
      }
    };

    fetchTotalRevenue();
    fetchAverageInvoiceValue();
    fetchInvoiceCount();
  }, []);

  const dataBar = {
    labels: ['Total Revenue', 'Average Invoice Value', 'Invoice Count'],
    datasets: [
      {
        label: 'Invoice Statistics',
        data: [totalRevenue, averageInvoiceValue, invoiceCount],
        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const optionsBar = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Invoice Statistics',
      },
    },
  };

  return <Bar data={dataBar} options={optionsBar} />;
};

export default InvoiceCharts;
