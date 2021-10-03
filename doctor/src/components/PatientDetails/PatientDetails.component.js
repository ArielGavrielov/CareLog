import React from 'react';
import {Dropdown, DropdownButton, Spinner, Card, Container, Row, Col } from "react-bootstrap";
import { withRouter } from "react-router";
import * as Charts from 'react-chartjs-2';
import { CareLogAPI } from '../../API/CareLog';
import './sidebar.css';

const splitArrayForRows = (array, every) => {
    let splited = [];
    while(array.length > 0)
        splited.push(array.splice(0, every));
    return splited;
}

const PatientDetails = (props) => {
    const [patientData, setPatientData] = React.useState();
    const [medicinesProblems, setMedicinesProblems] = React.useState([]);
    const [error, setError] = React.useState(null);

    const unlink = async () => {
        let isConfirmed = window.confirm('Are you sure?');
        if(!isConfirmed) return;
        CareLogAPI.delete(`/patient/${props.match.params.id}/unlink`).then(({data}) => {
            window.location.href = '/patients';
        }).catch((err) => console.log(err));
    }

    React.useEffect(() => {
        if(!patientData) {
            CareLogAPI.get(`/patient/${props.match.params.id}`).then(({data}) => {
                setPatientData(data);
                if(data['hasMedicinesComments'])
                    setMedicinesProblems(splitArrayForRows(Object.keys(data.medicines), 4));

                console.log(data);
            }).catch((err) => {
                console.log(err);
                setError(err.response.data.error);
            })
        }
    }, [props.match.params.id, patientData]);

    console.log(medicinesProblems);
    const indicesName = {
        blood: 'Blood pressure',
        pulse: 'Pulse rate',
        oxygen: 'Oxygen situration',
        bodyheat: 'Body heat'
    }

    if(error) return <div>
        <h1>Error</h1>
        <b>{error}</b>
    </div>
    if(!patientData) return <div className='center'>
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    </div>;
    return (
        <div>
            <div class="sidebar">
                <DropdownButton id="dropdown-basic-button" title="Actions">
                    <Dropdown.Item href="#/notification">Send notification</Dropdown.Item>
                    <Dropdown.Item href="#/add-medicine">Add medicine</Dropdown.Item>
                </DropdownButton>
                <a href="#contact">Contact</a>
                <a href="#" onClick={unlink}>Un link</a>
            </div>
        <div class='content'>
            <h1>Patient {patientData['firstname']} {patientData['lastname']}</h1>
            {(patientData['hasIndicesComments'] || patientData['hasFeelingsComments'] || patientData['hasMedicinesComments']) && <Container>
                <h2>Last month comments</h2>
                { patientData.indices && patientData['hasIndicesComments'] ? <Card style={{marginBottom: 10}}>
                        <Card.Header>Exceptional indices</Card.Header>
                        <Row style={{paddingTop: 10}}>
                        {
                        Object.keys(patientData.indices).map((indiceType) => (
                            <Col sm>
                                <Card style={{height: 200}}>
                                    <Card.Header>{indicesName[indiceType]}</Card.Header>
                                    <Card.Body style={{overflow: 'scroll'}}>
                                        <ul>
                                            {
                                                patientData.indices[indiceType].map((comment, i) => <li key={`item_${i}`}><p style={{fontSize: 12, color: 'red'}}>{comment}</p></li>)
                                            }
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    }
                    </Row>
                </Card> : null }
                {medicinesProblems.length > 0 ? <Card style={{marginBottom: 10}}>
                    <Card.Header>Medicines problems</Card.Header>
                    {
                        medicinesProblems.map((rowMedicines) => (
                            <Row style={{paddingTop: 10}}>
                                {
                                    rowMedicines.map((medicineName) => (
                                        <Col sm>
                                            <Card style={{height: 200}}>
                                                <Card.Header>{medicineName}</Card.Header>
                                                <Card.Body style={{overflow: 'scroll'}}>
                                                    <ul>
                                                        {
                                                            patientData.medicines[medicineName].map((comment, i) => <li key={`item_${i}`}><p style={{fontSize: 12, color: 'red'}}>{comment}</p></li>)
                                                        }
                                                    </ul>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))
                                }
                            </Row>
                        ))
                    }
                </Card>: null}
                {patientData.feelings && patientData['hasFeelingsComments'] ? <>
                    <Card style={{height: 200}}>
                        <Card.Header>Feeling bad</Card.Header>
                        <Card.Body style={{overflow: 'scroll'}}>
                            <ul>
                                {patientData.feelings.map((comment, i) => 
                                    <li key={`feel_${i}`}><p style={{fontSize: 12, color: 'red'}}>{comment}</p></li>
                                )}
                            </ul>
                        </Card.Body>
                    </Card>
                </> : null }
            </Container> }
        </div>
        </div>
    )
}
const Dashboard = withRouter(PatientDetails);
export default Dashboard;