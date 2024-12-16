import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import "../../style/viewsStyle/authorization.css"

function AuthorizationList() {
  const [authorizations, setAuthorizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  useEffect(() => {
    const fetchAuthorizations = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:4000/api/getUserPermissions', config);
        setAuthorizations(response.data.permissions);
        console.log(response.data.permissions)
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchAuthorizations();
  }, [config]);

  const handleInputChange = (event, key) => {
    const { name, value } = event.target;
    console.log(`Name: ${name}, Value: ${value}`); // Log the name and value for verification
    setAuthorizations((prevState) => {
      const updatedAuthorizations = [...prevState];
      updatedAuthorizations[key] = {
        ...updatedAuthorizations[key],
        [name]: parseInt(value)
      };
      console.log(`Updated authorizations:`, updatedAuthorizations);
      return updatedAuthorizations;
    });
  };

  const updatestatusEmployesAutorisation = async (email_employe, updatedAuth) => {
    try {
      const dataToSend = {
        email_employe,
        deleteClient: updatedAuth.deleteClient ? 1 : 0,
        deleteFacture: updatedAuth.deleteFacture ? 1 : 0,
        deleteCommande: updatedAuth.deleteCommande ? 1 : 0,
        deleteProduit: updatedAuth.deleteProduit ? 1 : 0,
        deleteCategorie: updatedAuth.deleteCategorie ? 1 : 0,
        statusClient: updatedAuth.statusClient ? 1 : 0,
        addProduit: updatedAuth.addProduit ? 1 : 0,
        addCategorie: updatedAuth.addCategorie ? 1 : 0,
        updateFacture: updatedAuth.updateFacture ? 1 : 0,
        updateCommande: updatedAuth.updateCommande ? 1 : 0,
        updateProduit: updatedAuth.updateProduit ? 1 : 0,
        updateCategorie: updatedAuth.updateCategorie ? 1 : 0
      };

      console.log('Data to send:', dataToSend); // Log the data to verify it's correct

      const response = await axios.put('http://127.0.0.1:4000/api/updatestatusEmployesAutorisation', dataToSend, config);
      console.log('Command status updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating command status:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid actionsContainer p-2">
          <table className="table " style={{fontSize:"14px"}}>
            <thead>
              <tr>
                <th>Employe</th>
                <th>Identifiant</th>
                <th>Delete Client</th>
                <th>Delete Facture</th>
                <th>Delete Commande</th>
                <th>Delete Produit</th>
                <th>Delete Categorie</th>
                <th>Client Status</th>
                <th>Add Produit</th>
                <th>Add Categorie</th>
                <th>Update Facture</th>
                <th>Update Commande</th>
                <th>Update Produit</th>
                <th>Update Categorie</th>
                <th>Update </th>
              </tr>
            </thead>
            <tbody>
              {authorizations.map((auth, key) => (
                <tr key={auth.idautorisation}>
                  <td>{auth.email_employe.substr(0,auth.email_employe.indexOf("@"))}</td>
                  <td>{auth.idemploye}/{auth.idautorisation}</td>
                  <td>
                    <select
                      className={auth.deleteClient ? 'active' : 'inactive'}
                      id="deleteClient"
                      name="deleteClient"
                      value={auth.deleteClient ? '1' : '0'}
                      onChange={(event) => handleInputChange(event, key)}
                    >
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={auth.deleteFacture ? 'active' : 'inactive'}
                      id="deleteFacture"
                      name="deleteFacture"
                      value={auth.deleteFacture ? '1' : '0'}
                      onChange={(event) => handleInputChange(event, key)}
                    >
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={auth.deleteCommande ? 'active' : 'inactive'}
                      id="deleteCommande"
                      name="deleteCommande"
                      value={auth.deleteCommande ? '1' : '0'}
                      onChange={(event) => handleInputChange(event, key)}
                    >
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={auth.deleteProduit ? 'active' : 'inactive'}
                      id="deleteProduit"
                      name="deleteProduit"
                      value={auth.deleteProduit ? '1' : '0'}
                      onChange={(event) => handleInputChange(event, key)}
                    >
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={auth.deleteCategorie ? 'active' : 'inactive'}
                      id="deleteCategorie"
                      name="deleteCategorie"
                      value={auth.deleteCategorie ? '1' : '0'}
                      onChange={(event) => handleInputChange(event, key)}
                    >
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={auth.statusClient ? 'active' : 'inactive'}
                      id="statusClient"
                      name="statusClient"
                      value={auth.statusClient ? '1' : '0'}
                      onChange={(event) => handleInputChange(event, key)}
                    >
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={auth.addProduit ? 'active' : 'inactive'}
                      id="addProduit"
                      name="addProduit"
                      value={auth.addProduit ? '1' : '0'}
                      onChange={(event) => handleInputChange(event, key)}
                    >
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={auth.addCategorie ? 'active' : 'inactive'}
                      id="addCategorie"
                      name="addCategorie"
                      value={auth.addCategorie ? '1' : '0'}
                      onChange={(event) => handleInputChange(event, key)}
                    >
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>

                  <td>
                    <select
                      className={auth.updateFacture ? 'active' : 'inactive'}
                      id="updateFacture"
                      name="updateFacture"
                      value={auth.updateFacture ? '1' : '0'}
                      onChange={(event) => handleInputChange(event, key)}
                    >
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={auth.updateCommande ? 'active' : 'inactive'}
                      id="updateCommande"
                      name="updateCommande"
                      value={auth.updateCommande ? '1' : '0'}
                      onChange={(event) => handleInputChange(event, key)}
                    >
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={auth.updateProduit ? 'active' : 'inactive'}
                      id="updateProduit"
                      name="updateProduit"
                      value={auth.updateProduit ? '1' : '0'}
                      onChange={(event) => handleInputChange(event, key)}
                    >
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={auth.updateCategorie ? 'active' : 'inactive'}
                      id="updateCategorie"
                      name="updateCategorie"
                      value={auth.updateCategorie ? '1' : '0'}
                      onChange={(event) => handleInputChange(event, key)}
                    >
                      <option value="1">On</option>
                      <option value="0">Off</option>
                    </select>
                  </td>
                  <td>
                    <button
                    id="btnUpdate"
                      className="btn btn-primary mr-2" 
        
                      onClick={() => updatestatusEmployesAutorisation(auth.email_employe, auth)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AuthorizationList;