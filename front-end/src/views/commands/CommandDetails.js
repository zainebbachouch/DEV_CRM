import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import style from '../../style/viewsStyle/CommandDetails.module.css'; // Import the module CSS
import { CiPen } from "react-icons/ci";

function CommandDetails() {
    const { id } = useParams();
    const [commands, setCommands] = useState([]);
    const token = localStorage.getItem('token');

    const config = useMemo(() => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }), [token]);

    useEffect(() => {
        async function fetchCommandById() {
            try {
                const response = await axios.get(`http://127.0.0.1:4000/api/getCommandsByCommandId/${id}`, config);
                setCommands(response.data);
            } catch (err) {
                console.error('Error fetching CommandId:', err);
            }
        }
        fetchCommandById();
    }, [id, config]);

    const handleInputChange = (event, index) => {
        const { name, value } = event.target;
        setCommands(prevCommands => {
            const updatedCommands = [...prevCommands];
            updatedCommands[index] = { ...updatedCommands[index], [name]: value };
            return updatedCommands;
        });
    };

    const updateCommandStatus = async (idcommande, newStatus) => {
        try {
            const response = await axios.put('http://127.0.0.1:4000/api/updateStatus', { idcommande, newStatus }, config);
            console.log('Command status updated successfully:', response.data);
        } catch (error) {
            console.error('Error updating command status:', error);
        }
    };

    return (
        <div className="d-flex">
            <SideBar />
            <div className={`container-fluid ${style.containerFluid}`}>
                <TopBar />
                <div className={`container-fluid ${style.commandContainer}`}>
                    {commands.map((command, key) => (
                        <div className={style.commandCard} key={key}>
                            <h2>Command Details</h2>
                            <div className={style.commandDetails}>
                                <div className="commandDetail"><span> ID : </span>{command.idcommande}<br /></div>
                                <div className="commandDetail"><span>Date</span>{command.date_commande}<br /> </div> 
                                <div className="commandDetail"><span>Total Amount: </span>{command.montant_total_commande}<br /></div>
                                <div className="commandDetail"><span>Address: </span>{command.adresse_client}<br /></div>
                                <div className="commandDetail"><span>Payment Method:</span> {command.modepaiement_commande}<br /></div>
                                <div className="commandDetail"><span>Status:</span>
                                <select
                                    className={`form-control d-inline-block ${style.statusSelect}`}
                                    id="statut_commande"
                                    name="statut_commande"
                                    onChange={(event) => handleInputChange(event, key)}
                                >
                                    <option value="enattente">enattente</option>
                                    <option value="traitement">traitement</option>
                                    <option value="expédié">expédié</option>
                                    <option value="livré">livré</option>
                                </select>
                                <br /></div>
                                <div className="commandDetail"><span>Delivery Date:</span> {command.date_livraison_commande}<br /></div>
                                <div className="commandDetail"><span>Delivery Method: </span>{command.metho_delivraison_commande}<br /></div>
                                <div className="commandDetail"><span>Nom Client : </span>{command.nom_client}<br /></div>
                                <div className="commandDetail"><span>Prénom Client : </span>{command.prenom_client}<br /></div>
                                <div className="commandDetail"><span>Télephone Client : </span>{command.telephone_client}<br /></div>
                                <div className={style.buttonContainerF}>
                                <button
                                    className={` ${style.buttonContainerFButton}`}
                                    onClick={() => updateCommandStatus(command.idcommande, command.statut_commande)}
                                >
                                  <CiPen className="mx-1 penIcon fs-3"></CiPen>  Update
                                </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CommandDetails;
