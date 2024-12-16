import React, { createContext, useReducer, useContext } from 'react';

const NotificationContext = createContext();

const notificationsReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_NOTIFICATION':
            return {
                notifications: [action.payload, ...state.notifications],
                unreadCount: state.unreadCount + 1
            };
        case 'MARK_AS_READ':
            return {
                ...state,
                unreadCount: 0
            };
        case 'SET_NOTIFICATIONS':
            return {
                ...state,
                notifications: action.payload
            };
        case 'SET_UNREAD_COUNT':
            return {
                ...state,
                unreadCount: action.payload
            };
        default:
            return state;
    }
};

export const NotificationProvider = ({ children }) => {
    const [state, dispatch] = useReducer(notificationsReducer, {
        notifications: [],
        unreadCount: 0
    });

    return (
        <NotificationContext.Provider value={{ state, dispatch }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => useContext(NotificationContext);
