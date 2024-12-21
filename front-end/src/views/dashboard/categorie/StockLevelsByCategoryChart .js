import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const StockLevelsByCategoryChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:4000/api/stock-levels-by-category');
        const categories = response.data.map(item => item.category);
        const stockLevels = response.data.map(item => item.stock_level);

        setChartData({
          labels: categories,
          datasets: [
            {
              label: 'Stock Levels',
              data: stockLevels,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Bar
        data={chartData}
        options={{
          title: {
            display: true,
            text: 'Stock Levels by Category',
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

export default StockLevelsByCategoryChart;
