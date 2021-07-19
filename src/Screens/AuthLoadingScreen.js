import React, { useEffect, useContext } from 'react';
import { Context as AuthContext } from '../Context/AuthContext';
import LoginScreen from './LoginScreen/LoginScreen';

export default AuthLoadingScreen = () => {
    const { tryLocalSignin } = useContext(AuthContext);
    
    useEffect(() => {
        tryLocalSignin();
    }, []);

    return null;
};