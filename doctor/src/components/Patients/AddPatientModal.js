import React from "react";
import Modal from 'react-modal';
import { Button, Form } from "react-bootstrap";
import { CareLogAPI } from "../../API/CareLog";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './patients.css';

Modal.setAppElement('div');

const AddPatientModal = () => {
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [formState, setFormState] = React.useState({email: '', phone: ''});
    const [state, setState] = React.useState({error: null, success: null});

    const validateForm = () => {
        const phoneReg = /^\+?(972|0)(\/-)?0?([5]{1}[0-9]{1}\d{7})$/;
        const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailReg.test(formState.email) && phoneReg.test(formState.phone);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if(!validateForm()) return;
        CareLogAPI.post('/doctor/link-patient', formState)
        .then((res) => setState({success: res.data.message}))
        .catch((err) => setState({error: err.response.data.error}));
    }

    return (
        <div>
            <Button block size="lg" type="submit" onClick={() => setIsOpen(true)}>
                Add Patient
            </Button>
            <div id='modal' className='modal'>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={() => setIsOpen(false)}
                    style={style}
                    closeTimeoutMS={500}
                >
                    <h1>Link patient</h1>
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
                        <Form.Label>Phone</Form.Label>
                        <PhoneInput
                            country={'il'}
                            onlyCountries={['il']}
                            placeholder='Patient phone number'
                            value={formState.phone}
                            onChange={phone => setFormState({ ...formState, phone })}
                        />
                        </Form.Group>
                        {state.success ? <div><b style={{color: 'green'}}>{state.success}</b></div> : state.error ? <div><b style={{color: 'red'}}>{state.error}</b></div> : null}
                        <Button block size="lg" type="submit" disabled={!validateForm()}>
                            Send request to patient
                        </Button>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}

const style = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
}

export default AddPatientModal;