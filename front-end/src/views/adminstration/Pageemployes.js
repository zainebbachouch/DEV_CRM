import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { Link } from 'react-router-dom';
import "./pageEmploye.css"


function Pageemployes() {
  const { id, email_employe } = useParams();
  const [employeData, setEmployeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState(1);

  const navigate = useNavigate();
  useEffect(() => {
    if (loading && email_employe) {
      navigate(`/Pageemployes/${id}/envoyeeMail/${email_employe}`);
    }
  }, [loading, id, email_employe, navigate]);


  const token = localStorage.getItem('token');
  //const role = localStorage.getItem('role');

  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  }), [token]);

  useEffect(() => {
    const fetchEmployeData = async () => {
      try {
        let response;

        response = await axios.get(`http://127.0.0.1:4000/api/employebyid/${id}`, config);

        setEmployeData(response.data);
        console.log('lool', response.data);
      } catch (error) {
        console.error("Error fetching employe data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeData();
  }, [config, id]);





  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid p-2 employeContainerWrapper">
          <div className="row m-0 p-0">
            <div className="profile-card col-md-3">
              <img alt="Profile" className="profile-img" />
              <h2>Employe #{id}</h2>
              <p>employeData</p>
              {console.log("employedattttta", employeData)}
              <hr />
              {employeData.length > 0 && (
                <div className="clientInfo">
                  <div className="clientContactInfo">
                    <span>Contact info</span>

                    <div >
                      <div >Nom</div>
                      <div >{employeData[0].nom_employe}{employeData[0].prenom_employe}</div>
                    </div>

                    <div >
                      <div >Email address</div>
                      <div >{employeData[0].email_employe}</div>
                    </div>

                    <div >
                      <div >Phone number</div>
                      <div >{employeData[0].telephone_employe}</div>
                    </div>
                    <div >
                      <div >Address</div>
                      <div >{employeData[0].adresse_employe}</div>
                    </div>
                    <div >
                      <div >Date of Birth</div>
                      <div >{employeData[0].datede_naissance_employe}</div>
                    </div>
                    <div >
                      <div >Date of Registration</div>
                      <div >{employeData[0].date_inscription_employe}</div>
                    </div>
                    <div >
                      <div >Gender</div>
                      <div >{employeData[0].genre_employe}</div>
                    </div>
                    <div >
                      <div >Account Status</div>
                      <div >{employeData[0].etat_compte}</div>
                    </div>
                  </div>
                </div>

              )}
            </div>
            <div className="col-md-9">
              <ul className="nav nav-tabs" id="profileTabs" role="tablist">
                <li className="nav-item">
                  <Link
                    className={`nav-link ${filterActive === 1 ? 'active' : ''}`}
                    to={employeData[0].email_employe ? `/Pageemployes/${id}/envoyeeMail/${employeData[0].email_employe}` : `/Pageemployes/${id}/envoyeeMail`} role="tab"
                    onClick={() => setFilterActive(1)}
                  >
                    messenger
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${filterActive === 2 ? 'active' : ''}`}
                    to={`/Pageemployes/${id}/makecall`}
                    role="tab"
                    onClick={() => setFilterActive(2)}
                  >
                    company list
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${filterActive === 3 ? 'active' : ''}`}
                    to={`/Pageemployes/${id}/historique`}
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

      </div></div>
  )
}

export default Pageemployes
