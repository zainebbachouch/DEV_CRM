import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement, // Changez LineElement par BarElement
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const InvoiceAmountDistributionChart = () => {
  const [chartData, setChartData] = useState({
    labels: [], // Initialisez les étiquettes
    datasets: [
      {
        label: 'Répartition des Montants des Factures',
        data: [], // Initialisez les données
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchInvoiceAmountDistribution = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:4000/api/distribution');
        const distribution = response.data.distribution;

        // Transformation des données pour les graphiques
        const labels = distribution.map((bin) => `$${bin.binStart.toFixed(2)} - $${bin.binEnd.toFixed(2)}`);
        const data = distribution.map((bin) => bin.count);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Répartition des Montants des Factures',
              data,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching invoice amount distribution:', error);
      }
    };

    fetchInvoiceAmountDistribution();
  }, []);

  return (
    <div className="chart-container">
      <h2>Répartition des Montants des Factures</h2>
      <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default InvoiceAmountDistributionChart;
