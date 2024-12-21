import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TotalRevenueChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Chiffre d\'Affaires Total',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:4000/api/totalrevenue');
        console.log(response.data); // Log the entire response to check the structure

        const totalRevenue = response.data.totalRevenue || 0; // Access totalRevenue directly

        setChartData({
          labels: ['Total'], // Ajouter une étiquette par défaut
          datasets: [
            {
              label: 'Chifddfre d\'Affaires Total',
              data: [totalRevenue],
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching total revenue:', error);
      }
    };

    fetchTotalRevenue();
  }, []);

  return (
    <div className="chart-container">
      <h2>Chiffre d'Affaires Total</h2>
      <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default TotalRevenueChart;
