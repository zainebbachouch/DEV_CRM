import React, { useEffect, useState, createContext } from 'react';
import axios from 'axios';

export const UserPermissionsContext = createContext();

function UserPermissionsPage({ children }) {
    const [userPermissions, setUserPermissions] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserPermissions = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const response = await axios.get('http://127.0.0.1:4000/api/getUserPermissions', config);
                console.log('Fetched Permissions:', response.data.permissions);
                setUserPermissions(response.data.permissions || {});
            } catch (error) {
                console.error('Error fetching user permissions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPermissions();
    }, []);

    useEffect(() => {
        console.log('User Permissions:', userPermissions);
    }, [userPermissions]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <UserPermissionsContext.Provider value={userPermissions}>
            {children}


        </UserPermissionsContext.Provider>
    );
}

export default UserPermissionsPage;
