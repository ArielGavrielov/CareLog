import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {Context as AuthContext } from '../../Context/AuthContext';
import "./Login.css";

export default function Login() {
  const { state, signin } = React.useContext(AuthContext);
  const [formState, setFormState] = React.useState({email: '', password: ''});
  
  function validateForm() {
    const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const passwordReg =/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/;
    return passwordReg.test(formState.password) && emailReg.test(formState.email);
  }

  React.useState(() => {
    return () => window.location.href = '/';
  }, [])

  function handleSubmit(event) {
    event.preventDefault();
    signin(formState).then((success) => {
      if(success) window.location.href = '/';
    }).catch((err) => console.log(err));

  }

  return (
    <div className="Login">
      <Form onSubmit={handleSubmit}>
        <Form.Group size="lg" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={formState.email}
            onChange={(e) => setFormState({...formState, email: e.target.value})}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={formState.password}
            onChange={(e) => setFormState({...formState, password: e.target.value})}
          />
        </Form.Group>
        {state.errorMessage ? <div><b style={{color: 'red'}}>{state.errorMessage}</b></div> : null}
        <Button block size="lg" type="submit" disabled={!validateForm()}>
          Login
        </Button>
      </Form>
    </div>
  );
}