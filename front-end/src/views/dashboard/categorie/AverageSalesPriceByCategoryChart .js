import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const AverageSalesPriceByCategoryChart = ({ period }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:4000/api/average-sales-price-by-category?period=${period}`);

        // Ensure the keys match your backend response
        const categories = response.data.map(item => item.category);
        const avgPrices = response.data.map(item => item.average_price); // Make sure this key matches your backend response

        setChartData({
          labels: categories,
          datasets: [
            {
              label: 'Average Sales Price',
              data: avgPrices,
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, [period]); // Add period as a dependency to refetch when it changes

  return (
    <div>
      <Bar
        data={chartData}
        options={{
          title: {
            display: true,
            text: 'Average Sales Price by Category',
            fontSize: 25,
          },
          legend: {
            display: true,
            position: 'top',
          },
        }}
      />
    </div>
  );
};

export default AverageSalesPriceByCategoryChart;
