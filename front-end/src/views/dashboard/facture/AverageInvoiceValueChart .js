import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register necessary elements with ChartJS
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const AverageInvoiceValueChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Valeur Moyenne des Factures',
        data: [],
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  });
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    const fetchAverageInvoiceValue = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:4000/api/averageinvoicevalue?period=${period}`);
        const { averageInvoiceValues } = response.data;

        const labels = averageInvoiceValues.map(item => item.period);
        const data = averageInvoiceValues.map(item => item.averageInvoiceValue);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Valeur Moyenne des Factures',
              data,
              fill: false,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching average invoice value:', error);
      }
    };

    fetchAverageInvoiceValue();
  }, [period]);

  const getXAxisTitle = () => {
    switch (period) {
      case 'daily':
        return 'Jour';
      case 'monthly':
        return 'Mois';
      case 'yearly':
        return 'Année';
      default:
        return 'Période';
    }
  };

  return (
    <div className="chart-container  ">
       <h2>Valeur Moyenne des Factures</h2>
      <div className=''>
        <label>
          Period :
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>
      </div> 

      
       <Line
        data={chartData} 
        className='lineChart'
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Montant (€)',
              },
            },
            x: {
              type: 'category', // Ensuring the x-axis is treated as categorical
              title: {
                display: true,
                text: getXAxisTitle(),
              },
              ticks: {
                color: 'red', // Set the color of the x-axis labels
              },
            },
          },
        }}
      /> 
 
      </div>
      
    
  );
};

export default AverageInvoiceValueChart;
