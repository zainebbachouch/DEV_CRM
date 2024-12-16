import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { Link } from 'react-router-dom';
import "../../style/viewsStyle/clientsPage.css"


function Pageclients() {
  const { id, email_client } = useParams();
  const [clientsData, setClientsData] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const [filterActive, setFilterActive] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    if (loading && email_client) {
      navigate(`/Pageclients/${id}/envoyeeMail/${email_client}`);
    }
  }, [loading, id, email_client, navigate]);



  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  }), [token]);

  useEffect(() => {
    const fetchClientsData = async () => {
      try {
        let response;

        response = await axios.get(`http://127.0.0.1:4000/api/clientbyid/${id}`, config);

        setClientsData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching employe data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientsData();
  }, [config, id]);





  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid manageContactDiv p-2">
          <div className="row m-0 p-0">
            <div className="profile-card col-md-3">
              <img alt="Profile" className="profile-img" />
              <h2>Client #{id}</h2>
              <p>Client Data</p>
              <hr />

              <div className="clientContactInfo">
                <span>Contact info</span>

                <div >
                  <div className="fw-bold">Nom</div>
                  <div >{clientsData[0].nom_client}{clientsData[0].prenom_client}</div>
                </div>

                <div >
                  <div className="fw-bold">Email address</div>
                  <div >{clientsData[0].email_client}</div>
                </div>

                <div >
                  <div className="fw-bold">Phone number</div>
                  <div >{clientsData[0].telephone_client}</div>
                </div>
                <div >
                  <div className="fw-bold">Address</div>
                  <div >{clientsData[0].adresse_client}</div>
                </div>
                <div>
                  <div className="fw-bold">Date of Birth</div>
                  <div >{clientsData[0].datede_naissance_client}</div>
                </div>
                <div >
                  <div className="fw-bold">Date of Registration</div>
                  <div >{clientsData[0].date_inscription_client}</div>
                </div>
                <div >
                  <div className="fw-bold">Gender</div>
                  <div >{clientsData[0].genre_client}</div>
                </div>
                <div >
                  <div className="fw-bold">Account Status</div>
                  <div >{clientsData[0].etat_compte}</div>
                </div>
              </div>
            </div>

            <div className="col-md-9">
              <ul className="nav nav-tabs" id="profileTabs" role="tablist">
                <li className="nav-item">
                  <Link className="nav-link"
                    to={clientsData[0].email_client ? `/Pageclients/${id}/envoyeeMail/${clientsData[0].email_client}` : `/Pageclients/${id}/envoyeeMail`}
                    role="tab"
                    onClick={() => setFilterActive(1)}
                  >
                    Envoyee Mail
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${filterActive === 2 ? 'active' : ''}`}
                    to={`/Pageclients/${id}/makecall`}
                    role="tab"
                    onClick={() => setFilterActive(2)}
                  >      Make Call
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${filterActive === 3 ? 'active' : ''}`}
                    to={`/Pageclients/${id}/historique`}
                    role="tab"
                    onClick={() => setFilterActive(3)}
                  >
                    Historique
                  </Link>
                </li>
              </ul>

              <div className="tab-content" id="profileTabsContent">
                <Outlet />
              </div>
            </div>



          </div>
        </div>

      </div>
    </div>
  )
}

export default Pageclients
