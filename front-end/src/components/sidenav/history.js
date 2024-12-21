import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { RiDeleteBinLine } from "react-icons/ri";

function Historyy() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    description_action: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }), [token]);

  // Function to fetch history based on search criteria and page
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(role === 'client' && { client_idclient: id }),
        ...(role === 'employe' && { employe_idemploye: id }),
        ...(role === 'admin' && { admin_idadmin: id }),
        ...searchCriteria
      };

      const response = await axios.get('http://127.0.0.1:4000/api/history', { ...config, params });
      setHistory(response.data.historique);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, [config, itemsPerPage, currentPage, searchCriteria, role, id]);

  // Trigger fetchHistory whenever searchCriteria or currentPage changes
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    setSearchCriteria(prevState => ({ ...prevState, [name]: value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDelete = async (idAction) => {
    try {
      await axios.delete(`http://127.0.0.1:4000/api/deleteHistory/${idAction}`, {
        ...config,
        params: {
          ...(role === 'client' && { client_idclient: id }),
          ...(role === 'employe' && { employe_idemploye: id }),
          ...(role === 'admin' && { admin_idadmin: id })
        }
      });
      fetchHistory(); // Refresh history after deletion
    } catch (error) {
      console.error('Error deleting history entry:', error);
    }
  };


  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid p-2">
          <h1>History</h1>
          <form className="mb-3">
            <div className="mb-2">
              <label>Description:</label>
              <input
                type="text"
                name="description_action"
                value={searchCriteria.description_action}
                onChange={handleSearchChange}
                className="form-control"
                placeholder="Search by description"
              />
            </div>
            <div className="mb-2">
              <label>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={searchCriteria.startDate}
                onChange={handleSearchChange}
                className="form-control"
              />
            </div>
            <div className="mb-2">
              <label>End Date:</label>
              <input
                type="date"
                name="endDate"
                value={searchCriteria.endDate}
                onChange={handleSearchChange}
                className="form-control"
              />
            </div>
          </form>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.idaction}>
                      <td>{entry.idaction}</td>
                      <td>{entry.description_action}</td>
                      <td>{new Date(entry.date_action).toLocaleDateString()}</td>
                      <td>
                        <RiDeleteBinLine
                          onClick={() => handleDelete(entry.idaction)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <nav>
                <ul className="pagination">
                  <li className="page-item">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="page-link"
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(totalPages).keys()].slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map((index) => (
                    <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button onClick={() => handlePageChange(index + 1)} className="page-link">
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className="page-item">
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="page-link"
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Historyy;
