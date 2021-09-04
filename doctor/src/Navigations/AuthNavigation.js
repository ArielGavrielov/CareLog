import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Switch, Route } from "react-router-dom";
import { Context as AuthContext } from '../Context/AuthContext';
import logo from '../logo-1500X500.png';

// Screens
import Home from "../components/Home/home.component";
import Patients from '../components/Patients/patients.component';
import PatientDetails from '../components/PatientDetails/PatientDetails.component';

const AuthNavigation = () => {
    const { signout } = React.useContext(AuthContext);

    const routes = [
        {path: '/', component: Home, navLink: 'Home'},
        {path: '/patients', component: Patients, navLink: 'Patients'},
        {path: '/patient/:id', component: PatientDetails}
    ]

    return (
        <div>
            <Navbar bg='light' sticky='top' fixed='top'>
                <Container>
                    <Navbar.Toggle aria-controls='responsive-navbar-nav' />
                    <Navbar.Brand href="/">
                        <img
                            src={logo}
                            width="100"
                            height="30"
                            className="d-inline-block align-top"
                            alt="React Bootstrap logo"
                        />
                    </Navbar.Brand>
                    <Navbar.Collapse>
                        <Nav>
                            {routes.map((route, index) => {
                                if(route.navLink)
                                    return <Nav.Link key={route + index} href={route.path}>{route.navLink}</Nav.Link>
                                })}
                            <Nav.Link href='/signout'>Sign out</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Switch>
                {routes.map((route, index) => 
                    <Route key={route + index} exact path={route.path} component={route.component} />
                )}
                <Route path='/signout' render={() => {signout(); return null;}} />
            </Switch>
        </div>
    )
}

export default AuthNavigation;