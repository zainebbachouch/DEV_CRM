import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import axios from 'axios';
import { MdDelete } from "react-icons/md";

import { CiSearch } from "react-icons/ci";
import { FaEye } from "react-icons/fa";

import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { Link } from 'react-router-dom';
import { UserPermissionsContext } from '../context/UserPermissionsPage';
import "../../style/viewsStyle/facture.css";

function Invoices() {
  const [factures, setFactures] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchCriteria, setSearchCriteria] = useState({
    etat_facture: '',
    methode_paiment_facture: '',
    statut_paiement_facture: '',
    dateType: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const isAdmin = role === 'admin';
  const userPermissions = useContext(UserPermissionsContext);

  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }), [token]);

  const searchFactures = useCallback(async (searchCriteria, page = 1) => {
    setLoading(true);
    try {
      const { dateType, startDate, endDate, ...criteria } = searchCriteria;
      const params = {
        ...criteria,
        page,
        limit: itemsPerPage,
        ...(dateType && startDate && endDate && { [`${dateType}_start`]: startDate, [`${dateType}_end`]: endDate })
      };

      const response = await axios.get('http://127.0.0.1:4000/api/searchFactures', {
        ...config,
        params,
      });
      setFactures(response.data.factures);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (err) {
      console.error('Error searching factures:', err);
    } finally {
      setLoading(false);
    }
  }, [config, itemsPerPage]);

  const fetchInvoices = useCallback(async (page = 1) => {
    console.log('Fetching invoices for page:', page);
    try {
      if (role === 'client') {
        const response = await axios.get('http://127.0.0.1:4000/api/getFactureOfClientAuthorized', config);
        setInvoices(response.data.facturesClient);
      } else {
        const response = await axios.get(`http://127.0.0.1:4000/api/getAllFactures?page=${page}&limit=${itemsPerPage}`, config);
        setFactures(response.data.factures);
        setTotalPages(Math.ceil(response.data.total / itemsPerPage));
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  }, [config, itemsPerPage, role]);

  useEffect(() => {
    if (Object.values(searchCriteria).some(value => value)) {
      searchFactures(searchCriteria, currentPage);
    } else {
      fetchInvoices(currentPage);
    }
  }, [searchCriteria, currentPage, searchFactures, fetchInvoices]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    searchFactures(searchCriteria, currentPage);
  };

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    setSearchCriteria(prevState => ({ ...prevState, [name]: value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      if (Object.values(searchCriteria).some(value => value)) {
        searchFactures(searchCriteria, newPage);
      } else {
        fetchInvoices(newPage);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:4000/api/deleteInvoice/${id}`, config);
      if (response.status === 200) {
        fetchInvoices(currentPage); // Fetch current page after deletion
      } else {
        console.error('Failed to delete invoice:', response.data.message);
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid p-2">
      <form onSubmit={handleSearchSubmit} className="mb-3">
        <div className="row mb-2">
          <div className="col-md-6">
            <label>Etat Facture:</label>
            <select name="etat_facture" value={searchCriteria.etat_facture} onChange={handleSearchChange} className="form-control">
              <option value="">All</option>
              <option value="enAttente">enAttente</option>
              <option value="payee">payee</option>
              <option value="enRetard">enRetard</option>
              <option value="annulee">annulee</option>
            </select>
          </div>
          <div className="col-md-6">
            <label>Methode Paiement:</label>
            <select name="methode_paiment_facture" value={searchCriteria.methode_paiment_facture} onChange={handleSearchChange} className="form-control">
              <option value="">All</option>
              <option value="Carte de crédit">Carte de crédit</option>
              <option value="Virement bancaire">Virement bancaire</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>

        <div className="row mb-2">
          <div className="col-md-6">
            <label>Paiement:</label>
            <select name="statut_paiement_facture" value={searchCriteria.statut_paiement_facture} onChange={handleSearchChange} className="form-control">
              <option value="">All</option>
              <option value="paye">paye</option>
              <option value="non_paye">non_paye</option>
            </select>
          </div>
          <div className="col-md-6">
            <label>Date Type:</label>
            <select name="dateType" value={searchCriteria.dateType} onChange={handleSearchChange} className="form-control">
              <option value="">Select Date Type</option>
              <option value="date_facture">Date Facture</option>
              <option value="date_echeance">Date Echeance</option>
            </select>
          </div>
        </div>

        <div className="row mb-2">
          <div className="col-md-6">
            <label>Start Date:</label>
            <input type="date" name="startDate" value={searchCriteria.startDate} onChange={handleSearchChange} className="form-control" />
          </div>
          <div className="col-md-6">
            <label>End Date:</label>
            <input type="date" name="endDate" value={searchCriteria.endDate} onChange={handleSearchChange} className="form-control" />
          </div>
        </div>
          <div className="buttonContainer d-flex justify-content-center">
          <button type="submit" className="searchButton"><CiSearch className='mx-2'> </CiSearch> Search</button>

          </div>
      </form>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="table table-responsive invoicesTable">
  <thead>
    <tr>
      {role !== 'client' && <th>ID</th>}
      <th>Date Facture</th>
      <th>Etat</th>
      <th>Montant</th>
      <th>Methode Paiement</th>
      <th>Date Echeance</th>
      <th>Paiement</th>
      {role !== 'client' && <th>Commande</th>}
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {(role === 'client' ? invoices : factures).map((invoice) => (
      <tr key={invoice.idfacture}>
        {role !== 'client' && <td>{invoice.idfacture}</td>}
        <td>{new Date(invoice.date_facture).toLocaleDateString()}</td>
        <td>{invoice.etat_facture}</td>
        <td>{invoice.montant_total_facture}</td>
        <td>{invoice.methode_paiment_facture}</td>
        <td>{new Date(invoice.date_echeance).toLocaleDateString()}</td>
        <td>{invoice.statut_paiement_facture}</td>
        {role !== 'client' && <td>{invoice.idcommande}</td>}
        <td>
          <button className=" showButtonInv">
            <Link to={`/invoices/${invoice.idcommande}`} className="text-white showButtonText">
            <FaEye className='mx-2'></FaEye>  Show
            </Link>
          </button>
          {isAdmin && (
            <button
              onClick={() => handleDelete(invoice.idfacture)}
              className="  deleteButtonInv  ms-2   "
            >
              <MdDelete className='mx-1'/>
              Delete 
            </button>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>

          )}
          <nav>
            <ul className="pagination">
              <li className="page-item">
                <button onClick={() => handlePageChange(currentPage - 1)} className="page-link" disabled={currentPage === 1}>
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button onClick={() => handlePageChange(index + 1)} className="page-link">
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className="page-item">
                <button onClick={() => handlePageChange(currentPage + 1)} className="page-link" disabled={currentPage === totalPages}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default Invoices;
