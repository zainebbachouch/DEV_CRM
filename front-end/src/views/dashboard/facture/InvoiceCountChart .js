import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, Tooltip, Legend);

const InvoiceCountChart = () => {
  const [chartData, setChartData] = useState({
    labels: ['Totaaaaaaaal'], // Étiquette par défaut
    datasets: [
      {
        label: 'Nombre de Factures',
        data: [], // Initialisez les données
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  });

  useEffect(() => {
    const fetchInvoiceCount = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:4000/api/invoice-count');
        const invoiceCountData = response.data.invoiceCount; // C'est un nombre maintenant

        setChartData({
          labels: ['Total'], // Une seule étiquette
          datasets: [
            {
              label: 'Nombre de Factures',
              data: [invoiceCountData], // Mettre le nombre dans un tableau
              fill: false,
              borderColor: 'rgba(75, 192, 192, 1)',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching invoice count:', error);
      }
    };

    fetchInvoiceCount();
  }, []);

  return (
    <div className="chart-container">
      <h2>Nombre de Factures</h2>
      <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default InvoiceCountChart;
