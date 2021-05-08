import React, { useEffect, useContext } from 'react';
import { Context as AuthContext } from '../Context/AuthContext';

export default AuthLoadingScreen = () => {
    const { tryLocalSignin } = useContext(AuthContext);
    useEffect(() => {
        tryLocalSignin();
        console.log("trylogin");
    }, []);
};