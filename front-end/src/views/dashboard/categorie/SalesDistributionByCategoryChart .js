import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesDistributionByCategoryChart = ({ period }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sales Distribution by Category',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchSalesDistribution = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:4000/api/sales-distribution-by-category?period=${period}`);
        const distribution = response.data.histogram;

        const labels = distribution.map((bin) => `${bin.binStart.toFixed(2)} - ${bin.binEnd.toFixed(2)}`);
        const data = distribution.map((bin) => bin.count);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Sales Distribution by Category',
              data,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching sales distribution:', error);
      }
    };

    fetchSalesDistribution();
  }, [period]);

  return (
    <div className="chart-container">
      <h2>Sales Distribution by Category</h2>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false
        }}
      />
    </div>
  );
};

export default SalesDistributionByCategoryChart;
