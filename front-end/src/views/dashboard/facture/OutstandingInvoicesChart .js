import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const OutstandingInvoicesChart = () => {
    const [chartData, setChartData] = useState({
        labels: ['Factures Impayées', 'Montant Total des Factures Impayées', 'Factures Payées', 'Montant Total des Factures Payées'],
        datasets: [
            {
                data: [],
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
                borderWidth: 1,
            },
        ],
    });

    const [invoiceCount, setInvoiceCount] = useState(0); // State for the invoice count

    useEffect(() => {
        const fetchOutstandingInvoices = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:4000/api/outstanding-invoices');
                const { unpaidInvoiceCount, unpaidInvoiceTotal, paidInvoiceCount, paidInvoiceTotal } = response.data.outstandingInvoices;

                setChartData({
                    labels: ['Factures Impayées', 'Montant Total des Factures Impayées', 'Factures Payées', 'Montant Total des Factures Payées'],
                    datasets: [
                        {
                            data: [unpaidInvoiceCount, unpaidInvoiceTotal, paidInvoiceCount, paidInvoiceTotal],
                            backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)'],
                            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
                            borderWidth: 1,
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching outstanding invoices:', error);
            }
        };

        const fetchInvoiceCount = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:4000/api/invoice-count');
                setInvoiceCount(response.data.invoiceCount); // Set the invoice count
            } catch (error) {
                console.error('Error fetching invoice count:', error);
            }
        };

        fetchOutstandingInvoices();
        fetchInvoiceCount(); // Call to fetch the invoice count
    }, []);

    return (
        <div className="chart-container">
            <h2>Factures Impayées et Payées</h2>
            <h3>Nombre total de factures: {invoiceCount}</h3>
            <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
    );
};

export default OutstandingInvoicesChart;
