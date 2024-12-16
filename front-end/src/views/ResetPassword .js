import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/api/reset-password', { resetCode, newPassword });
            setMessage('Mot de passe réinitialisé avec succès');
        } catch (error) {
            setMessage('Erreur lors de la réinitialisation du mot de passe');
        }
    };

    return (
        <div>
            <h2>Réinitialiser le mot de passe</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Entrez le code de réinitialisation"
                    required
                />
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Entrez le nouveau mot de passe"
                    required
                />

                <button type="submit">Réinitialiser le mot de passe</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPassword;
