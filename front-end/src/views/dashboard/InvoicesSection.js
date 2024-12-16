import React, { useState } from 'react';
import AverageInvoiceValueChart from './facture/AverageInvoiceValueChart .js';
import InvoiceAmountDistributionChart from './facture/InvoiceAmountDistributionChart ';
import InvoiceFrequencyChart from './facture/InvoiceFrequencyChart ';
import OutstandingInvoicesChart from './facture/OutstandingInvoicesChart ';
import InvoiceTrendsChart from './facture/InvoiceTrendsChart ';

const InvoicesSection = () => {
    const [frequencyPeriod, setFrequencyPeriod] = useState('daily');
    const [selectedChart, setSelectedChart] = useState('averageInvoiceValue');

    const charts = {
        averageInvoiceValue: { component: <AverageInvoiceValueChart />, title: 'Average Invoice Value' },
        invoiceAmountDistribution: { component: <InvoiceAmountDistributionChart />, title: 'Invoice Amount Distribution' },
        invoiceFrequency: {
            component: (
                <div className="chart">
                    <select
                        value={frequencyPeriod}
                        onChange={(e) => setFrequencyPeriod(e.target.value)}
                        style={{ marginBottom: '20px', width: 'fit-content' }}
                    >
                        <option value="default" disabled>Choose the mode</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                    <InvoiceFrequencyChart period={frequencyPeriod} />
                </div>
            ), title: 'Invoice Frequency'
        },
        outstandingInvoices: { component: <OutstandingInvoicesChart />, title: 'Outstanding Invoices' },
        invoiceTrends: { component: <InvoiceTrendsChart />, title: 'Invoice Trends' },
    };

    return (
        <div className="chartsContainer">
    <div className="chart-selection">
        {Object.keys(charts).map((chartKey) => (
            <button
                key={chartKey}
                className={`btn ${selectedChart === chartKey ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedChart(chartKey)}
            >
                {charts[chartKey].title}
            </button>
        ))}
    </div>
    <h2>{charts[selectedChart].title}</h2>
    <div className="charts d-flex justify-content-center">
        {charts[selectedChart].component}
    </div>
</div>

    );
};

export default InvoicesSection;
