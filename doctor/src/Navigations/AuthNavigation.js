import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Home from "../components/Home/home.component";
import { Switch, Route } from "react-router-dom";
import { Context as AuthContext } from '../Context/AuthContext';

const AuthNavigation = () => {
    const { signout } = React.useContext(AuthContext);

    return (
        <div>
            <Navbar>
                <Container>
                    <Navbar.Toggle aria-controls='responsive-navbar-nav' />
                    <Navbar.Collapse>
                        <Nav>
                            <Nav.Link href='/'>Home</Nav.Link>
                            <Nav.Link href='/signout'>Sign out</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Switch>
                <Route exact path='/' component={Home} />
                <Route exact path='/signout' render={() => {signout(); window.location.href = '/'; return null;}} />
            </Switch>
        </div>
    )
}

export default AuthNavigation;