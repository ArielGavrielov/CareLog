import React from 'react';
import './App.css';
import { Context as AuthContext } from './Context/AuthContext';
import AuthNavigation from './Navigations/AuthNavigation';
import UnAuthNavigation from './Navigations/UnAuthNavigation';

const  App = () => {
  const {state, restoreToken} = React.useContext(AuthContext);

  React.useEffect(() => {
    if(!state.token) {
      restoreToken();
    }
    // eslint-disable-next-line
  }, []);

  if(state.isLoading) return null;

  return (
    <div className="App">
      {state.token ? <AuthNavigation /> :
      <UnAuthNavigation /> }
    </div>
  );
}

export default App;