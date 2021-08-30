import { Navbar, Nav, Container } from 'react-bootstrap';
import Login from "../components/Login/login.component";
import { Switch, Route } from "react-router-dom";

const UnAuthNavigation = () => {
    return (
        <div>
            <Navbar>
                <Container>
                    <Navbar.Toggle aria-controls='responsive-navbar-nav' />
                    <Navbar.Collapse>
                        <Nav>
                            <Nav.Link href='/'>Sign In</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Switch>
                <Route exact path='/' component={Login} />
            </Switch>
        </div>
    )
}

export default UnAuthNavigation;