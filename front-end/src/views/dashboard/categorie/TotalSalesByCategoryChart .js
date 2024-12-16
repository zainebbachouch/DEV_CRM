import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const TotalSalesByCategoryChart = ({ period }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:4000/api/total-sales-by-category?period=${period}`);
        console.log('API Response:', response.data); // Log the API response

        // Extract categories and sales from the API response
        const categories = response.data.map(item => item.category);
        const sales = response.data.map(item => item.total_sales); // Ensure this key matches your backend response

        setChartData({
          labels: categories,
          datasets: [
            {
              label: 'Total Sales',
              data: sales,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, [period]); // Add period as a dependency

  return (
    <div>
      <Bar
        data={chartData}
        options={{
          title: {
            display: true,
            text: 'Total Sales by Category',
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

export default TotalSalesByCategoryChart;
