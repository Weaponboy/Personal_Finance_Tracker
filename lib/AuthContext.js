import { onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../FirebaseConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe;
        try {
            unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                console.log('Auth state changed:', { loading, currentUser });
                setUser(currentUser);
                setLoading(false);
            });
        } catch (error) {
            console.error('Auth error:', error);
            setLoading(false);
        }
        return () => unsubscribe && unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);