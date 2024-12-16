import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement, // Make sure to import PointElement
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const InvoiceFrequencyChart = ({ period }) => {
  const [chartData, setChartData] = useState({
    labels: [], // Initialization of labels
    datasets: [
      {
        label: 'Fréquence des Factures',
        data: [], // Initialization of data
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  });

  useEffect(() => {
    const fetchInvoiceFrequency = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:4000/api/invoice-frequency?period=${period}`);
        const invoiceFrequency = response.data.invoiceFrequency;

        const labels = invoiceFrequency.map(record => record.period);
        const data = invoiceFrequency.map(record => record.invoiceCount);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Fréquence des Factures',
              data,
              fill: false,
              borderColor: 'rgba(75, 192, 192, 1)',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching invoice frequency:', error);
      }
    };

    fetchInvoiceFrequency();
  }, [period]);

  return (
    <div className="chart-container " >
      <h2>Fréquence des Factures</h2>

      <Line  data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default InvoiceFrequencyChart;
