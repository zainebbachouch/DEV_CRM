import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CommandStatsChart = () => {
  const [stats, setStats] = useState({
    total_commands: 0,
    total_revenue: 0,
    average_command_value: 0,
    commands_in_processing: 0,
    commands_delivered: 0,
    commands_canceled: 0,
    home_delivery_count: 0,
    pickup_delivery_count: 0,
  });

  useEffect(() => {
    const fetchCommandStats = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:4000/api/command/getCommandStats/');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching command stats:', error);
      }
    };

    fetchCommandStats();
  }, []);

  const dataBar = {
    labels: [
      'Total Commands',
      'Total Revenue',
      'Avg Command Value',
      'Processing',
      'Delivered',
      'Canceled',
      'Home Delivery',
      'Pickup Delivery',
    ],
    datasets: [
      {
        label: 'Command Statistics',
        data: [
          stats.total_commands,
          stats.total_revenue,
          stats.average_command_value,
          stats.commands_in_processing,
          stats.commands_delivered,
          stats.commands_canceled,
          stats.home_delivery_count,
          stats.pickup_delivery_count,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(231, 76, 60, 0.2)',
          'rgba(46, 204, 113, 0.2)',
          'rgba(241, 196, 15, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(231, 76, 60, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(241, 196, 15, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const optionsBar = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Command Statistics',
      },
    },
  };

  return <Bar className="statsBarChart" data={dataBar} options={optionsBar} />;
};

export default CommandStatsChart;
