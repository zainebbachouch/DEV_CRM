import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';

const RevenueContributionByCategoryChart = ({ period }) => { // Destructure period from props
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:4000/api/revenue-contribution-by-category?period=${period}`); // Use template literals correctly
        const categories = response.data.map(item => item.category);
        const revenues = response.data.map(item => item.revenue);

        setChartData({
          labels: categories,
          datasets: [
            {
              label: 'Revenue Contribution',
              data: revenues,
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
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
      <Pie
        data={chartData}
        options={{
          title: {
            display: true,
            text: 'Revenue Contribution by Category',
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

export default RevenueContributionByCategoryChart;
