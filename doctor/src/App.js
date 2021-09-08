import React from 'react';
import './App.css';
import { Context as AuthContext } from './Context/AuthContext';
import AuthNavigation from './Navigations/AuthNavigation';
import UnAuthNavigation from './Navigations/UnAuthNavigation';

const  App = () => {
  const { state, restoreToken } = React.useContext(AuthContext);

  React.useEffect(() => {
    if(!state.token) {
      restoreToken();
    }
    // eslint-disable-next-line
  }, []);

  React.useEffect(() => {
    const checkToken = () => {
      let token = localStorage.getItem('token');
      //if(!token && state.token)
      //  signout();
    }
    console.log("token", localStorage.getItem('token'));
    window.addEventListener('storage', checkToken)
  
    return () => {
      window.removeEventListener('storage', checkToken)
    }
  }, [])

  if(state.isLoading) return null;

  return (
    <div className="App wrapper">
      {state.token ? <AuthNavigation /> :
      <UnAuthNavigation /> 
    }
    </div>
  );
}

export default App;