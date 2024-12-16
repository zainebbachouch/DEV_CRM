import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import '../../style/viewsStyle/profile.css';
import { RiDeleteBinLine } from "react-icons/ri";





function Profile() {
    const { id } = useParams();
    const [filterActive, setFilterActive] = useState(1); // Default to account setting
    const [profileData, setProfileData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState('');
    const [photo_employe, setEmploye] = useState(0)
    const [photo_client, setClient] = useState(0)
    const [photo_admin, setAdmin] = useState(0)
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const [notifications, setNotifications] = useState([]);
    const [searchCriteria, setSearchCriteria] = useState({
        startDate: '',
        endDate: '',
        message: ''
    });










    const config = useMemo(() => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    }), [token]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                let response;
                if (role === 'admin') {
                    response = await axios.get(`http://127.0.0.1:4000/api/admin/${id}`, config);
                } else if (role === 'client') {
                    response = await axios.get(`http://127.0.0.1:4000/api/client/${id}`, config);
                } else if (role === 'employe') {
                    response = await axios.get(`http://127.0.0.1:4000/api/employe/${id}`, config);
                }

                setEmploye(response.data.photo_employe);
                setAdmin(response.data.photo_admin);
                setClient(response.data.photo_client);
                console.log('profiledta', response.data)
                const data = { ...response.data };
                setProfileData({
                    ...data,
                });
                console.log("admin", photo_admin)
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [role, config, id]);

    const handleFilterClick = (filter) => {
        setFilterActive(filter);
    };


    const updateProfileData = async (id) => {
        const formData = new FormData();
        for (const key in profileData) {
            formData.append(key, profileData[key]);
        }
        if (role === 'admin') {
            formData.append('photo_admin', photo_admin);
        } else if (role === 'client') {
            formData.append('photo_client', photo_client);
        } else if (role === 'employe') {
            formData.append('photo_employe', photo_employe);
        } try {
            let response;
            if (role === 'admin') {
                response = await axios.put(`http://127.0.0.1:4000/api/updateadmin/${id}`, profileData, config);
            } else if (role === 'client') {
                response = await axios.put(`http://127.0.0.1:4000/api/updateclient/${id}`, profileData, config);
            } else if (role === 'employe') {
                response = await axios.put(`http://127.0.0.1:4000/api/updateemploye/${id}`, profileData, config);
            }
            if (response.data.message.includes("information updated successfully")) {
                console.log("Profile updated successfully");
            }
        } catch (error) {
            console.error("Error updating profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (event) => {
        const { name, value, type, files } = event.target;

        if (type === 'file') {
            setSelectedFile(files[0]);
            console.log('file', files[0]);

            const formData1 = new FormData();
            formData1.append('file', files[0]);
            formData1.append('upload_preset', 'xlcnkdgy'); // nom de l'environnement cloud

            axios.post('https://api.cloudinary.com/v1_1/dik98v16k/image/upload/', formData1)
                .then(response => {
                    const imageUrl = response.data.secure_url;
                    localStorage.setItem("photo", imageUrl);

                    // Mettre à jour l'état de la photo en fonction du rôle
                    if (role === 'admin') {
                        setAdmin(imageUrl);
                        setProfileData((prevState) => ({
                            ...prevState,
                            ['photo_admin']: imageUrl,
                        }));
                    } else if (role === 'client') {
                        setClient(imageUrl);
                        setProfileData((prevState) => ({
                            ...prevState,
                            ['photo_client']: imageUrl,
                        }));
                    } else if (role === 'employe') {
                        setEmploye(imageUrl);
                        setProfileData((prevState) => ({
                            ...prevState,
                            ['photo_employe']: imageUrl,
                        }));
                    }

                    console.log(profileData);
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            setProfileData((prevState) => ({
                ...prevState,
                [name]: type === 'date' ? value.split('T')[0] : value,
            }));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return dateString.slice(0, 10);
    };





    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:4000/api/getNotification', config);
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [config]);

    const searchNotifications = useCallback(async (searchCriteria) => {
        setLoading(true);
        try {
            const { message, startDate, endDate } = searchCriteria;
            const params = {
                ...(message && { message }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            };

            const response = await axios.get('http://127.0.0.1:4000/api/searchNotifications', {
                ...config,
                params
            });
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error searching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [config]);

    useEffect(() => {
        if (Object.values(searchCriteria).some(value => value)) {
            searchNotifications(searchCriteria);
        } else {
            fetchNotifications();
        }
    }, [searchCriteria, searchNotifications, fetchNotifications]);

    const handleSearchChange = (event) => {
        const { name, value } = event.target;
        setSearchCriteria((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        searchNotifications(searchCriteria);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:4000/api/deleteNotification/${id}`, config);
            console.log('Notification deleted successfully');
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="d-flex">
            <SideBar />
            <div className="container-fluid flex-column">
                <TopBar />
                <div className="container-fluid p-2 ">
                    <div className="row m-0 p-0 dataContent ">
                        <div className="profile-card col-md-3 ">
                            <div className=''>
                                {role === 'admin' && photo_admin && (
                                    <img src={photo_admin} alt="Admin Photo" style={{ width: '200px', height: '200px' }} />
                                )}

                                {role === 'client' && photo_client && (
                                    <img src={photo_client} alt="Client Photo" style={{ width: '200px', height: '200px' }} />
                                )}

                                {role === 'employe' && photo_employe && (
                                    <img src={photo_employe} alt="Employe Photo" style={{ width: '200px', height: '200px' }} />
                                )}
                            </div>
                            <h2>{profileData.nom || ''} {localStorage.getItem('username')}</h2>
                            <p>You are {role}</p>
                            <hr />
                            <ul className="list-unstyled">
                                <li>Opportunities applied <span className="badge badge-primary">32</span></li>
                                <hr />
                                <li>Opportunities won <span className="badge badge-success">26</span></li>
                                <hr />
                                <li>Current opportunities <span className="badge badge-info">6</span></li>
                            </ul>
                            <hr />
                        </div>
                        <div className="col-md-9">
                            <ul className="nav nav-tabs" id="profileTabs" role="tablist">
                                <li
                                    className={`nav-link ${filterActive === 1 ? 'active' : ''}`}
                                    onClick={() => handleFilterClick(1)}
                                    role="tab"
                                >
                                    Account Settings
                                </li>
                                <li
                                    className={`nav-link ${filterActive === 2 ? 'active' : ''}`}
                                    onClick={() => handleFilterClick(2)}
                                    role="tab"
                                >
                                    Company Settings
                                </li>
                                <li
                                    className={`nav-link ${filterActive === 3 ? 'active' : ''}`}
                                    onClick={() => handleFilterClick(3)}
                                    role="tab"
                                >
                                    Notifications
                                </li>
                            </ul>
                            <div className="tab-content" id="profileTabsContent">
                                <div className={`tab-pane fade ${filterActive === 1 ? 'show active' : ''}`} role="tabpanel">
                                    <form className="form mt-4" encType="multipart/form-data">
                                        {role === 'admin' && (
                                            <div>
                                                <div className="row">
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="nom_admin">Nom</label>
                                                        <input type="text" className="form-control" id="nom_admin" name="nom_admin" value={profileData.nom_admin || ''} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="prenom_admin">Prénom</label>
                                                        <input type="text" className="form-control" id="prenom_admin" name="prenom_admin" value={profileData.prenom_admin || ''} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="email_admin">Email</label>
                                                        <input type="email" className="form-control" id="email_admin" name="email_admin" value={profileData.email_admin || ''} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="photo_admin">Photo</label>
                                                        <input type="file" className="form-control" id="photo_admin" name="photo_admin" accept="image/*" onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="telephone_admin">Téléphone</label>
                                                        <input type="tel" className="form-control" id="telephone_admin" name="telephone_admin" value={profileData.telephone_admin || ''} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="adresse_admin">Adresse</label>
                                                        <input type="text" className="form-control" id="adresse_admin" name="adresse_admin" value={profileData.adresse_admin || ''} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="date_de_naissance_admin">Date de naissance</label>
                                                        <input type="date" className="form-control" id="date_de_naissance_admin" name="date_de_naissance_admin" value={formatDate(profileData.date_de_naissance_admin)} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="genre_admin">Genre</label>
                                                        <select className="form-control" id="genre_admin" name="genre_admin" value={profileData.genre_admin || ''} onChange={handleInputChange}>
                                                            <option value="">Select Genre</option>
                                                            <option value="homme">Male</option>
                                                            <option value="femme">Female</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {role === 'client' && (
                                            <div>
                                                <div className="row">
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="nom_client">Nom</label>
                                                        <input type="text" className="form-control" id="nom_client" name="nom_client" value={profileData.nom_client || ''} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="prenom_client">Prénom</label>
                                                        <input type="text" className="form-control" id="prenom_client" name="prenom_client" value={profileData.prenom_client || ''} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="email_client">Email</label>
                                                        <input type="email" className="form-control" id="email_client" name="email_client" value={profileData.email_client || ''} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="photo_client">Photo</label>
                                                        <input type="file" className="form-control" id="photo_client" name="photo_client" accept="image/*" onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="telephone_client">Téléphone</label>
                                                        <input type="tel" className="form-control" id="telephone_client" name="telephone_client" value={profileData.telephone_client || ''} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="adresse_client">Adresse</label>
                                                        <input type="text" className="form-control" id="adresse_client" name="adresse_client" value={profileData.adresse_client || ''} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="date_de_naissance_client">Date de naissance</label>
                                                        <input type="date" className="form-control" id="date_de_naissance_client" name="date_de_naissance_client" value={formatDate(profileData.date_de_naissance_client)} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="genre_client">Genre</label>
                                                        <select className="form-control" id="genre_client" name="genre_client" value={profileData.genre_client || ''} onChange={handleInputChange}>
                                                            <option value="">Select Genre</option>
                                                            <option value="male">Male</option>
                                                            <option value="female">Female</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {role === 'employe' && (
                                            <div>
                                                <div className="row">
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="nom_employe">Nom</label>
                                                        <input type="text" className="form-control" id="nom_employe" name="nom_employe" value={profileData.nom_employe || ''} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="prenom_employe">Prénom</label>
                                                        <input type="text" className="form-control" id="prenom_employe" name="prenom_employe" value={profileData.prenom_employe || ''} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="email_employe">Email</label>
                                                        <input type="email" className="form-control" id="email_employe" name="email_employe" value={profileData.email_employe || ''} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="photo_employe">Photo</label>
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            id="photo_employe"
                                                            name="photo_employe"
                                                            onChange={handleInputChange}
                                                            accept="image/*"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="telephone_employe">Téléphone</label>
                                                        <input type="tel" className="form-control" id="telephone_employe" name="telephone_employe" value={profileData.telephone_employe || ''} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="adresse_employe">Adresse</label>
                                                        <input type="text" className="form-control" id="adresse_employe" name="adresse_employe" value={profileData.adresse_employe || ''} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="date_de_naissance_employe">Date de naissance</label>
                                                        <input type="date" className="form-control" id="date_de_naissance_employe" name="date_de_naissance_employe" value={formatDate(profileData.date_de_naissance_employe)} onChange={handleInputChange} />
                                                    </div>
                                                    <div className="form-group col-md-6">
                                                        <label htmlFor="genre_employe">Genre</label>
                                                        <select className="form-control" id="genre_employe" name="genre_employe" value={profileData.genre_employe || ''} onChange={handleInputChange}>
                                                            <option value="">Select Genre</option>
                                                            <option value="male">Male</option>
                                                            <option value="female">Female</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <button type="button" className="btn btn-primary mt-4" onClick={() => updateProfileData(id)}>Update</button>
                                    </form>
                                </div>
                                <div className={`tab-pane fade ${filterActive === 2 ? 'show active' : ''}`} role="tabpanel">
                                    <p>Company Settings content goes here...</p>
                                </div>
                                <div className={`tab-pane fade ${filterActive === 3 ? 'show active' : ''}`} role="tabpanel">
                                    <div>
                                        <form onSubmit={handleSearchSubmit} className="mb-3">
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
                                            <div className="mb-2">
                                                <label>Message:</label>
                                                <input
                                                    type="text"
                                                    name="message"
                                                    value={searchCriteria.message}
                                                    onChange={handleSearchChange}
                                                    className="form-control"
                                                    placeholder="Search by message"
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary">Search</button>
                                        </form>
                                        <div className="notification-profile ">
                                            {loading ? (
                                                <div>Loading...</div>
                                            ) : notifications.length > 0 ? (
                                                notifications.map((notification, index) => (
                                                    <div key={index} className="notification-item">
                                                        <p>{notification.message}</p>
                                                        <div onClick={() => handleDelete(notification.id)}>
                                                            <RiDeleteBinLine />
                                                        </div>
                                                        <span className="notification-timestamp">
                                                            {new Date(notification.date).toLocaleString()}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No notifications</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >

    );
}

export default Profile;
