import React, { useState } from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import '../../style/viewsStyle/dashbored.css';
import Header from './HeaderDash';
import SalesSection from './SalesSection';
import CommandStatsChart from "./commandsCharts";
import InvoicesSection from './InvoicesSection';
import ProductsSection from './ProductsSection';
import { MdOutlineCrisisAlert } from "react-icons/md";
import { TbSitemap, TbFileInvoice } from "react-icons/tb";
import { FaChartBar } from "react-icons/fa";

function Dashbord() {
    const [selectedSection, setSelectedSection] = useState('sales'); // State for selected section

    return (
        <div className="d-flex">
            <SideBar />
            <div className="d-flex container-fluid m-0 p-0 flex-column">
                <TopBar />
                <div className="p-0 m-0 dashboard-content">
                    <Header />
                    
                    {/* Buttons to toggle sections */}
                    <div className="button-group container-fluid d-flex justify-content-center" style={{ textAlign: 'center', margin: '20px 0' }}>
                        <button
                            className={`btn ${selectedSection === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setSelectedSection('sales')}
                        >
                          <MdOutlineCrisisAlert className="mx-1" />  Sales Section
                        </button>
                        <button
                            className={`btn ${selectedSection === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setSelectedSection('invoices')}
                        >
                          <TbFileInvoice className='mx-1'/>
                          Invoices Section
                        </button>
                        <button
                            className={`btn ${selectedSection === 'products' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setSelectedSection('products')}
                        >
                            <TbSitemap className='mx-1'/>
                            Products Section
                        </button>
                        <button
                            className={`btn ${selectedSection === 'commands' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setSelectedSection('commands')}
                        >
                            <FaChartBar className='mx-1' />
                            Commands Stats
                        </button>
                    </div>
                    <div className="container-fluid d-flex justify-content-center">
                        {/* Conditionally render sections based on selectedSection */}
                        {selectedSection === 'sales' && <SalesSection />}
                        {selectedSection === 'invoices' && <InvoicesSection />}
                        {selectedSection === 'products' && <ProductsSection />}
                        {selectedSection === 'commands' && <CommandStatsChart />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashbord;
