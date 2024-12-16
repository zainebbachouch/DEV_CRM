import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './forgotPasswordStyle.module.css'; // Import CSS module
import { FiSend } from "react-icons/fi";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('employe'); // Ajout de l'état pour userType
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/api/forgot-password', { email, userType }); // Envoyer userType
            setMessage('Code de réinitialisation envoyé à votre e-mail');
            setTimeout(() => {
                navigate('/reset-password');
            }, 2000); // Redirection après 2 secondes
        } catch (error) {
            setMessage('Erreur lors de l\'envoi du code de réinitialisation');
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Mot de passe oublié</h2>
            <div className={styles.formContainer}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Entrez votre e-mail"
                            required
                            className={styles.inputField}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="userType" className={styles.label}>Type d'utilisateur</label>
                        <select
                            className={styles.inputField}
                            id="userType"
                            name="userType"
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                        >
                            <option value="">Sélectionnez le type</option>
                            <option value="employe">Employé</option>
                            <option value="client">Client</option>
                        </select>
                    </div>
                    <button type="submit" className={styles.submitButton}><FiSend></FiSend> Envoyer le code</button>
                </form>
                {message && <p className={styles.message}>{message}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;
