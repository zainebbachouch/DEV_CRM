import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,  // Ensure PointElement is imported
  Tooltip,
  Legend,
} from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const InvoiceTrendsChart = () => {
  const [chartData, setChartData] = useState({
    labels: [], // Initialization of labels
    datasets: [
      {
        label: 'Nombre de Factures Payées',
        data: [], // Initialization of data
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  });

  useEffect(() => {
    const fetchPaymentTimeliness = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:4000/api/payment-timeliness');

        // Assuming the API response structure is correct
        const { labels, data } = response.data;

        setChartData({
          labels,
          datasets: [
            {
              label: 'Nombre de Factures Payées',
              data,
              fill: false,
              borderColor: 'rgba(75, 192, 192, 1)',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching payment timeliness:', error);
      }
    };

    fetchPaymentTimeliness();
  }, []);

  return (
    <div className="chart-container">
      <h2>Tendances des Factures Payées</h2>
      <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default InvoiceTrendsChart;
