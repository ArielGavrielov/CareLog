import Login from "../components/Login/login.component";
import logo from '../logo-1500X500.png';
import { Switch, Route } from "react-router-dom";

const UnAuthNavigation = () => {
    return (
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
            <div>
                <img src={logo} style={{width: 150, height: 50}} alt='CareLog'/>
                <h3>Doctor Dashboard simulation</h3>
                <Switch>
                    <Route exact path='/*' component={Login} />
                </Switch>
            </div>
        </div>
    )
}

export default UnAuthNavigation;