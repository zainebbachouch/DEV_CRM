import React, { useState, useEffect, useMemo, useContext } from 'react';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import '../../style/viewsStyle/adminstration.css';
import { UserPermissionsContext } from '../context/UserPermissionsPage';
import { Link } from 'react-router-dom';
import { FaDoorOpen } from "react-icons/fa6";

function Adminstration() {
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [filterActive, setFilterActive] = useState(2); // Default to Client List for employees
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const isAdmin = role === 'admin';
  const userPermissions = useContext(UserPermissionsContext);

  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  }), [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state

        if (role !== 'employe') {
          const employeeResponse = await axios.get('http://127.0.0.1:4000/api/employees', config);
          setEmployees(employeeResponse.data);
        }

        const clientResponse = await axios.get('http://127.0.0.1:4000/api/clients', config);
        setClients(clientResponse.data);

        if (role !== 'employe') {
          setFilterActive(1); // Default to Employee List for admins
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [config, role]);

  const handleFilterClick = (filter) => {
    setFilterActive(filter);
  };

  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    if (filterActive === 1) {
      setEmployees((prevEmployees) => {
        const updatedEmployees = [...prevEmployees];
        updatedEmployees[index] = { ...updatedEmployees[index], [name]: value };
        return updatedEmployees;
      });
    } else {
      setClients((prevClients) => {
        const updatedClients = [...prevClients];
        updatedClients[index] = { ...updatedClients[index], [name]: value };
        return updatedClients;
      });
    }
  };

  const updateEmployeeStatus = async (id, etat_compte) => {
    try {
      await axios.put(`http://127.0.0.1:4000/api/updateEmployeeStatus/${id}`, { etat_compte }, config);
      alert('Employee status updated successfully');
    } catch (error) {
      console.error('Error updating employee status:', error);
      alert('Failed to update employee status');
    }
  };

  const updateClientStatus = async (id, etat_compte) => {
    try {
      await axios.put(`http://127.0.0.1:4000/api/updateClientStatus/${id}`, { etat_compte }, config);
      alert('Client status updated successfully');
    } catch (error) {
      console.error('Error updating client status:', error);
      alert('Failed to update client status');
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:4000/api/employees/${id}`, config);
      setEmployees((prevEmployees) => prevEmployees.filter((employee) => employee.idemploye !== id));
      alert('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  const deleteClient = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:4000/api/deleteClient/${id}`, config);
      setClients((prevClients) => prevClients.filter((client) => client.idclient !== id));
      alert('Client deleted successfully');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.slice(0, 10);
  };

  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid  pageContent p-2">
          <div className='contentadminstrationWrap'>
            <div className="adminstrationNavWrap">
              <div className="adminstrationNav">
                <ul>
                  {role === 'admin' && (
                    <li
                      className={`${filterActive === 1 ? "active" : ""}`}
                      onClick={() => handleFilterClick(1)}
                    >
                      Employee List
                    </li>
                  )}
                  <li
                    className={`${filterActive === 2 ? "active" : ""}`}
                    onClick={() => handleFilterClick(2)}
                  >
                    Client List
                  </li>
                </ul>
                <div>
                  <h1>{filterActive === 1 ? 'Employee List' : 'Client List'}</h1>
                  {loading && <p>Loading...</p>}
                  {error && <p className="error-message">{error}</p>}
                  <div className='adminstrationrWrap w-100'>
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Photo</th>
                          <th>Telephone</th>
                          <th>Address</th>
                          <th>Date of Birth</th>
                          <th>Date of Registration</th>
                          <th>Gender</th>
                          <th>Status</th>
                          <th>Action</th>
                          <th>Read More</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterActive === 1
                          ? employees.map((employee, key) => (
                            <tr key={employee.idemploye}>
                              <td>{employee.idemploye}</td>
                              <td>{employee.nom_employe} {employee.prenom_employe}</td>
                              <td>{employee.email_employe}</td>
                              <td>
                                {employee.photo_employe ? (
                                  <img src={employee.photo_employe} alt="employee" style={{ width: '50px', height: '50px' }} />
                                ) : 'No Photo'}
                              </td>
                              <td>{employee.telephone_employe}</td>
                              <td>{employee.adresse_employe}</td>
                              <td>{formatDate(employee.datede_naissance_employe)}</td>
                              <td>{formatDate(employee.date_inscription_employe)}</td>
                              <td>{employee.genre_employe}</td>
                              <td>
                                <select
                                  className={employee.etat_compte}
                                  id="etat_compte"
                                  name="etat_compte"
                                  value={employee.etat_compte}
                                  onChange={(event) => handleInputChange(event, key)}
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </td>
                              <td>
                                <button className="btn btn-primary mr-2" onClick={() => updateEmployeeStatus(employee.idemploye, employee.etat_compte)}>Save</button>
                                <button className="btn btn-danger" onClick={() => deleteEmployee(employee.idemploye)}>Delete</button>
                              </td>
                              <td>
                                <Link to={`/Pageemployes/${employee.idemploye}/envoyeeMail/${employee.email_employe}`}>
                                  <FaDoorOpen />
                                </Link>
                              </td>
                            </tr>
                          ))
                          : clients.map((client, key) => (
                            <tr key={client.idclient}>
                              <td>{client.idclient}</td>
                              <td>{client.nom_client} {client.prenom_client}</td>
                              <td>{client.email_client}</td>
                              <td>
                                {client.photo_client ? (
                                  <img src={client.photo_client} alt="client" style={{ width: '50px', height: '50px' }} />
                                ) : 'No Photo'}
                              </td>
                              <td>{client.telephone_client}</td>
                              <td>{client.adresse_client}</td>
                              <td>{formatDate(client.datede_naissance_client)}</td>
                              <td>{formatDate(client.date_inscription_client)}</td>
                              <td>{client.genre_client}</td>
                              <td>
                                <select
                                  className={client.etat_compte}
                                  id="etat_compte"
                                  name="etat_compte"
                                  value={client.etat_compte}
                                  onChange={(event) => handleInputChange(event, key)}
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </td>
                              <td>
                                {(isAdmin || (userPermissions && userPermissions.statusClient === 1)) && (
                                  <button className="btn btn-primary mr-2" onClick={() => updateClientStatus(client.idclient, client.etat_compte)}>Save</button>
                                )}
                                {(isAdmin || (userPermissions && userPermissions.deleteClient === 1)) && (
                                  <button className="btn btn-danger" onClick={() => deleteClient(client.idclient)}>Delete</button>
                                )}
                              </td>
                              <td>
                                <Link to={`/Pageclients/${client.idclient}/envoyeeMail/${client.email_client}`}>
                                  <FaDoorOpen />
                                </Link>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adminstration;
